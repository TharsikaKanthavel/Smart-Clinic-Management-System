const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  appointmentId: { type: String, unique: true, sparse: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  appointmentDate: Date,
  appointmentTime: String,
  reasonForVisit: String,
  appointmentDocument: String,
  appointmentType: String,
  queueNumber: Number,
  appointmentStatus: { type: String, default: 'Pending' },
  checkInTime: Date,
  consultationStartTime: Date,
  consultationEndTime: Date,
  notes: String,
}, { timestamps: true, strict: false });
module.exports = mongoose.model('Appointment', schema);
