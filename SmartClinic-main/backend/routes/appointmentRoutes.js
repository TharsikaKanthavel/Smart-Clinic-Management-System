const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/appointmentController');

router.get('/', protect, c.getAll);
router.get('/stats', protect, c.getStats);
router.get('/:id', protect, c.getById);
router.post('/', protect, upload.single('appointmentDocument'), c.create);
router.patch('/:id/status', protect, c.updateStatus);
router.patch('/:id/reschedule', protect, c.reschedule);
router.patch('/auto-cancel', protect, c.autoCancel);

module.exports = router;
