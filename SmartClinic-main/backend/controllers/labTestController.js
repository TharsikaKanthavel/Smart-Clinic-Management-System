const LabTest = require('../models/LabTest');
const { createCrud } = require('../utils/crudFactory');
const crud = createCrud(LabTest, 'LabTest');

const Notification = require('../models/Notification');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.testCategory = req.query.category;
    
    // Basic search
    if (req.query.search) {
      filter.$or = [
        { testName: { $regex: req.query.search, $options: 'i' } },
        { labTestId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const tests = await LabTest.find(filter)
      .populate('patientId', 'name patientName email')
      .populate('doctorId', 'name doctorName')
      .sort({ createdAt: -1 });
    
    return res.json({ success: true, count: tests.length, tests });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
exports.getById = crud.get;

exports.order = async (req, res) => {
  try {
    const body = req.body;
    const test = await LabTest.create(body);

    // Find the associated user for notification
    const Patient = require('../models/Patient');
    const patientDoc = await Patient.findById(body.patientId);
    
    if (patientDoc && patientDoc.email) {
      const User = require('../models/User');
      const userDoc = await User.findOne({ email: patientDoc.email });
      if (userDoc) {
        await Notification.create({
          userId: userDoc._id,
          title: 'New Lab Test Ordered',
          message: `A new ${test.testName} (${test.testCategory}) test has been ordered for you. Please check the Lab section for details.`,
          type: 'Lab',
          relatedId: test._id
        });
      }
    }

    return res.status(201).json({ success: true, test });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.update = async (req, res) => {
  try {
    const t = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patientId', 'name patientName email')
      .populate('doctorId', 'name doctorName');
    if (!t) return res.status(404).json({ success: false, message: 'Lab test not found' });

    // Notify Patient if status is completed or results are updated
    if (t.patientId && (req.body.status === 'Completed' || req.body.resultValue)) {
      const Patient = require('../models/Patient');
      const patientDoc = await Patient.findById(t.patientId);
      if (patientDoc && patientDoc.email) {
        const User = require('../models/User');
        const userDoc = await User.findOne({ email: patientDoc.email });
        if (userDoc) {
          await Notification.create({
            userId: userDoc._id,
            title: 'Lab Results Updated',
            message: `Your results for ${t.testName} are now available. Status: ${t.status}.`,
            type: 'Lab',
            relatedId: t._id
          });
        }
      }
    }

    return res.json({ success: true, test: t });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
exports.remove = crud.remove;

exports.uploadResult = async (req, res) => {
  try {
    const body = req.body;
    if (body.detailedResults && typeof body.detailedResults === 'string') body.detailedResults = JSON.parse(body.detailedResults);
    if (req.file) body.reportFile = `/uploads/${req.file.filename}`;
    const t = await LabTest.findByIdAndUpdate(req.params.id, body, { new: true })
      .populate('patientId', 'name patientName email')
      .populate('doctorId', 'name doctorName');
    if (!t) return res.status(404).json({ success: false, message: 'Lab test not found' });

    // Notify doctor
    if (t.doctorId) {
      // Find the associated user for the doctor
      const Doctor = require('../models/Doctor');
      const docRecord = await Doctor.findById(t.doctorId);
      if (docRecord && docRecord.email) {
        const User = require('../models/User');
        const userDoc = await User.findOne({ email: docRecord.email });
        if (userDoc) {
          await Notification.create({
            userId: userDoc._id,
            title: 'Lab Result Uploaded',
            message: `Patient ${t.patientName || 'Unknown'} has uploaded results for: ${t.testName} (${t.testCategory}).`,
            type: 'Lab',
            relatedId: t._id
          });
        }
      }
    }

    return res.json({ success: true, test: t });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.getPatientHistory = async (req, res) => {
  try {
    const tests = await LabTest.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    return res.json({ success: true, tests });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.analytics = async (req, res) => {
  try {
    const tests = await LabTest.find();
    const total = tests.length;
    let completed = 0;
    let pending = 0;
    const categories = {};
    const monthly = {};

    tests.forEach(t => {
      if (t.status === 'Completed') completed++;
      else pending++;

      const cat = t.testCategory || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;

      const date = t.createdAt || new Date();
      const mKey = new Date(date).toISOString().slice(0, 7);
      monthly[mKey] = (monthly[mKey] || 0) + 1;
    });

    return res.json({ 
      success: true, 
      analytics: { total, completed, pending, categories, monthly } 
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
