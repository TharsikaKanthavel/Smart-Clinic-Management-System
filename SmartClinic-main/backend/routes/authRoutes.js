const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const c = require('../controllers/authController');

router.post('/register', c.register);
router.post('/verify-otp', c.verifyOtp);
router.post('/resend-otp', c.resendOtp);
router.post('/login', c.login);
router.post('/refresh-token', c.refreshToken);
router.post('/forgot-password', c.requestPasswordReset);
router.post('/reset-password', c.resetPassword);

router.post('/logout', protect, c.logout);
router.post('/logout-all', protect, c.logoutAllDevices);
router.get('/profile', protect, c.getProfile);
router.put('/profile', protect, upload.single('profileImage'), c.updateProfile);
router.put('/change-password', protect, c.changePassword);
router.get('/activity', protect, c.getLoginActivity);

router.get('/users', protect, authorize('Admin'), c.getAllUsers);
router.post('/users', protect, authorize('Admin'), c.adminCreateUser);
router.put('/users/:id', protect, authorize('Admin'), c.adminUpdateUser);
router.delete('/users/:id', protect, authorize('Admin'), c.adminDeleteUser);
router.put('/users/:id/status', protect, authorize('Admin'), c.updateUserStatus);

module.exports = router;
