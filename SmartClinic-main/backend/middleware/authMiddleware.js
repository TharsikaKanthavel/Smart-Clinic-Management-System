const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartclinic_access_fallback_secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.accountStatus === 'Suspended') return res.status(403).json({ success: false, message: 'Account suspended' });
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
  next();
};

module.exports = { protect, authorize };
