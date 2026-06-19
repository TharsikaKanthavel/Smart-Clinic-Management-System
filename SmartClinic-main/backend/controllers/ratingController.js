const Rating = require('../models/Rating');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

exports.submitRating = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, reviewText } = req.body;
    
    // Find linked Patient profile
    const patientProfile = await Patient.findOne({ email: req.user.email });
    if (!patientProfile) {
       return res.status(400).json({ success: false, message: 'No patient profile found for this account. Ratings are patient-only.' });
    }
    const patientId = patientProfile._id;

    // 1. Create the rating record
    const newRating = await Rating.create({
      patientId,
      doctorId,
      appointmentId,
      rating: Number(rating),
      reviewText
    });

    // 2. Recalculate average for the Doctor
    const allRatings = await Rating.find({ doctorId });
    const total = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / allRatings.length;

    await Doctor.findByIdAndUpdate(doctorId, { rating: avg });

    return res.status(201).json({ success: true, rating: newRating, average: avg });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getDoctorRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ doctorId: req.params.doctorId }).populate('patientId', 'patientName');
    return res.json({ success: true, ratings });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
