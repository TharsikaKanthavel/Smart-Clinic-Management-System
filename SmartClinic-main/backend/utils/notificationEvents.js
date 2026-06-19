const Notification = require('../models/Notification');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { nextCode } = require('./nextCode');

async function allocateNotificationId() {
  for (let i = 0; i < 5; i++) {
    const candidate = await nextCode(Notification, 'notificationId', 'NOT');
    const exists = await Notification.exists({ notificationId: candidate });
    if (!exists) return candidate;
  }
  return null;
}

async function getUserIdByEmail(email) {
  if (!email) return null;
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }, { _id: 1 }).lean();
  return user?._id || null;
}

async function getUserIdForPatient(patient = null) {
  if (!patient) return null;
  const byEmail = await getUserIdByEmail(patient?.email);
  if (byEmail) return byEmail;
  const phone = String(patient?.phone || '').replace(/\s+/g, '');
  if (phone) {
    const byPhone = await User.findOne(
      { role: 'Patient', phoneNumber: { $regex: `^\\+?${phone.replace(/^\+/, '')}$` } },
      { _id: 1 }
    ).lean();
    if (byPhone?._id) return byPhone._id;
  }
  const name = String(patient?.patientName || patient?.name || '').trim();
  if (name) {
    const byName = await User.findOne({ role: 'Patient', fullName: name }, { _id: 1 }).lean();
    if (byName?._id) return byName._id;
  }
  return null;
}

async function getPatientContext(patientId, fallbackName = '') {
  let patient = null;
  if (patientId) patient = await Patient.findById(patientId).lean();
  const userId = await getUserIdForPatient(patient);
  const name = fallbackName || patient?.patientName || patient?.name || 'Patient';
  return { patient, userId, name };
}

async function getDoctorContext(doctorId, fallbackName = '') {
  let doctor = null;
  if (doctorId) doctor = await Doctor.findById(doctorId).lean();
  const userId = await getUserIdByEmail(doctor?.email);
  const name = fallbackName || doctor?.doctorName || doctor?.name || 'Doctor';
  return { doctor, userId, name };
}

async function createNotification(payload) {
  try {
    const notificationId = await allocateNotificationId();
    const doc = {
      notificationId: notificationId || undefined,
      title: payload.title || 'System Notification',
      message: payload.message || '',
      notificationType: payload.notificationType || 'System',
      priorityLevel: payload.priorityLevel || 'Medium',
      status: 'Unread',
      deliveryMethod: payload.deliveryMethod || 'Push',
      audience: payload.audience || 'All Users',
      userId: payload.userId || undefined,
      scheduledAt: payload.scheduledAt || undefined,
    };
    await Notification.create(doc);
    return true;
  } catch {
    return false;
  }
}

async function notifyAppointmentCreated(appointment) {
  const p = await getPatientContext(appointment?.patientId, appointment?.patientName);
  const d = await getDoctorContext(appointment?.doctorId, appointment?.doctorName);
  const dateText = appointment?.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'scheduled date';
  const timeText = appointment?.appointmentTime || 'scheduled time';

  await createNotification({
    userId: p.userId,
    audience: 'Patients Only',
    title: 'Appointment Booked',
    message: `Your appointment with ${d.name} is booked for ${dateText} at ${timeText}.`,
    notificationType: 'Appointment',
    priorityLevel: 'Medium',
  });

  await createNotification({
    userId: d.userId,
    audience: 'Doctors Only',
    title: 'New Appointment',
    message: `New appointment from ${p.name} on ${dateText} at ${timeText}.`,
    notificationType: 'Appointment',
    priorityLevel: 'Medium',
  });
}

async function notifyAppointmentStatusChanged(appointment, newStatus) {
  const p = await getPatientContext(appointment?.patientId, appointment?.patientName);
  const d = await getDoctorContext(appointment?.doctorId, appointment?.doctorName);
  await createNotification({
    userId: p.userId,
    audience: 'Patients Only',
    title: 'Appointment Status Updated',
    message: `Your appointment with ${d.name} is now ${newStatus}.`,
    notificationType: 'Appointment',
    priorityLevel: newStatus === 'Cancelled' || newStatus === 'Rejected' ? 'High' : 'Medium',
  });
}

