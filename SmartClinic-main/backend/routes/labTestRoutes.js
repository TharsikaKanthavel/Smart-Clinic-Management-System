const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/labTestController');

router.get('/', protect, c.getAll);
router.get('/analytics', protect, c.analytics);
router.get('/patient/:patientId', protect, c.getPatientHistory);
router.get('/:id', protect, c.getById);
router.post('/', protect, c.order);
router.put('/:id', protect, c.update);
router.delete('/:id', protect, c.remove);
router.patch('/:id/upload-result', protect, upload.single('reportFile'), c.uploadResult);

module.exports = router;
