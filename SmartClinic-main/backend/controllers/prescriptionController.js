const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { nextCode } = require('../utils/nextCode');
const { notifyPrescriptionCreated } = require('../utils/notificationEvents');

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizePrescription = (doc) => {
  const p = doc.toObject ? doc.toObject() : doc;
  const patientName = p.patientName || p.patientId?.patientName || p.patientId?.name || '';
  const doctorName = p.doctorName || p.doctorId?.doctorName || p.doctorId?.name || '';
  return {
    ...p,
    patientName: patientName || p.patientName,
    doctorName: doctorName || p.doctorName,
  };
};

exports.getAll = async (req, res) => {
  try {
    const docs = await Prescription.find({})
      .sort({ createdAt: -1 })
      .populate('patientId', 'patientName name patientId')
      .populate('doctorId', 'doctorName name specialization');

    return res.json({
      success: true,
      count: docs.length,
      prescriptions: docs.map(normalizePrescription),
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const doc = await Prescription.findById(req.params.id)
      .populate('patientId', 'patientName name patientId')
      .populate('doctorId', 'doctorName name specialization');

    if (!doc) return res.status(404).json({ success: false, message: 'Prescription not found' });
    return res.json({ success: true, prescription: normalizePrescription(doc) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = { ...req.body };

    body.medicines = parseMaybeJson(body.medicines, []);
    if (req.file) body.prescriptionImage = `/uploads/${req.file.filename}`;

    const patient = body.patientId ? await Patient.findById(body.patientId) : null;
    const doctor = body.doctorId ? await Doctor.findById(body.doctorId) : null;

    if (patient) body.patientName = patient.patientName || patient.name;
    if (doctor) body.doctorName = doctor.doctorName || doctor.name;
    if (!body.prescriptionId) body.prescriptionId = await nextCode(Prescription, 'prescriptionId', 'RX');
    if (!body.dateIssued) body.dateIssued = new Date();

    const doc = await Prescription.create(body);
    const populated = await Prescription.findById(doc._id)
      .populate('patientId', 'patientName name patientId')
      .populate('doctorId', 'doctorName name specialization');

    await notifyPrescriptionCreated(populated);

    return res.status(201).json({ success: true, prescription: normalizePrescription(populated) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.medicines !== undefined) body.medicines = parseMaybeJson(body.medicines, []);
    if (req.file) body.prescriptionImage = `/uploads/${req.file.filename}`;

    if (body.patientId) {
      const patient = await Patient.findById(body.patientId);
      if (patient) body.patientName = patient.patientName || patient.name;
    }

    if (body.doctorId) {
      const doctor = await Doctor.findById(body.doctorId);
      if (doctor) body.doctorName = doctor.doctorName || doctor.name;
    }

    const doc = await Prescription.findByIdAndUpdate(req.params.id, body, { new: true })
      .populate('patientId', 'patientName name patientId')
      .populate('doctorId', 'doctorName name specialization');

    if (!doc) return res.status(404).json({ success: false, message: 'Prescription not found' });

    return res.json({ success: true, prescription: normalizePrescription(doc) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await Prescription.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Prescription not found' });
    return res.json({ success: true, message: 'Prescription deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.analytics = async (req, res) => {
  try {
    const total = await Prescription.countDocuments();
    const refillAllowed = await Prescription.countDocuments({ refillAllowed: true });
    return res.json({ success: true, analytics: { total, refillAllowed } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
