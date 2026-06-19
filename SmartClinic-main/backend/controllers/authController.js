const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { nextCode } = require('../utils/nextCode');
const { sendOtpEmail } = require('../utils/email');

const strong = (pw='') => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);

const packUser = (u) => ({ id: u._id, userId: u.userId, name: u.fullName, fullName: u.fullName, email: u.email, phone: u.phoneNumber, role: u.role, accountStatus: u.accountStatus, isEmailVerified: u.isEmailVerified });

exports.register = async (req, res) => {
  try {
    const fullName = req.body.fullName || req.body.name;
    const email = (req.body.email || '').toLowerCase().trim();
    const password = req.body.password || '';
    const requestedRole = req.body.role || 'Patient';
    if (!fullName || !email || !password) return res.status(400).json({ success: false, message: 'fullName, email, password required' });
    if (!strong(password)) return res.status(400).json({ success: false, message: 'Weak password' });
    if (!['Doctor', 'Patient'].includes(requestedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role for public registration' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email exists' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const user = await User.create({ userId: await nextCode(User, 'userId', 'USR'), fullName, email, password, phoneNumber: req.body.phoneNumber || req.body.phone, role: requestedRole, accountStatus: 'Pending', otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000), isEmailVerified: false });
    try {
      await sendOtpEmail({ to: email, otp, subject: 'SmartClinic Registration OTP' });
    } catch (mailErr) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ success: false, message: mailErr.message });
    }
    return res.status(201).json({ success: true, userId: user._id, message: 'Registered. OTP sent.' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.verifyOtp = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId).select('+otp +otpExpiry +refreshTokens');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.otp || user.otp !== req.body.otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });

    user.isEmailVerified = true;
    user.accountStatus = 'Active';
    user.otp = undefined;
    user.otpExpiry = undefined;

    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshTokens.push(refreshToken);
    await user.save();

    return res.json({ success: true, token, refreshToken, user: packUser(user) });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.resendOtp = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId).select('+otp +otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = otp; user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOtpEmail({ to: user.email, otp, subject: 'SmartClinic OTP Resend' });
    return res.json({ success: true, message: 'OTP resent' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.login = async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const selectedRole = String(req.body.role || '').trim();
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.matchPassword(req.body.password || ''))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (selectedRole && user.role !== selectedRole) {
      return res.status(403).json({ success: false, message: `Selected role does not match this account (${user.role})` });
    }
    if (user.accountStatus === 'Suspended') return res.status(403).json({ success: false, message: 'Account suspended' });

    const multiDevice = (user.refreshTokens || []).length > 0;
    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshTokens.push(refreshToken);
    user.lastLoginTime = new Date();
    user.loginAttempts = 0;
    user.loginActivity.unshift({ ip: req.ip, userAgent: req.headers['user-agent'] || '', time: new Date(), success: true });
    user.loginActivity = user.loginActivity.slice(0, 50);
    await user.save();

    return res.json({ success: true, token, refreshToken, multiDevice, user: packUser(user) });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.refreshToken = async (req, res) => {
  try {
    const rt = req.body.refreshToken;
    const decoded = jwt.verify(rt, process.env.JWT_REFRESH_SECRET || 'smartclinic_refresh_fallback_secret');
    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(rt)) return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    return res.json({ success: true, token: user.generateAccessToken() });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+refreshTokens');
    if (user && req.body.refreshToken) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== req.body.refreshToken);
      await user.save();
    }
    return res.json({ success: true, message: 'Logged out' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+refreshTokens');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.refreshTokens = [];
    await user.save();
    return res.json({ success: true, message: 'Logged out from all devices' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: packUser(user) });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name || req.body.fullName) updates.fullName = req.body.fullName || req.body.name;
    if (req.body.phone || req.body.phoneNumber) updates.phoneNumber = req.body.phoneNumber || req.body.phone;
    if (req.file) updates.profileImage = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    return res.json({ success: true, user: packUser(user) });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!(await user.matchPassword(req.body.currentPassword || ''))) return res.status(400).json({ success: false, message: 'Current password invalid' });
    if (!strong(req.body.newPassword || '')) return res.status(400).json({ success: false, message: 'Weak password' });
    user.password = req.body.newPassword;
    await user.save();
    return res.json({ success: true, message: 'Password changed' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = otp; user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOtpEmail({ to: email, otp, subject: 'SmartClinic Password Reset OTP' });
    return res.json({ success: true, message: 'Reset OTP sent' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email }).select('+otp +otpExpiry +password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.otp !== req.body.otp || user.otpExpiry < new Date()) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (!strong(req.body.newPassword || '')) return res.status(400).json({ success: false, message: 'Weak password' });
    user.password = req.body.newPassword;
    user.otp = undefined; user.otpExpiry = undefined;
    await user.save();
    return res.json({ success: true, message: 'Password reset successful' });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json({ success: true, users });
  }
  catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { accountStatus: req.body.accountStatus }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.adminCreateUser = async (req, res) => {
  try {
    const fullName = (req.body.fullName || req.body.name || '').trim();
    const email = (req.body.email || '').toLowerCase().trim();
    const password = req.body.password || '';
    const phoneNumber = req.body.phoneNumber || req.body.phone || '';
    const role = req.body.role || 'Patient';
    const accountStatus = req.body.accountStatus || 'Active';

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'fullName, email, password required' });
    }
    if (!strong(password)) return res.status(400).json({ success: false, message: 'Weak password' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email exists' });

    const user = await User.create({
      userId: await nextCode(User, 'userId', 'USR'),
      fullName,
      email,
      password,
      phoneNumber,
      role,
      accountStatus,
      isEmailVerified: true,
    });
    return res.status(201).json({ success: true, user: packUser(user) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.adminUpdateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.body.email) {
      const email = String(req.body.email).toLowerCase().trim();
      const exists = await User.findOne({ email, _id: { $ne: user._id } });
      if (exists) return res.status(400).json({ success: false, message: 'Email exists' });
      user.email = email;
    }
    if (req.body.fullName || req.body.name) user.fullName = req.body.fullName || req.body.name;
    if (req.body.phoneNumber || req.body.phone) user.phoneNumber = req.body.phoneNumber || req.body.phone;
    if (req.body.role) user.role = req.body.role;
    if (req.body.accountStatus) user.accountStatus = req.body.accountStatus;
    if (req.body.password) {
      if (!strong(req.body.password)) return res.status(400).json({ success: false, message: 'Weak password' });
      user.password = req.body.password;
    }
    await user.save();
    return res.json({ success: true, user: packUser(user) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.adminDeleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, message: 'User deleted' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getLoginActivity = async (req, res) => {
  try { const user = await User.findById(req.user.id); return res.json({ success: true, activity: user?.loginActivity || [] }); }
  catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
