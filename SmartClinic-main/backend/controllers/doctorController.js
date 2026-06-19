const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { createCrud } = require('../utils/crudFactory');
const crud = createCrud(Doctor, 'Doctor');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.email) filter.email = req.query.email;
    if (req.query.specialization) filter.specialization = req.query.specialization;
    if (req.query.search) {
      filter.$or = [
        { doctorName: { $regex: req.query.search, $options: 'i' } },
        { specialization: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, count: doctors.length, doctors });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
exports.getById = crud.get;
exports.create = crud.create;
exports.update = crud.update;
exports.remove = crud.remove;

exports.getStats = async (req, res) => {
  try {
    // 1. Get Doctor profile based on logged-in User's role/email
    // Note: In a real system, we match the User and Doctor by ID or email.
    // For now, we'll try to find the doctor profile matching the user's email.
    const doctor = await Doctor.findOne({ email: req.user.email });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const doctorId = doctor._id;

    // 2. Count Today's Appointments
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date();
    endOfToday.setHours(23,59,59,999);

    const todayAppts = await Appointment.countDocuments({
      doctorId,
      appointmentDate: { $gte: startOfToday, $lte: endOfToday }
    });

    // 3. Count Unique Patients (from prescriptions or appearances)
    const uniquePatients = await Appointment.distinct('patientId', { doctorId });

    // 4. Count Prescriptions
    const totalPrescriptions = await Prescription.countDocuments({ doctorId });

    return res.json({
      success: true,
      stats: [
        { icon:'📅', label:"Today's Appts", value: todayAppts.toString() },
        { icon:'🧑‍🤝‍🧑', label:'My Patients',   value: uniquePatients.length.toString() },
        { icon:'💊', label:'Prescriptions', value: totalPrescriptions.toString() },
        { icon:'⭐', label:'Rating',        value: (doctor.rating || 0).toFixed(1) }
      ]
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getSpecializations = async (req, res) => {
  try { const specializations = await Doctor.distinct('specialization'); return res.json({ success: true, specializations: specializations.filter(Boolean) }); }
  catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
exports.updateStatus = async (req, res) => {
  try { const doctor = await Doctor.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' }); return res.json({ success: true, doctor }); }
  catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
