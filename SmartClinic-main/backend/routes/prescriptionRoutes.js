const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/prescriptionController');

router.get('/', protect, c.getAll);
router.get('/analytics', protect, c.analytics);
router.get('/:id', protect, c.getById);
router.post('/', protect, upload.single('prescriptionImage'), c.create);
router.patch('/:id', protect, upload.single('prescriptionImage'), c.update);
router.delete('/:id', protect, c.remove);

module.exports = router;
