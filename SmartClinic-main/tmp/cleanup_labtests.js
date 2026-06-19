require('dotenv').config();
const mongoose = require('mongoose');
const LabTest = require('../backend/models/LabTest');

async function cleanup() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartclinic';
  await mongoose.connect(uri);
  const res = await LabTest.deleteMany({ labTestId: null });
  console.log('Cleanup result:', res);
  await mongoose.disconnect();
}

cleanup().catch(console.error);
