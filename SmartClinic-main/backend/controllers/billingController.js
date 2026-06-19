const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const {
  notifyBillCreated,
  notifyBillPaymentRecorded,
  notifyOverdueBills,
} = require('../utils/notificationEvents');

function recompute(bill) {
  const totalAmount = (bill.items || []).reduce((s, i) => s + (Number(i.amount) || 0), 0) - (Number(bill.discount) || 0);
  bill.totalAmount = totalAmount;
  bill.balanceDue = Math.max(totalAmount - (Number(bill.paidAmount) || 0), 0);
  bill.paymentStatus = bill.balanceDue === 0 ? 'Paid' : (Number(bill.paidAmount) || 0) > 0 ? 'Partial' : 'Unpaid';
}

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.paymentStatus) {
      // Use regex for case-insensitive status matching
      filter.paymentStatus = new RegExp(`^${req.query.paymentStatus}$`, 'i');
    }
    
    // Add Search Logic
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { billId: regex },
        { notes: regex },
        { 'items.description': regex }
      ];
    }
    
    const bills = await Bill.find(filter)
      .populate('patientId', 'patientName name patientId')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
      
    // Optional: Filter by patient name in memory if search query exists
    let results = bills;
    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      results = bills.filter(b => {
        const name = (b.patientId?.patientName || b.patientId?.name || '').toLowerCase();
        const id = (b.billId || '').toLowerCase();
        return name.includes(search) || id.includes(search);
      });
    }

    return res.json({ success: true, count: results.length, bills: results });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
exports.getById = async (req, res) => {
  try {
    const b = await Bill.findById(req.params.id)
      .populate('patientId', 'patientName name patientId')
      .populate('doctorId', 'name specialization');
    if (!b) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.json({ success: true, bill: b });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const b = new Bill(req.body);
    recompute(b);
    await b.save();

    const patient = b.patientId ? await Patient.findById(b.patientId).lean() : null;
    await notifyBillCreated(b, patient?.patientName || patient?.name || 'Patient');

    return res.status(201).json({ success: true, bill: b });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const b = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!b) return res.status(404).json({ success: false, message: 'Bill not found' });
    recompute(b);
    await b.save();
    return res.json({ success: true, bill: b });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const b = await Bill.findByIdAndDelete(req.params.id);
    if (!b) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.json({ success: true, message: 'Bill deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const b = await Bill.findById(req.params.id);
    if (!b) return res.status(404).json({ success: false, message: 'Bill not found' });

    const amt = Number(req.body.amount || 0);
    b.paidAmount = (Number(b.paidAmount) || 0) + amt;
    b.transactions = b.transactions || [];
    b.transactions.push({
      amount: amt,
      method: req.body.paymentMethod,
      reference: req.body.reference,
      note: req.body.notes,
      paidAt: new Date(),
    });
    recompute(b);
    await b.save();

    const patient = b.patientId ? await Patient.findById(b.patientId).lean() : null;
    await notifyBillPaymentRecorded(b, patient?.patientName || patient?.name || 'Patient', amt);

    return res.json({ success: true, bill: b });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.autoOverdue = async (req, res) => {
  try {
    const q = await Bill.updateMany(
      { dueDate: { $lt: new Date() }, paymentStatus: { $in: ['Unpaid', 'Partial'] } },
      { paymentStatus: 'Overdue' }
    );

    await notifyOverdueBills(q.modifiedCount || 0);

    return res.json({ success: true, updated: q.modifiedCount || 0 });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.analytics = async (req, res) => {
  try {
    const bills = await Bill.find();
    let revenue = 0;
    let outstanding = 0;
    const monthly = {}; 
    const methods = {};

    bills.forEach(b => {
      const paid = Number(b.paidAmount) || 0;
      revenue += paid;
      outstanding += (Number(b.balanceDue) || 0);

      const d = b.invoiceDate || b.createdAt || new Date();
      const mKey = new Date(d).toISOString().slice(0, 7); // YYYY-MM
      monthly[mKey] = (monthly[mKey] || 0) + paid;

      const m = b.paymentMethod || 'Other';
      methods[m] = (methods[m] || 0) + paid;
    });

    return res.json({ success: true, analytics: { revenue, outstanding, count: bills.length, monthly, methods } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.uploadEvidence = async (req, res) => {
  try {
    const b = await Bill.findById(req.params.id);
    if (!b) return res.status(404).json({ success: false, message: 'Bill not found' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    b.paymentEvidence = `/uploads/${req.file.filename}`;
    b.evidenceStatus = 'Pending';
    b.notes = b.notes ? `${b.notes}\n[Evidence uploaded on ${new Date().toLocaleDateString()}]` : `Evidence uploaded on ${new Date().toLocaleDateString()}`;
    await b.save();
    return res.json({ success: true, bill: b });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.approveEvidence = async (req, res) => {
  try {
    const b = await Bill.findById(req.params.id);
    if (!b) return res.status(404).json({ success: false, message: 'Bill not found' });
    
    const status = req.body.status || 'Approved'; // 'Approved' or 'Rejected'
    b.evidenceStatus = status;
    
    if (status === 'Approved') {
      const amountToRecord = b.totalAmount - (Number(b.paidAmount) || 0);
      if (amountToRecord > 0) {
        b.paidAmount = (Number(b.paidAmount) || 0) + amountToRecord;
        b.transactions = b.transactions || [];
        b.transactions.push({
          amount: amountToRecord,
          method: 'Online',
          reference: 'Evidence Approved',
          note: 'Payment marked as completed after evidence approval',
          paidAt: new Date(),
        });
        recompute(b);
      }
    }
    
    await b.save();
    return res.json({ success: true, bill: b });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
