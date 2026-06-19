const Patient = require('../models/Patient');
const User = require('../models/User');
const { createCrud } = require('../utils/crudFactory');
const { notifyReportSubmitted } = require('../utils/notificationEvents');
const crud = createCrud(Patient, 'Patient');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { patientName: { $regex: req.query.search, $options: 'i' } },
        { patientId: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, count: patients.length, patients });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
exports.getById = crud.get;
exports.create = crud.create;
exports.update = crud.update;
exports.remove = crud.remove;
exports.getMine = async (req, res) => {
  try {
    if (req.user?.role !== 'Patient') return res.status(403).json({ success: false, message: 'Only patients can access this route' });
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 1) direct link if already mapped
    let patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      const normalizePhone = (v = '') => String(v).replace(/\D/g, '');
      const normalizeName = (v = '') => String(v).toLowerCase().trim().replace(/\s+/g, ' ');
      const normalizeNameLoose = (v = '') => String(v).toLowerCase().replace(/[^a-z]/g, '');
      const email = String(user.email || '').toLowerCase().trim();
      const phone = normalizePhone(user.phoneNumber || '');
      const name = normalizeName(user.fullName || '');
      const nameLoose = normalizeNameLoose(user.fullName || '');
      const patients = await Patient.find();

      patient = patients.find((pt) => {
        const ptEmail = String(pt.email || '').toLowerCase().trim();
        const ptPhone = normalizePhone(pt.phone || '');
        const ptName = normalizeName(pt.patientName || pt.name || '');
        const ptNameLoose = normalizeNameLoose(pt.patientName || pt.name || '');
        return (
          (name && ptName && name === ptName) ||
          (nameLoose && ptNameLoose && (nameLoose === ptNameLoose || nameLoose.replace(/s$/, '') === ptNameLoose.replace(/s$/, ''))) ||
          (email && ptEmail && email === ptEmail) ||
          (phone && ptPhone && phone === ptPhone)
        );
      }) || null;

      // Fallback for demo accounts like patient1@... -> PAT0001
      if (!patient && email) {
        const local = email.split('@')[0] || '';
        const m = local.match(/patient(\d+)/i);
        if (m?.[1]) {
          const n = Number(m[1]);
          if (Number.isFinite(n) && n > 0) {
            const patientCode = `PAT${String(n).padStart(4, '0')}`;
            patient = patients.find((pt) => String(pt.patientId || '').toUpperCase() === patientCode) || null;
          }
        }
      }

      if (patient) {
        patient.userId = req.user.id;
        await patient.save();
      }
    }

    if (!patient) return res.status(404).json({ success: false, message: 'Patient record not found for this account' });
    return res.json({ success: true, patient: patient.toObject ? patient.toObject() : patient });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Report file is required' });
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const reportPath = `/uploads/${req.file.filename}`;
    const reports = Array.isArray(patient.medicalReport) ? patient.medicalReport : [];
    patient.medicalReport = [...reports, reportPath];
    await patient.save();

    await notifyReportSubmitted(patient, req.file.originalname || '', {
      userId: req.user?.id || null,
      role: req.user?.role || '',
    });
    return res.json({ success: true, patient: patient.toObject() });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
exports.getStats = async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    const male = await Patient.countDocuments({ gender: 'Male' });
    const female = await Patient.countDocuments({ gender: 'Female' });
    return res.json({ success: true, stats: { total, male, female } });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
