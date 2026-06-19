const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/patientController');

router.get('/', protect, c.getAll);
router.get('/stats', protect, c.getStats);
router.get('/me', protect, c.getMine);
router.get('/:id([0-9a-fA-F]{24})', protect, c.getById);
router.post('/', protect, c.create);
router.put('/:id([0-9a-fA-F]{24})', protect, c.update);
router.delete('/:id([0-9a-fA-F]{24})', protect, c.remove);
router.post('/:id([0-9a-fA-F]{24})/upload-report', protect, upload.single('medicalReport'), c.uploadReport);

module.exports = router;
