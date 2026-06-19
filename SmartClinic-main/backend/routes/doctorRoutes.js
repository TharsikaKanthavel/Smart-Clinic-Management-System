const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/doctorController');

router.get('/', protect, c.getAll);
router.get('/specializations', protect, c.getSpecializations);
router.get('/dashboard-stats', protect, c.getStats);
router.get('/:id', protect, c.getById);
router.post('/', protect, upload.single('profileImage'), c.create);
router.patch('/:id', protect, upload.single('profileImage'), c.update);
router.delete('/:id', protect, c.remove);
router.patch('/:id/status', protect, c.updateStatus);

module.exports = router;
