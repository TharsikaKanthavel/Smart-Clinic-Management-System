require('dotenv').config();
const mongoose = require('mongoose');
const LabTest = require('../backend/models/LabTest');
const Notification = require('../backend/models/Notification');

async function cleanup() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartclinic';
  await mongoose.connect(uri);
  const res1 = await LabTest.deleteMany({ labTestId: null });
  const res2 = await Notification.deleteMany({ notificationId: null });
  console.log('LabTest cleanup result:', res1);
  console.log('Notification cleanup result:', res2);
  await mongoose.disconnect();
}

cleanup().catch(console.error);
