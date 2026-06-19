const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  patientId: { type: String, unique: true, sparse: true },
  patientName: { type: String, required: true },
  age: Number,
  gender: String,
  dateOfBirth: Date,
  phone: String,
  email: String,
  address: String,
  bloodGroup: String,
  allergies: [String],
  chronicDiseases: [String],
  medicalHistory: [{ date: Date, note: String }],
  emergencyContactName: String,
  emergencyContactNumber: String,
  insuranceProvider: String,
  insuranceNumber: String,
  medicalReport: [String],
  visitCount: Number,
  lastVisitDate: Date,
}, { timestamps: true, strict: false });
module.exports = mongoose.model('Patient', schema);
