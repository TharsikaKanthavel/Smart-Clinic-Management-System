const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/notificationController');

router.get('/', protect, c.getAll);
router.get('/unread-count', protect, c.getUnreadCount);
router.get('/:id', protect, c.getById);
router.post('/', protect, c.create);
router.post('/broadcast', protect, c.broadcast);
router.patch('/:id/read', protect, c.markRead);
router.patch('/mark-all-read', protect, c.markAllRead);
router.delete('/:id', protect, c.remove);

module.exports = router;
