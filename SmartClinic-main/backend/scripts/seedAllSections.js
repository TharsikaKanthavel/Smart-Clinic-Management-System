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
const Rating = require('../models/Rating');

const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

async function seedAllSections() {
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

  const users = [];
  users.push(await User.create({ userId: 'USR0001', fullName: 'System Admin', email: 'admin@smartclinic.com', password: 'Admin1234', phoneNumber: '+94770000001', role: 'Admin', accountStatus: 'Active', isEmailVerified: true }));
  users.push(await User.create({ userId: 'USR0002', fullName: 'Dr. Amal Perera', email: 'doctor1@smartclinic.com', password: 'Doctor1234', phoneNumber: '+94770000002', role: 'Doctor', accountStatus: 'Active', isEmailVerified: true }));
  users.push(await User.create({ userId: 'USR0003', fullName: 'Dr. Nisha Silva', email: 'doctor2@smartclinic.com', password: 'Doctor1234', phoneNumber: '+94770000003', role: 'Doctor', accountStatus: 'Active', isEmailVerified: true }));
  users.push(await User.create({ userId: 'USR0004', fullName: 'Nimal Jayawardena', email: 'patient1@smartclinic.com', password: 'Patient1234', phoneNumber: '+94770000004', role: 'Patient', accountStatus: 'Active', isEmailVerified: true }));
  users.push(await User.create({ userId: 'USR0005', fullName: 'Kamani Wickrama', email: 'patient2@smartclinic.com', password: 'Patient1234', phoneNumber: '+94770000005', role: 'Patient', accountStatus: 'Active', isEmailVerified: true }));
  users.push(await User.create({ userId: 'USR0006', fullName: 'Suresh Ratnayake', email: 'patient3@smartclinic.com', password: 'Patient1234', phoneNumber: '+94770000006', role: 'Patient', accountStatus: 'Active', isEmailVerified: true }));

  const [adminUser, doctorUser1, doctorUser2, patientUser1, patientUser2, patientUser3] = users;

  const doctors = await Doctor.insertMany([
    {
      doctorId: 'DOC0001', doctorName: 'Dr. Amal Perera', specialization: 'Cardiology', department: 'Cardiology', qualification: 'MBBS, MD',
      experienceYears: 12, hospitalName: 'Colombo General Hospital', licenseNumber: 'SLMC-1001', phone: '+94771111111',
      email: 'doctor1@smartclinic.com', consultationFee: 2500, availableDays: ['Mon', 'Wed', 'Fri'], availableTime: '09:00 - 16:00',
      rating: 4.8, totalPatientsTreated: 420, totalAppointments: 980, consultationMode: 'Physical', status: 'Active'
    },
    {
      doctorId: 'DOC0002', doctorName: 'Dr. Nisha Silva', specialization: 'Dermatology', department: 'Dermatology', qualification: 'MBBS, MD',
      experienceYears: 9, hospitalName: 'City Care Hospital', licenseNumber: 'SLMC-1002', phone: '+94772222222',
      email: 'doctor2@smartclinic.com', consultationFee: 2000, availableDays: ['Tue', 'Thu', 'Sat'], availableTime: '10:00 - 15:00',
      rating: 4.6, totalPatientsTreated: 300, totalAppointments: 700, consultationMode: 'Online', status: 'Active'
    },
    {
      doctorId: 'DOC0003', doctorName: 'Dr. Kamal Fernando', specialization: 'Neurology', department: 'Neurology', qualification: 'MBBS, MD',
      experienceYears: 15, hospitalName: 'Metro Specialist Centre', licenseNumber: 'SLMC-1003', phone: '+94773333333',
      email: 'kamal.fernando@smartclinic.com', consultationFee: 3200, availableDays: ['Mon', 'Tue', 'Thu'], availableTime: '11:00 - 17:00',
      rating: 4.7, totalPatientsTreated: 510, totalAppointments: 1020, consultationMode: 'Both', status: 'Active'
    },
    {
      doctorId: 'DOC0004', doctorName: 'Dr. Priya Mendis', specialization: 'Pediatrics', department: 'Pediatrics', qualification: 'MBBS, DCH',
      experienceYears: 8, hospitalName: 'Sunrise Children Hospital', licenseNumber: 'SLMC-1004', phone: '+94774444444',
      email: 'priya.mendis@smartclinic.com', consultationFee: 1800, availableDays: ['Wed', 'Fri', 'Sat'], availableTime: '08:00 - 14:00',
      rating: 4.5, totalPatientsTreated: 280, totalAppointments: 540, consultationMode: 'Physical', status: 'Inactive'
    },
  ]);

  const patients = await Patient.insertMany([
    {
      patientId: 'PAT0001', patientName: 'Nimal Jayawardena', age: 46, gender: 'Male', dateOfBirth: new Date('1979-04-11'),
      phone: '+94775550001', email: 'patient1@smartclinic.com', address: 'Colombo, Sri Lanka', bloodGroup: 'A+', allergies: ['Dust'],
      chronicDiseases: ['Hypertension'], emergencyContactName: 'Kamal Jayawardena', emergencyContactNumber: '+94775559001',
      insuranceProvider: 'MediCare', insuranceNumber: 'INS-1001', visitCount: 7, lastVisitDate: addDays(-3)
    },
    {
      patientId: 'PAT0002', patientName: 'Kamani Wickrama', age: 35, gender: 'Female', dateOfBirth: new Date('1990-08-23'),
      phone: '+94775550002', email: 'patient2@smartclinic.com', address: 'Kandy, Sri Lanka', bloodGroup: 'O+', allergies: ['Peanut'],
      chronicDiseases: [], emergencyContactName: 'Suresh Wickrama', emergencyContactNumber: '+94775559002',
      insuranceProvider: 'LifeHealth', insuranceNumber: 'INS-1002', visitCount: 3, lastVisitDate: addDays(-10)
    },
    {
      patientId: 'PAT0003', patientName: 'Suresh Ratnayake', age: 63, gender: 'Male', dateOfBirth: new Date('1962-02-17'),
      phone: '+94775550003', email: 'patient3@smartclinic.com', address: 'Galle, Sri Lanka', bloodGroup: 'B+', allergies: [],
      chronicDiseases: ['Diabetes'], emergencyContactName: 'Nadeeka Ratnayake', emergencyContactNumber: '+94775559003',
      insuranceProvider: 'HealthFirst', insuranceNumber: 'INS-1003', visitCount: 9, lastVisitDate: addDays(-1)
    },
    {
      patientId: 'PAT0004', patientName: 'Priya Jayasuriya', age: 29, gender: 'Female', dateOfBirth: new Date('1996-01-02'),
      phone: '+94775550004', email: 'priya.j@smartclinic.com', address: 'Negombo, Sri Lanka', bloodGroup: 'AB+', allergies: ['Penicillin'],
      chronicDiseases: [], emergencyContactName: 'Anura Jayasuriya', emergencyContactNumber: '+94775559004',
      insuranceProvider: 'MediCare', insuranceNumber: 'INS-1004', visitCount: 2, lastVisitDate: addDays(-25)
    },
    {
      patientId: 'PAT0005', patientName: 'Anil Perera', age: 54, gender: 'Male', dateOfBirth: new Date('1972-07-19'),
      phone: '+94775550005', email: 'anil.p@smartclinic.com', address: 'Matara, Sri Lanka', bloodGroup: 'O-', allergies: ['Seafood'],
      chronicDiseases: ['Asthma'], emergencyContactName: 'Ruwan Perera', emergencyContactNumber: '+94775559005',
      insuranceProvider: 'LifeHealth', insuranceNumber: 'INS-1005', visitCount: 5, lastVisitDate: addDays(-7)
    },
    {
      patientId: 'PAT0006', patientName: 'Dilshan Mendis', age: 41, gender: 'Male', dateOfBirth: new Date('1985-11-12'),
      phone: '+94775550006', email: 'dilshan.m@smartclinic.com', address: 'Kurunegala, Sri Lanka', bloodGroup: 'A-', allergies: [],
      chronicDiseases: ['Hypertension', 'Diabetes'], emergencyContactName: 'Sajini Mendis', emergencyContactNumber: '+94775559006',
      insuranceProvider: 'HealthFirst', insuranceNumber: 'INS-1006', visitCount: 11, lastVisitDate: addDays(-2)
    },
  ]);

  const [doc1, doc2, doc3] = doctors;
  const [pat1, pat2, pat3, pat4, pat5, pat6] = patients;

  const appointments = await Appointment.insertMany([
    { appointmentId: 'APT0001', patientId: pat1._id, patientName: pat1.patientName, doctorId: doc1._id, doctorName: doc1.doctorName, appointmentDate: addDays(0), appointmentTime: '10:30 AM', reasonForVisit: 'Blood pressure follow-up', appointmentType: 'Physical', queueNumber: 1, appointmentStatus: 'Approved' },
    { appointmentId: 'APT0002', patientId: pat2._id, patientName: pat2.patientName, doctorId: doc2._id, doctorName: doc2.doctorName, appointmentDate: addDays(2), appointmentTime: '2:00 PM', reasonForVisit: 'Skin rash consultation', appointmentType: 'Online', queueNumber: 2, appointmentStatus: 'Pending' },
    { appointmentId: 'APT0003', patientId: pat3._id, patientName: pat3.patientName, doctorId: doc3._id, doctorName: doc3.doctorName, appointmentDate: addDays(-1), appointmentTime: '9:00 AM', reasonForVisit: 'Headache and dizziness', appointmentType: 'Physical', queueNumber: 3, appointmentStatus: 'Completed' },
    { appointmentId: 'APT0004', patientId: pat4._id, patientName: pat4.patientName, doctorId: doc1._id, doctorName: doc1.doctorName, appointmentDate: addDays(3), appointmentTime: '11:30 AM', reasonForVisit: 'Routine checkup', appointmentType: 'Physical', queueNumber: 4, appointmentStatus: 'Pending' },
    { appointmentId: 'APT0005', patientId: pat5._id, patientName: pat5.patientName, doctorId: doc2._id, doctorName: doc2.doctorName, appointmentDate: addDays(-4), appointmentTime: '1:00 PM', reasonForVisit: 'Allergy review', appointmentType: 'Online', queueNumber: 5, appointmentStatus: 'Cancelled' },
    { appointmentId: 'APT0006', patientId: pat6._id, patientName: pat6.patientName, doctorId: doc1._id, doctorName: doc1.doctorName, appointmentDate: addDays(5), appointmentTime: '3:30 PM', reasonForVisit: 'Diabetes review', appointmentType: 'Physical', queueNumber: 6, appointmentStatus: 'Approved' },
  ]);

  await Prescription.insertMany([
    {
      prescriptionId: 'RX0001', doctorId: doc1._id, doctorName: doc1.doctorName, patientId: pat1._id, patientName: pat1.patientName,
      medicines: [
        { medicineName: 'Amlodipine', dosage: '5mg', instructions: 'Once daily', quantity: 30, duration: '30 days' },
        { medicineName: 'Aspirin', dosage: '75mg', instructions: 'Once daily', quantity: 30, duration: '30 days' },
      ], refillAllowed: true, notes: 'Reduce salt intake', diagnosis: 'Hypertension', dateIssued: addDays(-2), followUpDate: addDays(12), status: 'Active'
    },
    {
      prescriptionId: 'RX0002', doctorId: doc2._id, doctorName: doc2.doctorName, patientId: pat2._id, patientName: pat2.patientName,
      medicines: [
        { medicineName: 'Cetirizine', dosage: '10mg', instructions: 'At night', quantity: 14, duration: '14 days' },
      ], refillAllowed: false, notes: 'Avoid allergen exposure', diagnosis: 'Allergic Dermatitis', dateIssued: addDays(-8), followUpDate: addDays(7), status: 'Completed'
    },
    {
      prescriptionId: 'RX0003', doctorId: doc3._id, doctorName: doc3.doctorName, patientId: pat3._id, patientName: pat3.patientName,
      medicines: [
        { medicineName: 'Paracetamol', dosage: '500mg', instructions: 'Twice daily', quantity: 10, duration: '5 days' },
      ], refillAllowed: false, notes: 'Hydration and rest', diagnosis: 'Tension Headache', dateIssued: addDays(-1), followUpDate: addDays(10), status: 'Active'
    },
  ]);

  await Reminder.insertMany([
    { reminderId: 'REM0001', userId: patientUser1._id, medicineName: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', reminderTime: '08:00 AM', startDate: addDays(-2), endDate: addDays(28), reminderType: 'Daily', takenStatus: 'Pending', status: 'Active' },
    { reminderId: 'REM0002', userId: patientUser2._id, medicineName: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', reminderTime: '09:00 PM', startDate: addDays(-1), endDate: addDays(13), reminderType: 'Daily', takenStatus: 'Taken', status: 'Active' },
    { reminderId: 'REM0003', userId: patientUser3._id, medicineName: 'Metformin', dosage: '500mg', frequency: 'Twice daily', reminderTime: '07:00 AM', startDate: addDays(-5), endDate: addDays(25), reminderType: 'Daily', takenStatus: 'Missed', missedCount: 2, status: 'Active' },
  ]);

  await Notification.insertMany([
    { notificationId: 'NOT0001', userId: patientUser1._id, title: 'Appointment Reminder', message: 'You have an appointment tomorrow at 10:30 AM.', notificationType: 'Appointment', priorityLevel: 'Medium', status: 'Unread', deliveryMethod: 'Push', audience: 'Patients Only' },
    { notificationId: 'NOT0002', userId: patientUser2._id, title: 'Medicine Reminder', message: 'Time to take Cetirizine.', notificationType: 'Medicine', priorityLevel: 'Low', status: 'Unread', deliveryMethod: 'Push', audience: 'Patients Only' },
    { notificationId: 'NOT0003', userId: adminUser._id, title: 'System Alert', message: '2 overdue bills need attention.', notificationType: 'System', priorityLevel: 'High', status: 'Unread', deliveryMethod: 'Email', audience: 'Admin Only' },
    { notificationId: 'NOT0004', userId: doctorUser1._id, title: 'Schedule Update', message: 'New appointment added on Friday.', notificationType: 'DoctorSchedule', priorityLevel: 'Medium', status: 'Read', deliveryMethod: 'Push', audience: 'Doctors Only' },
  ]);

  await Bill.insertMany([
    {
      billId: 'BIL0001', patientId: pat1._id, appointmentId: appointments[0]._id, doctorId: doc1._id,
      items: [{ description: 'Consultation Fee', amount: 2500 }, { description: 'ECG', amount: 1500 }], totalAmount: 4000,
      paidAmount: 2000, balanceDue: 2000, discount: 0, paymentMethod: 'Cash', paymentStatus: 'Partial', insuranceClaim: false,
      invoiceDate: addDays(-1), dueDate: addDays(7), notes: 'Pay balance within 7 days', transactions: [{ amount: 2000, method: 'Cash', reference: 'TXN-1001', paidAt: addDays(-1), note: 'Initial payment' }]
    },
    {
      billId: 'BIL0002', patientId: pat2._id, appointmentId: appointments[1]._id, doctorId: doc2._id,
      items: [{ description: 'Consultation Fee', amount: 2000 }], totalAmount: 2000,
      paidAmount: 2000, balanceDue: 0, discount: 0, paymentMethod: 'Card', paymentStatus: 'Paid', insuranceClaim: false,
      invoiceDate: addDays(-2), dueDate: addDays(5), notes: 'Paid in full', transactions: [{ amount: 2000, method: 'Card', reference: 'TXN-1002', paidAt: addDays(-2), note: 'Full payment' }]
    },
    {
      billId: 'BIL0003', patientId: pat3._id, appointmentId: appointments[2]._id, doctorId: doc3._id,
      items: [{ description: 'Consultation Fee', amount: 3200 }, { description: 'Lab Panel', amount: 1800 }], totalAmount: 5000,
      paidAmount: 0, balanceDue: 5000, discount: 500, paymentMethod: 'Insurance', paymentStatus: 'Overdue', insuranceClaim: true,
      invoiceDate: addDays(-20), dueDate: addDays(-5), notes: 'Awaiting insurer confirmation'
    },
  ]);

  await LabTest.deleteMany({});
  await LabTest.insertMany([
    {
      labTestId: 'LAB0001', patientId: pat1._id, doctorId: doc1._id, patientName: pat1.patientName, doctorName: doc1.doctorName,
      testName: 'Complete Blood Count', testCategory: 'Haematology', sampleType: 'Blood', priority: 'Routine',
      status: 'Completed', resultValue: 'Normal', normalRange: '4.5-11.0', resultStatus: 'Normal',
      detailedResults: [{ name: 'WBC', value: '6.2', unit: 'x10^9/L', normalRange: '4.5-11.0', status: 'Normal' }],
      criticalFlag: false, testedAt: addDays(-1), collectionDate: addDays(-2), notes: 'All values in normal range'
    },
    {
      labTestId: 'LAB0002', patientId: pat2._id, doctorId: doc2._id, patientName: pat2.patientName, doctorName: doc2.doctorName,
      testName: 'Allergy Panel', testCategory: 'Immunology', sampleType: 'Blood', priority: 'Urgent',
      status: 'Processing', resultValue: '', normalRange: '', resultStatus: 'Processing',
      criticalFlag: false, collectionDate: addDays(0), notes: 'Pending lab processing'
    },
    {
      labTestId: 'LAB0003', patientId: pat3._id, doctorId: doc3._id, patientName: pat3.patientName, doctorName: doc3.doctorName,
      testName: 'MRI Brain', testCategory: 'Radiology', sampleType: 'N/A', priority: 'STAT',
      status: 'Completed', resultValue: 'Abnormal finding', normalRange: 'N/A', resultStatus: 'Abnormal',
      detailedResults: [{ name: 'Lesion', value: 'Present', unit: '', normalRange: 'Absent', status: 'Abnormal' }],
      criticalFlag: true, testedAt: addDays(-3), collectionDate: addDays(-4), notes: 'Urgent neurology review needed'
    },
  ]);

  await Rating.deleteMany({});
  await Rating.insertMany([
    { patientId: pat1._id, doctorId: doc1._id, appointmentId: appointments[0]._id, rating: 5, reviewText: 'Excellent service!' },
    { patientId: pat2._id, doctorId: doc1._id, appointmentId: appointments[3]._id, rating: 4, reviewText: 'Good experience' },
    { patientId: pat3._id, doctorId: doc2._id, appointmentId: appointments[1]._id, rating: 5, reviewText: 'Very helpful!' },
    { patientId: pat6._id, doctorId: doc1._id, appointmentId: appointments[5]._id, rating: 5, reviewText: 'Best cardiologist' },
  ]);

  await Doctor.findByIdAndUpdate(doc1._id, { rating: 4.7 });
  await Doctor.findByIdAndUpdate(doc2._id, { rating: 5.0 });

  console.log('Full sample data inserted for all sections');
  console.log('Users:');
  console.log('- admin@smartclinic.com / Admin1234');
  console.log('- doctor1@smartclinic.com / Doctor1234');
  console.log('- doctor2@smartclinic.com / Doctor1234');
  console.log('- patient1@smartclinic.com / Patient1234');

  await mongoose.disconnect();
}

seedAllSections().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