async function notifyAppointmentRescheduled(appointment) {
  const p = await getPatientContext(appointment?.patientId, appointment?.patientName);
  const d = await getDoctorContext(appointment?.doctorId, appointment?.doctorName);
  const dateText = appointment?.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'updated date';
  const timeText = appointment?.appointmentTime || 'updated time';

  await createNotification({
    userId: p.userId,
    audience: 'Patients Only',
    title: 'Appointment Rescheduled',
    message: `Your appointment with ${d.name} was rescheduled to ${dateText} at ${timeText}.`,
    notificationType: 'Appointment',
    priorityLevel: 'Medium',
  });
}

async function notifyPrescriptionCreated(prescription) {
  const p = await getPatientContext(prescription?.patientId, prescription?.patientName);
  const d = await getDoctorContext(prescription?.doctorId, prescription?.doctorName);
  await createNotification({
    userId: p.userId,
    audience: 'Patients Only',
    title: 'New Prescription',
    message: `A new prescription was issued by ${d.name}.`,
    notificationType: 'Medicine',
    priorityLevel: 'Medium',
  });
}

async function notifyBillCreated(bill, patientName = 'Patient') {
  const p = await getPatientContext(bill?.patientId, patientName);
  const dueText = bill?.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A';
  await createNotification({
    userId: p.userId,
    audience: 'Patients Only',
    title: 'New Invoice',
    message: `A new invoice has been created. Total: Rs.${Number(bill?.totalAmount || 0)}. Due: ${dueText}.`,
    notificationType: 'System',
    priorityLevel: 'Medium',
  });
}

async function notifyBillPaymentRecorded(bill, patientName = 'Patient', amount = 0) {
  const p = await getPatientContext(bill?.patientId, patientName);
  await createNotification({
    userId: p.userId,
    audience: 'Patients Only',
    title: 'Payment Recorded',
    message: `Payment of Rs.${Number(amount || 0)} recorded. Remaining balance: Rs.${Number(bill?.balanceDue || 0)}.`,
    notificationType: 'System',
    priorityLevel: 'Low',
  });
}

async function notifyOverdueBills(updatedCount = 0) {
  if (!updatedCount) return;
  await createNotification({
    audience: 'Admin Only',
    title: 'Overdue Bills Updated',
    message: `${updatedCount} bills were marked as overdue automatically.`,
    notificationType: 'System',
    priorityLevel: 'High',
  });
}

async function notifyReportSubmitted(patientRecordOrId, fileName = '', actor = {}) {
  let patient = null;
  if (patientRecordOrId && typeof patientRecordOrId === 'object') {
    patient = patientRecordOrId;
  } else if (patientRecordOrId) {
    patient = await Patient.findById(patientRecordOrId).lean();
  }
  if (!patient) return;

  const p = await getPatientContext(patient._id, patient.patientName || patient.name);
  const reportText = fileName ? ` (${fileName})` : '';
  const actorRole = String(actor?.role || '');
  const actorUserId = actor?.userId || null;
  const targetPatientUserId = actorRole === 'Patient' && actorUserId ? actorUserId : p.userId;

  if (targetPatientUserId) {
    await createNotification({
      userId: targetPatientUserId,
      audience: 'Patients Only',
      title: 'Medical Report Submitted',
      message: `A new medical report${reportText} was added to your profile.`,
      notificationType: 'System',
      priorityLevel: 'Medium',
    });
  }

  const admins = await User.find({ role: 'Admin' }, { _id: 1 }).lean();
  for (const admin of admins) {
    await createNotification({
      userId: admin._id,
      audience: 'Admin Only',
      title: 'Patient Report Submission',
      message: `${p.name} submitted a medical report${reportText}.`,
      notificationType: 'System',
      priorityLevel: 'Medium',
    });
  }
}

module.exports = {
  notifyAppointmentCreated,
  notifyAppointmentStatusChanged,
  notifyAppointmentRescheduled,
  notifyPrescriptionCreated,
  notifyBillCreated,
  notifyBillPaymentRecorded,
  notifyOverdueBills,
  notifyReportSubmitted,
};
