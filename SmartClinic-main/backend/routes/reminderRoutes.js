const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/reminderController');

router.get('/', protect, c.getAll);
router.get('/stats', protect, c.getStats);
router.get('/:id', protect, c.getById);
router.post('/', protect, c.create);
router.put('/:id', protect, c.update);
router.delete('/:id', protect, c.remove);
router.patch('/:id/taken', protect, c.markTaken);
router.patch('/:id/snooze', protect, c.snooze);
router.patch('/:id/missed', protect, c.markMissed);
router.patch('/:id/toggle', protect, c.toggleStatus);
router.patch('/auto-stop', protect, c.autoStop);

module.exports = router;
