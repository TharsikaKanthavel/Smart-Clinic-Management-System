const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  labTestId: { type: String, unique: true, sparse: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  testName: String,
  testCategory: String,
  sampleType: String,
  priority: String,
  status: { type: String, default: 'Pending' },
  resultValue: String,
  normalRange: String,
  resultStatus: { type: String, default: 'Pending' },
  detailedResults: [{ name: String, value: String, unit: String, normalRange: String, status: String }],
  reportFile: String,
  criticalFlag: Boolean,
  testedAt: Date,
  collectionDate: Date,
  notes: String,
}, { timestamps: true, strict: false });
schema.pre('save', async function (next) {
  if (this.isNew && !this.labTestId) {
    const last = await this.constructor.findOne({}, { labTestId: 1 }).sort({ labTestId: -1 });
    let nextNum = 1;
    if (last && last.labTestId) {
      const match = last.labTestId.match(/LAB(\d+)/i);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    this.labTestId = `LAB${String(nextNum).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('LabTest', schema);
