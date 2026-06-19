const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, sparse: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phoneNumber: String,
  role: { type: String, enum: ['Admin', 'Doctor', 'Patient'], default: 'Patient' },
  accountStatus: { type: String, enum: ['Active', 'Suspended', 'Pending'], default: 'Pending' },
  lastLoginTime: Date,
  loginAttempts: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: false },
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },
  refreshTokens: { type: [String], select: false, default: [] },
  loginActivity: [{ ip: String, userAgent: String, time: Date, success: Boolean }],
  profileImage: String,
}, { timestamps: true, strict: false });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function(pw) { return bcrypt.compare(pw, this.password); };
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'smartclinic_access_fallback_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    { id: this._id, kind: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'smartclinic_refresh_fallback_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
