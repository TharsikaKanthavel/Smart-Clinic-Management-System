const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  billId: { type: String, unique: true, sparse: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  items: [{ description: String, amount: Number }],
  totalAmount: Number,
  paidAmount: Number,
  balanceDue: Number,
  discount: Number,
  paymentMethod: String,
  paymentStatus: { type: String, default: 'Unpaid' },
  paymentEvidence: String,
  evidenceStatus: { type: String, enum: ['None', 'Pending', 'Approved', 'Rejected'], default: 'None' },
  insuranceClaim: Boolean,
  invoiceDate: Date,
  dueDate: Date,
  notes: String,
  transactions: [{ amount: Number, method: String, reference: String, paidAt: Date, note: String }],
}, { timestamps: true, strict: false });
module.exports = mongoose.model('Bill', schema);
