const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  doctorId: { type: String, unique: true, sparse: true },
  doctorName: { type: String, required: true },
  specialization: String,
  department: String,
  qualification: String,
  experienceYears: Number,
  hospitalName: String,
  licenseNumber: String,
  phone: String,
  email: String,
  consultationFee: Number,
  availableDays: [String],
  availableTime: String,
  profileImage: String,
  rating: Number,
  totalPatientsTreated: Number,
  totalAppointments: Number,
  consultationMode: String,
  status: { type: String, default: 'Active' }
}, { timestamps: true, strict: false });
module.exports = mongoose.model('Doctor', schema);
