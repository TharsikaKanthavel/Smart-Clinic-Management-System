const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { simpleRateLimiter } = require('./middleware/rateLimitMiddleware');

const app = express();

app.use(cors({ origin: '*'}));
app.use(simpleRateLimiter(Number(process.env.RATE_LIMIT_PER_MINUTE || 200), 60 * 1000));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/labtests', require('./routes/labTestRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'SmartClinic API running', version: '1.0.0' });
});

app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartclinic';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');
};

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
  });
}).catch((e) => {
  console.error('MongoDB connection failed:', e.message);
  process.exit(1);
});

module.exports = app;
