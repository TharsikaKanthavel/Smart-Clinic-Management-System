const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  notificationId: { type: String, unique: true, sparse: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  title: String,
  notificationType: String,
  priorityLevel: String,
  status: { type: String, default: 'Unread' },
  deliveryMethod: String,
  audience: String,
  scheduledAt: Date,
}, { timestamps: true, strict: false });
schema.pre('save', async function (next) {
  if (this.isNew && !this.notificationId) {
    const last = await this.constructor.findOne({}, { notificationId: 1 }).sort({ notificationId: -1 });
    let nextNum = 1;
    if (last && last.notificationId) {
      const match = last.notificationId.match(/NOT(\d+)/i);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    this.notificationId = `NOT${String(nextNum).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Notification', schema);
