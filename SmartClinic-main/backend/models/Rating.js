const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: String,
  status: { type: String, default: 'Visible' }
}, { timestamps: true });

module.exports = mongoose.model('Rating', schema);
