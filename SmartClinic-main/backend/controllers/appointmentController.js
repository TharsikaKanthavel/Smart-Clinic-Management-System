const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Bill = require('../models/Bill');
const { nextCode } = require('../utils/nextCode');
const {
  notifyAppointmentCreated,
  notifyAppointmentStatusChanged,
  notifyAppointmentRescheduled,
} = require('../utils/notificationEvents');
const { notifyBillCreated } = require('../utils/notificationEvents');

const normalizeAppointment = (doc) => {
  const a = doc.toObject ? doc.toObject() : doc;
  const patientName = a.patientName || a.patientId?.patientName || a.patientId?.name || '';
  const doctorName = a.doctorName || a.doctorId?.doctorName || a.doctorId?.name || '';
  return {
    ...a,
    patientName: patientName || a.patientName,
    doctorName: doctorName || a.doctorName,
  };
};

exports.getAll = async (req, res) => {
  try {
    const docs = await Appointment.find({})
      .sort({ createdAt: -1 })
      .populate('patientId', 'patientName name patientId')
      .populate('doctorId', 'doctorName name specialization');

    return res.json({
      success: true,
      count: docs.length,
      appointments: docs.map(normalizeAppointment),
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Appointment.findById(req.params.id)
      .populate('patientId', 'patientName name patientId')
      .populate('doctorId', 'doctorName name specialization');

    if (!doc) return res.status(404).json({ success: false, message: 'Appointment not found' });

    return res.json({ success: true, appointment: normalizeAppointment(doc) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = { ...req.body };

    if (req.file) body.appointmentDocument = `/uploads/${req.file.filename}`;

    const patient = body.patientId ? await Patient.findById(body.patientId) : null;
    const doctor = body.doctorId ? await Doctor.findById(body.doctorId) : null;

    if (patient) body.patientName = patient.patientName || patient.name;
    if (doctor) body.doctorName = doctor.doctorName || doctor.name;

    if (!body.appointmentId) {
      for (let i = 0; i < 5; i++) {
        const candidate = await nextCode(Appointment, 'appointmentId', 'APT');
        const exists = await Appointment.exists({ appointmentId: candidate });
        if (!exists) {
          body.appointmentId = candidate;
          break;
        }
      }
      if (!body.appointmentId) return res.status(500).json({ success: false, message: 'Failed to allocate appointment ID' });
    }

    if (!body.queueNumber) {
      const todaysCount = await Appointment.countDocuments({ appointmentDate: body.appointmentDate });
      body.queueNumber = todaysCount + 1;
    }

    const doc = await Appointment.create(body);
    const populated = await Appointment.findById(doc._id)
      .populate('patientId', 'patientName name patientId')
      .populate('doctorId', 'doctorName name consultationFee specialization');

    // Create related Bill automatically
    try {
      const billId = await nextCode(Bill, 'billId', 'BIL');
      const consultationFee = Number(populated.doctorId?.consultationFee) || 500; // Default if not set
      
      const newBill = await Bill.create({
        billId,
        patientId: populated.patientId?._id,
        appointmentId: populated._id, // LINK TO APPOINTMENT
        doctorId: populated.doctorId?._id,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        items: [{ description: 'Consultation Fee', amount: consultationFee }],
        totalAmount: consultationFee,
        balanceDue: consultationFee,
        paymentStatus: 'Unpaid',
        notes: `Automated invoice for Appointment ${populated.appointmentId}`
      });
      
      await notifyBillCreated(newBill, populated.patientName);
    } catch (billErr) {
      console.error('Failed to auto-create bill:', billErr);
    }

    await notifyAppointmentCreated(populated);

    return res.status(201).json({ success: true, appointment: normalizeAppointment(populated) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const status = req.body.appointmentStatus;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { appointmentStatus: status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // IF CANCELLED, ALSO CANCEL THE BILL
    if (status === 'Cancelled') {
      // 1) Try via linked ID (new records)
      await Bill.updateMany(
        { appointmentId: appointment._id, paymentStatus: { $in: ['Unpaid', 'Partial'] } },
        { paymentStatus: 'Cancelled' }
      );
      // 2) Fallback via Note search (old records like BIL0006)
      if (appointment.appointmentId) {
        await Bill.updateMany(
          { 
            notes: { $regex: appointment.appointmentId, $options: 'i' },
            paymentStatus: { $in: ['Unpaid', 'Partial'] }
          },
          { paymentStatus: 'Cancelled' }
        );
      }
    }

    await notifyAppointmentStatusChanged(appointment, status);

    return res.json({ success: true, appointment });
  }
  catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.reschedule = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        appointmentDate: req.body.appointmentDate,
        appointmentTime: req.body.appointmentTime,
        appointmentStatus: 'Pending',
      },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    await notifyAppointmentRescheduled(appointment);

    return res.json({ success: true, appointment });
  }
  catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.autoCancel = async (req, res) => {
  try {
    const expired = await Appointment.find({ appointmentStatus: 'Pending', appointmentDate: { $lt: new Date() } });
    const count = expired.length;
    
    if (count > 0) {
      const ids = expired.map(a => a._id);
      const readableIds = expired.map(a => a.appointmentId).filter(Boolean);

      await Appointment.updateMany({ _id: { $in: ids } }, { appointmentStatus: 'Cancelled' });

      // Cancel linked bills
      await Bill.updateMany(
        { appointmentId: { $in: ids }, paymentStatus: { $in: ['Unpaid', 'Partial'] } },
        { paymentStatus: 'Cancelled' }
      );

      // Fallback for old bills via notes
      if (readableIds.length > 0) {
        for (const rid of readableIds) {
          await Bill.updateMany(
            { notes: { $regex: rid, $options: 'i' }, paymentStatus: { $in: ['Unpaid', 'Partial'] } },
            { paymentStatus: 'Cancelled' }
          );
        }
      }
    }

    return res.json({ success: true, updated: count });
  }
  catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ appointmentStatus: 'Pending' });
    const approved = await Appointment.countDocuments({ appointmentStatus: 'Approved' });
    const completed = await Appointment.countDocuments({ appointmentStatus: 'Completed' });
    return res.json({ success: true, stats: { total, pending, approved, completed } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
