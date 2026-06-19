const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  prescriptionId: { type: String, unique: true, sparse: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  medicines: [{ medicineName: String, dosage: String, instructions: String, quantity: Number, duration: String }],
  prescriptionImage: String,
  refillAllowed: Boolean,
  notes: String,
  followUpDate: Date,
  diagnosis: String,
  dateIssued: Date,
}, { timestamps: true, strict: false });
module.exports = mongoose.model('Prescription', schema);
