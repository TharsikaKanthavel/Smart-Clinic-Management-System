const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/billingController');

router.get('/', protect, c.getAll);
router.get('/analytics', protect, c.analytics);
router.get('/:id', protect, c.getById);
router.post('/', protect, c.create);
router.put('/:id', protect, c.update);
router.delete('/:id', protect, c.remove);
router.patch('/:id/payment', protect, c.recordPayment);
router.patch('/:id/upload-evidence', protect, upload.single('paymentEvidence'), c.uploadEvidence);
router.patch('/:id/approve-evidence', protect, c.approveEvidence);
router.patch('/auto-overdue', protect, c.autoOverdue);

module.exports = router;
