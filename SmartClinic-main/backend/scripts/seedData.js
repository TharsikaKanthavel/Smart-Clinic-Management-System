require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const Bill = require('../models/Bill');
const LabTest = require('../models/LabTest');

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartclinic';
  await mongoose.connect(uri);

  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Prescription.deleteMany({}),
    Reminder.deleteMany({}),
    Notification.deleteMany({}),
    Bill.deleteMany({}),
    LabTest.deleteMany({}),
  ]);

  const admin = await User.create({
    userId: 'USR0001',
    fullName: 'System Admin',
    email: 'admin@smartclinic.com',
    password: 'Admin1234',
    phoneNumber: '+94770000001',
    role: 'Admin',
    accountStatus: 'Active',
    isEmailVerified: true,
  });

  const doctorUser = await User.create({
    userId: 'USR0002',
    fullName: 'Dr. Amal Perera',
    email: 'doctor@smartclinic.com',
    password: 'Doctor1234',
    phoneNumber: '+94770000002',
    role: 'Doctor',
    accountStatus: 'Active',
    isEmailVerified: true,
  });

  const patientUser = await User.create({
    userId: 'USR0003',
    fullName: 'Nimal Jayawardena',
    email: 'patient@smartclinic.com',
    password: 'Patient1234',
    phoneNumber: '+94770000003',
    role: 'Patient',
    accountStatus: 'Active',
    isEmailVerified: true,
  });

  const doctor1 = await Doctor.create({
    doctorId: 'DOC0001',
    doctorName: 'Dr. Amal Perera',
    specialization: 'Cardiology',
    department: 'Cardiology',
    qualification: 'MBBS, MD',
    experienceYears: 12,
    hospitalName: 'Colombo General Hospital',
    licenseNumber: 'SLMC-1001',
    phone: '+94771111111',
    email: 'amal.perera@smartclinic.com',
    consultationFee: 2500,
    availableDays: ['Mon', 'Wed', 'Fri'],
    availableTime: '09:00 - 16:00',
    rating: 4.8,
    totalPatientsTreated: 420,
    totalAppointments: 980,
    consultationMode: 'Physical',
    status: 'Active',
  });

  const doctor2 = await Doctor.create({
    doctorId: 'DOC0002',
    doctorName: 'Dr. Nisha Silva',
    specialization: 'Dermatology',
    department: 'Dermatology',
    qualification: 'MBBS, MD',
    experienceYears: 9,
    hospitalName: 'City Care Hospital',
    licenseNumber: 'SLMC-1002',
    phone: '+94772222222',
    email: 'nisha.silva@smartclinic.com',
    consultationFee: 2000,
    availableDays: ['Tue', 'Thu', 'Sat'],
    availableTime: '10:00 - 15:00',
    rating: 4.6,
    totalPatientsTreated: 300,
    totalAppointments: 700,
    consultationMode: 'Online',
    status: 'Active',
  });

  const patient1 = await Patient.create({
    patientId: 'PAT0001',
    patientName: 'Nimal Jayawardena',
    age: 46,
    gender: 'Male',
    dateOfBirth: new Date('1979-04-11'),
    phone: '+94773333333',
    email: 'nimal.j@smartclinic.com',
    address: 'Colombo, Sri Lanka',
    bloodGroup: 'A+',
    allergies: ['Dust'],
    chronicDiseases: ['Hypertension'],
    emergencyContactName: 'Kamal Jayawardena',
    emergencyContactNumber: '+94774444444',
    insuranceProvider: 'MediCare',
    insuranceNumber: 'INS-1001',
    visitCount: 7,
    lastVisitDate: new Date(),
  });

  const patient2 = await Patient.create({
    patientId: 'PAT0002',
    patientName: 'Kamani Wickrama',
    age: 35,
    gender: 'Female',
    dateOfBirth: new Date('1990-08-23'),
    phone: '+94775555555',
    email: 'kamani.w@smartclinic.com',
    address: 'Kandy, Sri Lanka',
    bloodGroup: 'O+',
    allergies: ['Peanut'],
    chronicDiseases: [],
    emergencyContactName: 'Suresh Wickrama',
    emergencyContactNumber: '+94776666666',
    insuranceProvider: 'LifeHealth',
    insuranceNumber: 'INS-1002',
    visitCount: 3,
    lastVisitDate: new Date(),
  });

  const appt1 = await Appointment.create({
    appointmentId: 'APT0001',
    patientId: patient1._id,
    patientName: patient1.patientName,
    doctorId: doctor1._id,
    doctorName: doctor1.doctorName,
    appointmentDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    appointmentTime: '10:30 AM',
    reasonForVisit: 'Blood pressure follow-up',
    appointmentType: 'Physical',
    queueNumber: 1,
    appointmentStatus: 'Approved',
  });

  const appt2 = await Appointment.create({
    appointmentId: 'APT0002',
    patientId: patient2._id,
    patientName: patient2.patientName,
    doctorId: doctor2._id,
    doctorName: doctor2.doctorName,
    appointmentDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    appointmentTime: '2:00 PM',
    reasonForVisit: 'Skin rash consultation',
    appointmentType: 'Online',
    queueNumber: 2,
    appointmentStatus: 'Pending',
  });

  await Prescription.create({
    prescriptionId: 'RX0001',
    doctorId: doctor1._id,
    doctorName: doctor1.doctorName,
    patientId: patient1._id,
    patientName: patient1.patientName,
    medicines: [
      { medicineName: 'Amlodipine', dosage: '5mg', instructions: 'Once daily', quantity: 30, duration: '30 days' },
      { medicineName: 'Aspirin', dosage: '75mg', instructions: 'Once daily', quantity: 30, duration: '30 days' },
    ],
    refillAllowed: true,
    notes: 'Reduce salt intake and monitor BP daily.',
    diagnosis: 'Hypertension',
    dateIssued: new Date(),
    followUpDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    status: 'Active',
  });

  await Reminder.create({
    reminderId: 'REM0001',
    userId: patientUser._id,
    medicineName: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily',
    reminderTime: '08:00 AM',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    reminderType: 'Daily',
    takenStatus: 'Pending',
    status: 'Active',
  });

  await Notification.create({
    notificationId: 'NOT0001',
    userId: patientUser._id,
    title: 'Appointment Reminder',
    message: 'You have an appointment tomorrow at 10:30 AM.',
    notificationType: 'Appointment',
    priorityLevel: 'Medium',
    status: 'Unread',
    deliveryMethod: 'Push',
    audience: 'Patients Only',
  });

  await Bill.create({
    billId: 'BIL0001',
    patientId: patient1._id,
    appointmentId: appt1._id,
    doctorId: doctor1._id,
    items: [
      { description: 'Consultation Fee', amount: 2500 },
      { description: 'ECG', amount: 1500 },
    ],
    totalAmount: 4000,
    paidAmount: 2000,
    balanceDue: 2000,
    discount: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Partial',
    insuranceClaim: false,
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    notes: 'Pay balance within 7 days',
    transactions: [
      { amount: 2000, method: 'Cash', reference: 'TXN-1001', paidAt: new Date(), note: 'Initial payment' },
    ],
  });

  await LabTest.create({
    labTestId: 'LAB0001',
    patientId: patient1._id,
    doctorId: doctor1._id,
    patientName: patient1.patientName,
    doctorName: doctor1.doctorName,
    testName: 'Complete Blood Count',
    testCategory: 'Haematology',
    sampleType: 'Blood',
    priority: 'Routine',
    status: 'Completed',
    resultValue: 'Normal',
    normalRange: '4.5-11.0',
    resultStatus: 'Normal',
    criticalFlag: false,
    testedAt: new Date(),
    collectionDate: new Date(),
    notes: 'All values within normal range',
  });

  console.log('Seed complete');
  console.log('Users: admin@smartclinic.com / Admin1234, doctor@smartclinic.com / Doctor1234, patient@smartclinic.com / Patient1234');

  await mongoose.disconnect();
}

seed().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
