const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/ratingController');

router.post('/', protect, c.submitRating);
router.get('/:doctorId', protect, c.getDoctorRatings);

module.exports = router;
