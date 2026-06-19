const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  reminderId: { type: String, unique: true, sparse: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  medicineName: String,
  dosage: String,
  frequency: String,
  reminderTime: String,
  startDate: Date,
  endDate: Date,
  reminderType: String,
  takenStatus: { type: String, default: 'Pending' },
  missedCount: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  history: [{ date: Date, status: String }],
}, { timestamps: true, strict: false });
module.exports = mongoose.model('Reminder', schema);
