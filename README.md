# SmartClinic

A comprehensive healthcare management platform with a cross-platform mobile application and a robust backend API. SmartClinic enables patients to manage appointments, prescriptions, billing, and lab tests while allowing doctors to manage their practice, patient consultations, and prescriptions.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Architecture](#project-architecture)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

SmartClinic is an all-in-one healthcare management solution designed to streamline clinic operations and enhance patient experience. The platform features a React Native mobile app (via Expo) for cross-platform accessibility and a Node.js/Express backend with MongoDB for scalable data management.

### Key Use Cases
- **Patients**: Schedule appointments, manage prescriptions, track lab tests, handle billing payments, and receive health reminders
- **Doctors**: Manage consultation schedules, write prescriptions, track patient history, and maintain ratings
- **Administrators**: Monitor system activity, manage users, view reports, and configure system settings

## ✨ Features

### Authentication & Security
- User registration and login with email verification
- OTP (One-Time Password) verification
- JWT-based authentication
- Role-based access control (Patient, Doctor, Admin)
- Password management and recovery
- Rate limiting for API endpoints

### Patient Management
- Patient profile and medical history
- Appointment scheduling and tracking
- Consultation history
- Prescription management
- Lab test ordering and tracking
- Billing and payment management
- Health reminders and notifications
- Rating and feedback system

### Doctor Management
- Doctor profiles and specialties
- Appointment calendar and scheduling
- Consultation history tracking
- Prescription writing
- Patient management
- Rating and review system

### Appointment System
- Schedule appointments with doctors
- Appointment confirmation and reminders
- Consultation history tracking
- Cancellation and rescheduling

### Prescription Management
- Digital prescription creation and tracking
- Prescription history for patients
- Medicine information

### Lab Tests
- Lab test ordering
- Test tracking and history
- Results management

### Billing & Payments
- Invoice generation
- Payment tracking
- Billing history

### Notifications & Reminders
- Appointment reminders
- Prescription reminders
- Health alerts
- Email notifications

### Admin Dashboard
- User management
- System reports and analytics
- Configuration management

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native (Expo)
- **State Management**: Context API
- **Navigation**: React Native Navigation
- **Styling**: React Native Stylesheet
- **Version**: React 19.1.0, React Native 0.81.5

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.19.2
- **Database**: MongoDB 8.5.1
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Email Service**: Nodemailer 8.0.3
- **File Upload**: Multer 1.4.5
- **Logging**: Morgan 1.10.0
- **CORS**: 2.8.5
- **Environment**: dotenv 16.4.5
- **Development**: Nodemon 3.1.4

## 📁 Project Structure

```
SmartClinic-main/
├── frontend/                          # React Native Frontend
│   ├── context/                      # Context API for state management
│   │   └── AuthContext.js
│   ├── screens/                      # Screen components organized by feature
│   │   ├── Section0_SharedTheme/     # Shared theme and styling
│   │   ├── Section1_CommonAuth/      # Authentication & common screens
│   │   ├── Section2_Member1_DoctorPrescription/
│   │   ├── Section3_Member2_PatientManagement/
│   │   ├── Section4_Member3_Appointments/
│   │   ├── Section5_Member4_RemindersNotifications/
│   │   ├── Section6_Member5_BillingPayments/
│   │   └── Section7_Member6_LabTests/
│   └── services/                     # API integration services
│       ├── api.js                    # Axios API client configuration
│       ├── authService.js
│       ├── appointmentService.js
│       ├── doctorService.js
│       ├── patientService.js
│       ├── prescriptionService.js
│       └── otherServices.js
│
├── backend/                           # Node.js/Express Backend
│   ├── controllers/                  # Business logic handlers
│   │   ├── authController.js
│   │   ├── appointmentController.js
│   │   ├── billingController.js
│   │   ├── doctorController.js
│   │   ├── labTestController.js
│   │   ├── notificationController.js
│   │   ├── patientController.js
│   │   ├── prescriptionController.js
│   │   ├── ratingController.js
│   │   └── reminderController.js
│   ├── models/                       # MongoDB schemas
│   │   ├── Appointment.js
│   │   ├── Bill.js
│   │   ├── Doctor.js
│   │   ├── LabTest.js
│   │   ├── Notification.js
│   │   ├── Patient.js
│   │   ├── Prescription.js
│   │   ├── Rating.js
│   │   ├── Reminder.js
│   │   └── User.js
│   ├── routes/                       # API endpoints
│   │   ├── authRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── labTestRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── ratingRoutes.js
│   │   └── reminderRoutes.js
│   ├── middleware/                   # Express middleware
│   │   ├── authMiddleware.js         # JWT authentication
│   │   ├── rateLimitMiddleware.js    # API rate limiting
│   │   └── uploadMiddleware.js       # File upload handling
│   ├── utils/                        # Utility functions
│   │   ├── crudFactory.js            # Generic CRUD operations
│   │   ├── email.js                  # Email sending utilities
│   │   ├── nextCode.js
│   │   └── notificationEvents.js
│   ├── scripts/                      # Database seeding scripts
│   │   ├── seedData.js
│   │   └── seedAllSections.js
│   ├── uploads/                      # File storage directory
│   ├── server.js                     # Express app entry point
│   ├── package.json
│   └── vercel.json                   # Vercel deployment config
│
├── App.js                            # Main React Native entry point
├── app.json                          # Expo configuration
├── babel.config.js                   # Babel configuration
├── index.js                          # App initialization
├── eas.json                          # Expo Application Services config
├── package.json                      # Frontend dependencies
├── vercel.json                       # Vercel deployment config
└── README.md                         # This file
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn** (v6 or higher)
- **Expo CLI** (for running React Native app)
- **MongoDB** (v4.4 or higher) - Local or MongoDB Atlas
- **Git**

### Optional
- **Android Studio** or **Xcode** (for native app development)
- **Postman** (for API testing)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SmartClinic.git
cd SmartClinic
```

### 2. Install Frontend Dependencies

```bash
npm install
# or
yarn install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

Create `.env` files for both frontend and backend (see [Environment Configuration](#environment-configuration) below).

### 5. Initialize Database (Optional)

Run seed scripts to populate initial data:

```bash
cd backend
node scripts/seedData.js
# or for comprehensive seeding
node scripts/seedAllSections.js
cd ..
```

## 🔧 Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartclinic
# or for local MongoDB
# MONGODB_URI=mongodb://localhost:27017/smartclinic

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Email Configuration (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Rate Limiting
RATE_LIMIT_PER_MINUTE=200

# Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=./uploads

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create a `.env` file in the root directory (if needed):

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api
EXPO_PUBLIC_ENV=development
```

## ▶️ Running the Application

### Backend Server

```bash
cd backend

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

Health check: `GET http://localhost:5000/health`

### Frontend Mobile App

```bash
# Terminal 1: Start Expo development server
npm start

# In another terminal, run on specific platform:
# For iOS
npm run ios

# For Android
npm run android

# For Web
npm run web
```

The app will be available on your mobile device via Expo Go app or browser at `http://localhost:19000`

## 📡 API Endpoints

All API endpoints are prefixed with `/api`

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /verify-otp` - Verify OTP
- `POST /resend-otp` - Resend OTP
- `POST /forgot-password` - Initiate password reset
- `POST /reset-password` - Reset password

### Doctors (`/api/doctors`)
- `GET /` - Get all doctors
- `GET /:id` - Get doctor details
- `POST /` - Create doctor profile
- `PUT /:id` - Update doctor profile
- `DELETE /:id` - Delete doctor

### Patients (`/api/patients`)
- `GET /` - Get all patients
- `GET /:id` - Get patient details
- `POST /` - Create patient profile
- `PUT /:id` - Update patient profile

### Appointments (`/api/appointments`)
- `GET /` - Get appointments
- `GET /:id` - Get appointment details
- `POST /` - Create appointment
- `PUT /:id` - Update appointment
- `DELETE /:id` - Cancel appointment

### Prescriptions (`/api/prescriptions`)
- `GET /` - Get prescriptions
- `GET /:id` - Get prescription details
- `POST /` - Create prescription
- `PUT /:id` - Update prescription

### Lab Tests (`/api/labtests`)
- `GET /` - Get lab tests
- `GET /:id` - Get test details
- `POST /` - Order lab test
- `PUT /:id` - Update test results

### Billing (`/api/billing`)
- `GET /` - Get bills
- `GET /:id` - Get bill details
- `POST /` - Create bill
- `PUT /:id` - Update payment status

### Notifications (`/api/notifications`)
- `GET /` - Get notifications
- `POST /` - Send notification
- `PUT /:id` - Mark as read

### Reminders (`/api/reminders`)
- `GET /` - Get reminders
- `POST /` - Create reminder
- `PUT /:id` - Update reminder

### Ratings (`/api/ratings`)
- `GET /` - Get ratings
- `POST /` - Create rating
- `PUT /:id` - Update rating

## 🏗️ Project Architecture

### Frontend Architecture
- **Component-based**: Modular, reusable React Native components
- **Context API**: Global state management for user authentication and app data
- **Service Layer**: Centralized API communication via axios
- **Thematic Organization**: Screens organized by feature (Section1, Section2, etc.)

### Backend Architecture
- **MVC Pattern**: Models, Views (API responses), Controllers (business logic)
- **Middleware Stack**: Authentication, rate limiting, request logging
- **RESTful API**: Standard HTTP methods for CRUD operations
- **Database Agnostic CRUD**: Generic factory functions for common operations
- **Error Handling**: Centralized error handling middleware
- **Security**: JWT authentication, password hashing, rate limiting

### Data Flow
```
Frontend (Expo/React Native)
    ↓
API Services (axios)
    ↓
Backend API (Express.js)
    ↓
Middleware (Auth, Rate Limit)
    ↓
Controllers (Business Logic)
    ↓
MongoDB (Data Persistence)
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Guidelines
- Use consistent naming conventions
- Add comments for complex logic
- Follow the existing project structure
- Test your changes before submitting PR

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support

For issues, questions, or suggestions, please create an issue on GitHub or contact the development team.

## 🔐 Security

- Always use strong JWT secrets in production
- Never commit `.env` files with sensitive information
- Use HTTPS in production
- Regularly update dependencies
- Implement proper CORS policies
- Sanitize user inputs
- Use environment-based configuration

---

**Last Updated**: June 2026  
**Version**: 1.0.0
