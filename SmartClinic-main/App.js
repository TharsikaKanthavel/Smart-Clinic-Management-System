import React, { useEffect, useState } from 'react';
import { Alert, View, ActivityIndicator, Linking } from 'react-native';
import { AuthProvider, useAuth } from './frontend/context/AuthContext';
import { ThemeProvider } from './frontend/screens/Section0_SharedTheme/theme';

import { SplashScreen } from './frontend/screens/Section1_CommonAuth/SplashScreen';
import { LandingScreen } from './frontend/screens/Section1_CommonAuth/LandingScreen';
import { LoginScreen } from './frontend/screens/Section1_CommonAuth/LoginScreen';
import { RegisterScreen } from './frontend/screens/Section1_CommonAuth/RegisterScreen';
import { OTPVerifyScreen } from './frontend/screens/Section1_CommonAuth/OTPVerifyScreen';
import { DashboardScreen } from './frontend/screens/Section1_CommonAuth/DashboardScreen';
import { AdminReportsScreen } from './frontend/screens/Section1_CommonAuth/AdminReportsScreen';
import { ChangePasswordScreen } from './frontend/screens/Section1_CommonAuth/ChangePasswordScreen';
import { ThemeSettingsScreen } from './frontend/screens/Section1_CommonAuth/ThemeSettingsScreen';
import { ProfileScreen } from './frontend/screens/Section1_CommonAuth/ProfileScreen';
import { EditProfileScreen } from './frontend/screens/Section1_CommonAuth/EditProfileScreen';
import { AdminUsersScreen } from './frontend/screens/Section1_CommonAuth/AdminUsersScreen';
import { AdminUserFormScreen } from './frontend/screens/Section1_CommonAuth/AdminUserFormScreen';

import { DoctorListScreen } from './frontend/screens/Section2_Member1_DoctorPrescription/DoctorListScreen';
import { DoctorProfileScreen } from './frontend/screens/Section2_Member1_DoctorPrescription/DoctorProfileScreen';
import { AddEditDoctorScreen } from './frontend/screens/Section2_Member1_DoctorPrescription/AddEditDoctorScreen';
import { DoctorCalendarScreen } from './frontend/screens/Section2_Member1_DoctorPrescription/DoctorCalendarScreen';
import { DoctorConsultationHistoryScreen } from './frontend/screens/Section2_Member1_DoctorPrescription/DoctorConsultationHistoryScreen';
import { PrescriptionListScreen } from './frontend/screens/Section2_Member1_DoctorPrescription/PrescriptionListScreen';
import { PrescriptionDetailScreen } from './frontend/screens/Section2_Member1_DoctorPrescription/PrescriptionDetailScreen';
import { AddPrescriptionScreen } from './frontend/screens/Section2_Member1_DoctorPrescription/AddPrescriptionScreen';
import { PrescriptionHistoryScreen } from './frontend/screens/Section2_Member1_DoctorPrescription/PrescriptionHistoryScreen';
import { PrescriptionAnalyticsScreen } from './frontend/screens/Section2_Member1_DoctorPrescription/PrescriptionAnalyticsScreen';

import { PatientListScreen } from './frontend/screens/Section3_Member2_PatientManagement/PatientListScreen';
import { PatientProfileScreen } from './frontend/screens/Section3_Member2_PatientManagement/PatientProfileScreen';
import { AddEditPatientScreen } from './frontend/screens/Section3_Member2_PatientManagement/AddEditPatientScreen';
import { MedicalHistoryScreen, MedicalReportsScreen, HealthSummaryScreen } from './frontend/screens/Section3_Member2_PatientManagement/MedicalScreens';

import { AppointmentListScreen } from './frontend/screens/Section4_Member3_Appointments/AppointmentListScreen';
import { AppointmentDetailScreen } from './frontend/screens/Section4_Member3_Appointments/AppointmentDetailScreen';
import { BookAppointmentScreen } from './frontend/screens/Section4_Member3_Appointments/BookAppointmentScreen';
import { DailyScheduleScreen } from './frontend/screens/Section4_Member3_Appointments/DailyScheduleScreen';
import { AppointmentStatsScreen } from './frontend/screens/Section4_Member3_Appointments/AppointmentStatsScreen';

import { ReminderListScreen } from './frontend/screens/Section5_Member4_RemindersNotifications/ReminderListScreen';
import { AddReminderScreen } from './frontend/screens/Section5_Member4_RemindersNotifications/AddReminderScreen';
import { ReminderDetailScreen } from './frontend/screens/Section5_Member4_RemindersNotifications/ReminderDetailScreen';
import { DailySummaryScreen } from './frontend/screens/Section5_Member4_RemindersNotifications/DailySummaryScreen';
import { NotificationListScreen } from './frontend/screens/Section5_Member4_RemindersNotifications/NotificationListScreen';
import { NotificationDetailScreen } from './frontend/screens/Section5_Member4_RemindersNotifications/NotificationDetailScreen';
import { AdminBroadcastScreen } from './frontend/screens/Section5_Member4_RemindersNotifications/AdminBroadcastScreen';

import { BillingListScreen } from './frontend/screens/Section6_Member5_BillingPayments/BillingListScreen';
import { BillingDetailScreen } from './frontend/screens/Section6_Member5_BillingPayments/BillingDetailScreen';
import { CreateInvoiceScreen } from './frontend/screens/Section6_Member5_BillingPayments/CreateInvoiceScreen';
import { RecordPaymentScreen } from './frontend/screens/Section6_Member5_BillingPayments/RecordPaymentScreen';
import { PaymentHistoryScreen } from './frontend/screens/Section6_Member5_BillingPayments/PaymentHistoryScreen';
import { BillingAnalyticsScreen } from './frontend/screens/Section6_Member5_BillingPayments/BillingAnalyticsScreen';

import { LabTestListScreen } from './frontend/screens/Section7_Member6_LabTests/LabTestListScreen';
import { LabTestDetailScreen } from './frontend/screens/Section7_Member6_LabTests/LabTestDetailScreen';
import { OrderLabTestScreen } from './frontend/screens/Section7_Member6_LabTests/OrderLabTestScreen';
import { LabHistoryScreen } from './frontend/screens/Section7_Member6_LabTests/LabHistoryScreen';
import { LabAnalyticsScreen } from './frontend/screens/Section7_Member6_LabTests/LabAnalyticsScreen';
import { UpdateLabResultScreen } from './frontend/screens/Section7_Member6_LabTests/UpdateLabResultScreen';

import { authService } from './frontend/services/authService';
import { doctorService } from './frontend/services/doctorService';
import { prescriptionService } from './frontend/services/prescriptionService';
import { patientService } from './frontend/services/patientService';
import { appointmentService } from './frontend/services/appointmentService';
import { reminderService, notificationService, billingService, labTestService } from './frontend/services/otherServices';
import { BASE_URL, api } from './frontend/services/api';

function Navigator() {
  const { user, loading, login, logout, updateUser } = useAuth();
  const [screen, setScreen] = useState('Splash');
  const [selected, setSelected] = useState(null);
  const [pendingLabTest, setPendingLabTest] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const authScreens = new Set(['Splash', 'Landing', 'Login', 'Register', 'OTP']);

  useEffect(() => {
    if (loading) return;
    if (!user && !authScreens.has(screen)) setScreen('Login');
    if (user && authScreens.has(screen)) setScreen('Dashboard');
  }, [loading, user, screen]);
  const go = (to, data) => {
    if (!user && !authScreens.has(to)) return setScreen('Login');
    if (data !== undefined && data !== null) setSelected(data);
    setScreen(to);
  };
  const notify = (title, msg) => {
    if (typeof window !== 'undefined' && window.alert) window.alert(`${title}: ${msg}`);
    else Alert.alert(title, msg);
  };
  const err = (e) => {
    // Suppress console.error for 401s to avoid cluttering logs during logout
    if (e?.status !== 401) {
      console.error(e);
    }
    const msg = e?.message || 'An unexpected error occurred';
    if (typeof window !== 'undefined' && window.alert) window.alert(`Error: ${msg}`);
    else Alert.alert('Error', msg);
  };

  useEffect(() => {
    let mounted = true;
    const loadCurrentPatient = async () => {
      if (!user || user?.role !== 'Patient') {
        if (mounted) setCurrentPatient(null);
        return;
      }
      try {
        try {
          const mine = await patientService.getMine();
          if (mounted) setCurrentPatient(mine?.patient || null);
          return;
        } catch {}

        const res = await patientService.getAll('');
        const allPatients = Array.isArray(res?.patients) ? res.patients : [];
        const loggedEmail = String(user?.email || '').toLowerCase();
        const loggedPhone = String(user?.phone || user?.phoneNumber || '').replace(/\s+/g, '');
        const loggedName = String(user?.fullName || user?.name || '').toLowerCase();
        const match = allPatients.find((pt) => {
          const ptEmail = String(pt?.email || '').toLowerCase();
          const ptPhone = String(pt?.phone || '').replace(/\s+/g, '');
          const ptName = String(pt?.patientName || pt?.name || '').toLowerCase();
          return (
            (loggedEmail && ptEmail && loggedEmail === ptEmail) ||
            (loggedPhone && ptPhone && loggedPhone === ptPhone) ||
            (loggedName && ptName && loggedName === ptName)
          );
        }) || null;
        if (mounted) setCurrentPatient(match);
      } catch {
        if (mounted) setCurrentPatient(null);
      }
    };
    loadCurrentPatient();
    return () => { mounted = false; };
  }, [user?.role, user?.email, user?.phone, user?.phoneNumber, user?.fullName, user?.name]);

  const isStrongPassword = (pw = '') => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
  const isObjectId = (value = '') => /^[a-fA-F0-9]{24}$/.test(String(value));
  const backendOrigin = String(BASE_URL || '').replace(/\/api\/?$/, '');
  const toPatientContext = (obj) => ({
    _id: obj?._id || '',
    patientId: obj?.patientId || '',
    patientName: obj?.patientName || obj?.name || 'Patient',
    name: obj?.patientName || obj?.name || 'Patient',
    __fullPatient: obj || null,
    __patientContext: true,
  });
  const isFullPatientRecord = (obj) => Boolean(
    obj && (
      obj.age !== undefined ||
      obj.gender !== undefined ||
      obj.dateOfBirth !== undefined ||
      obj.medicalReport !== undefined ||
      obj.chronicDiseases !== undefined ||
      obj.allergies !== undefined
    )
  );
  const isPatientContext = (obj) => Boolean(obj?.__patientContext || isFullPatientRecord(obj));
  const activePatient = isFullPatientRecord(selected)
    ? selected
    : ((user?.role === 'Patient' && currentPatient) ? currentPatient : null);
  const getPrescriptionPatientRef = (rx) => ({
    _id: typeof rx?.patientId === 'object' ? rx?.patientId?._id : rx?.patientId,
    patientId: rx?.patientId?.patientId || rx?.patientCode || '',
    name: rx?.patientName || rx?.patientId?.patientName || rx?.patientId?.name || 'Patient',
    patientName: rx?.patientName || rx?.patientId?.patientName || rx?.patientId?.name || 'Patient',
  });

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;

  const screens = {
    Splash: <SplashScreen onDone={() => go(user ? 'Dashboard' : 'Landing')} />,
    Landing: <LandingScreen onLogin={() => go('Login')} onRegister={() => go('Register')} />,
    Login: <LoginScreen onLogin={async (email, password, role) => {
      try {
        if (!email || !password) {
          notify('Validation', 'Email and password are required.');
          return;
        }
        await login(email, password, role);
        go('Dashboard');
      } catch (e) { err(e); }
    }} onRegister={() => go('Register')} onForgot={() => go('OTP')} />,
    Register: <RegisterScreen onBack={() => go('Login')} onSubmit={async (form) => {
      try {
        const name = (form.name || '').trim();
        const email = (form.email || '').toLowerCase().trim();
        const phone = String(form.phone || '').trim().replace(/\s+/g, '');
        const password = form.password || '';
        const role = form.role || 'Patient';
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const phoneOk = /^\+?[0-9]{10,15}$/.test(phone);
        const roleOk = ['Doctor', 'Patient'].includes(role);
        if (!name || !email || !password) {
          notify('Validation', 'Name, email and password are required.');
          return;
        }
        if (!emailOk) {
          notify('Validation', 'Enter a valid email address.');
          return;
        }
        if (!phoneOk) {
          notify('Validation', 'Enter a valid phone number (10-15 digits).');
          return;
        }
        if (!roleOk) {
          notify('Validation', 'Please select a valid role.');
          return;
        }
        if (!isStrongPassword(password)) {
          notify('Validation', 'Password must be at least 8 chars and include uppercase, lowercase, and number.');
          return;
        }
        if (password !== form.confirm) {
          notify('Validation', 'Passwords do not match.');
          return;
        }
        const res = await authService.register({ fullName: name, email, phoneNumber: phone, password, role });
        setPendingUserId(res.userId);
        setPendingEmail(email);
        go('OTP');
      } catch (e) { err(e); }
    }} />,
    OTP: <OTPVerifyScreen email={pendingEmail || 'user@smartclinic.com'} onBack={() => go('Login')} onVerify={async (otp) => { try { await authService.verifyOtp({ userId: pendingUserId, otp }); go('Login'); } catch (e) { err(e); } }} onResend={async () => { try { await authService.resendOtp({ userId: pendingUserId }); } catch (e) { err(e); } }} />,
    Dashboard: <DashboardScreen
      role={user?.role || 'Patient'}
      userName={user?.name || user?.fullName || 'User'}
      user={user}
      currentPatient={currentPatient}
      onNavigate={(to, data) => {
        if (to === 'BookAppointment') setSelected(null);
        go(to, data);
      }}
      onLogout={async () => { await logout(); go('Login'); }}
    />,
    AdminReports: <AdminReportsScreen
      onBack={() => go('Dashboard')}
      onOpenAppointments={() => go('AppointmentStats', { __from: 'AdminReports' })}
      onOpenBilling={() => go('BillingAnalytics', { __from: 'AdminReports' })}
      onOpenLab={() => go('LabAnalytics', { __from: 'AdminReports' })}
      onOpenPrescription={() => go('PrescriptionAnalytics', { __from: 'AdminReports' })}
    />,
    ChangePassword: <ChangePasswordScreen onBack={() => go('Profile')} onSave={async (data) => { try { await authService.changePassword(data); notify('Success', 'Password changed successfully.'); go('Profile'); } catch (e) { err(e); } }} />,
    ThemeSettings: <ThemeSettingsScreen onBack={() => go('Dashboard')} />,
    Profile: <ProfileScreen onBack={() => go('Dashboard')} onNavigate={go} onLogout={async () => { await logout(); go('Login'); }} />,
    AdminUsers: <AdminUsersScreen
      onBack={() => go('Dashboard')}
      onAdd={() => { setSelected(null); go('AdminUserForm'); }}
      onEdit={(u) => go('AdminUserForm', u)}
    />,
    AdminUserForm: <AdminUserFormScreen
      user={selected}
      onBack={() => go('AdminUsers')}
      onSave={async (form, editingUser) => {
        try {
          const fullName = String(form?.fullName || '').trim();
          const email = String(form?.email || '').toLowerCase().trim();
          const password = String(form?.password || '');
          if (!fullName || !email) {
            notify('Validation', 'Full name and email are required.');
            return;
          }
          if (!editingUser && !password) {
            notify('Validation', 'Password is required for new users.');
            return;
          }
          if (password && !isStrongPassword(password)) {
            notify('Validation', 'Password must be at least 8 chars and include uppercase, lowercase, and number.');
            return;
          }
          const payload = {
            fullName,
            email,
            phoneNumber: String(form?.phoneNumber || '').trim(),
            role: form?.role || 'Patient',
            accountStatus: form?.accountStatus || 'Active',
          };
          if (password) payload.password = password;

          if (editingUser?._id || editingUser?.id) {
            const editId = editingUser._id || editingUser.id;
            if (!editId) {
              notify('Error', 'User ID not found for update.');
              return;
            }
            await authService.updateUser(editId, payload);
            notify('Success', 'User updated.');
          } else {
            await authService.createUser(payload);
            notify('Success', 'User created.');
          }
          setSelected(null);
          go('AdminUsers');
        } catch (e) {
          err(e);
        }
      }}
    />,
    EditProfile: <EditProfileScreen
      onBack={() => go('Profile')}
      onSave={async (data) => {
        try {
          const accountPayload = data?.account || data || {};
          if (!String(accountPayload?.fullName || '').trim()) {
            notify('Validation', 'Full name is required.');
            return;
          }
          const res = await authService.updateProfile(accountPayload);
          if (res?.user) updateUser(res.user);
          if (data?.patient?.id) {
            await patientService.update(data.patient.id, data.patient);
            if ((user?.role || 'Patient') === 'Patient') {
              try {
                const mine = await patientService.getMine();
                setCurrentPatient(mine?.patient || null);
              } catch {}
            }
          }
          if (data?.doctor?.id) {
            const drId = data.doctor.id;
            const drData = data.doctor;
            const fd = new FormData();
            Object.keys(drData).forEach(k => {
               if (k === 'id') return;
               fd.append(k, String(drData[k] ?? ''));
            });
            await doctorService.update(drId, fd).catch(e => console.log('Doctor Update Error', e));
          }
          if (res?.user) updateUser(res.user);
          notify('Success', 'Profile updated.');
          setTimeout(() => go('Profile'), 500); // Small delay to allow DB consistency
        } catch (e) {
          err(e);
        }
      }}
    />,

    DoctorList: <DoctorListScreen onBack={() => go('Dashboard')} onAdd={() => { setSelected(null); go('AddDoctor'); }} onSelect={(d) => go('DoctorProfile', d)} />,
    DoctorProfile: <DoctorProfileScreen
      doctor={selected}
      onBack={() => go('DoctorList')}
      onEdit={() => go('AddDoctor', selected)}
      onCalendar={() => go('DoctorCalendar', selected)}
      onHistory={() => go('ConsultationHistory', selected)}
      onToggleStatus={async () => {
        try {
          if (!selected?._id) return;
          const nextStatus = (selected.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
          const res = await doctorService.updateStatus(selected._id, { status: nextStatus });
          setSelected(res?.doctor || { ...selected, status: nextStatus });
        } catch (e) { err(e); }
      }}
      onDelete={async () => {
        try {
          if (!selected?._id) return;
          await doctorService.delete(selected._id);
          setSelected(null);
          go('DoctorList');
        } catch (e) { err(e); }
      }}
    />,
    AddDoctor: <AddEditDoctorScreen doctor={selected} onBack={() => go(selected ? 'DoctorProfile' : 'DoctorList')} onSave={async (form, action) => {
      try {
        if (action === 'delete' && selected?._id) {
          await doctorService.delete(selected._id);
          setSelected(null);
          go('DoctorList');
          return;
        }
        const fd = new FormData();
        fd.append('name', String(form.name ?? form.doctorName ?? ''));
        fd.append('specialization', String(form.specialization ?? ''));
        fd.append('department', String(form.department ?? ''));
        fd.append('qualification', String(form.qualification ?? ''));
        fd.append('experienceYears', String(form.experienceYears ?? form.experience ?? ''));
        fd.append('hospitalName', String(form.hospitalName ?? form.hospital ?? ''));
        fd.append('licenseNumber', String(form.licenseNumber ?? form.license ?? ''));
        fd.append('phone', String(form.phone ?? ''));
        fd.append('email', String(form.email ?? ''));
        fd.append('consultationFee', String(form.consultationFee ?? form.fee ?? ''));
        fd.append('consultationMode', String(form.consultationMode ?? form.mode ?? 'Physical'));
        fd.append('availableDays', JSON.stringify(form.availableDays || []));
        fd.append('availableTime', String(form.availableTime ?? ''));
        if (selected?._id) await doctorService.update(selected._id, fd);
        else await doctorService.create(fd);
        go('DoctorList');
      } catch (e) { err(e); }
    }} />,
    DoctorCalendar: <DoctorCalendarScreen doctor={selected} onBack={() => go('DoctorProfile')} />,
    ConsultationHistory: <DoctorConsultationHistoryScreen doctor={selected} onBack={() => go('DoctorProfile')} />,

    PrescriptionList: <PrescriptionListScreen
      role={user?.role || 'Patient'}
      readOnly={(user?.role || 'Patient') === 'Patient'}
      patient={isPatientContext(selected) ? selected : null}
      onBack={() => {
        if (isPatientContext(selected)) {
          go('PatientProfile', selected?.__fullPatient || selected);
          return;
        }
        go('Dashboard');
      }}
      onAdd={() => { setSelected(null); go('AddPrescription'); }}
      onSelect={(p) => {
        const ctx = isPatientContext(selected) ? toPatientContext(selected) : null;
        go('PrescriptionDetail', ctx ? { ...p, __patientContext: ctx } : p);
      }}
      onHistory={() => {
        if (isPatientContext(selected)) {
          go('PrescriptionHistory', toPatientContext(selected));
          return;
        }
        setSelected(null);
        go('PrescriptionHistory');
      }}
      onAnalytics={() => { setSelected(null); go('PrescriptionAnalytics'); }}
    />,
    MyPrescriptions: <PrescriptionListScreen
      role={user?.role || 'Patient'}
      readOnly
      patient={activePatient || selected || { _id: '__none__', patientName: user?.fullName || user?.name || 'Patient', patientId: '' }}
      onBack={() => go('Dashboard')}
      onSelect={(p) => {
        const ctx = toPatientContext(activePatient || selected || { _id: '__none__', patientName: user?.fullName || user?.name || 'Patient', patientId: '' });
        go('PrescriptionDetail', { ...p, __patientContext: ctx, __fromMyPrescriptions: true });
      }}
    />,
    PrescriptionDetail: <PrescriptionDetailScreen
      prescription={selected}
      canManage={(user?.role || 'Patient') !== 'Patient'}
      showHistory={!selected?.__patientContext}
      onBack={() => {
        if (selected?.__fromMyPrescriptions) {
          go('MyPrescriptions');
          return;
        }
        const ctx = selected?.__patientContext;
        if (ctx) {
          go('PrescriptionList', ctx);
          return;
        }
        go('PrescriptionList');
      }}
      onEdit={() => go('AddPrescription', selected)}
      onHistory={() => go('PrescriptionHistory', getPrescriptionPatientRef(selected))}
      onDelete={async (id) => {
        try {
          if (!id || !isObjectId(id)) {
            notify('Error', 'Invalid prescription ID. Open the record from list and try again.');
            return;
          }
          await prescriptionService.delete(id);
          if (selected?.__fromMyPrescriptions) {
            go('MyPrescriptions');
            return;
          }
          const ctx = selected?.__patientContext;
          if (ctx) {
            go('PrescriptionList', ctx);
            return;
          }
          go('PrescriptionList');
        } catch (e) { err(e); }
      }}
    />,
    AddPrescription: <AddPrescriptionScreen role={user?.role} user={user} prescription={selected} onBack={() => go(selected ? 'PrescriptionDetail' : 'PrescriptionList')} onSave={async (form) => {
      try {
        if (!isObjectId(form.patientId)) {
          notify('Validation', 'Please select a valid patient before saving.');
          return;
        }
        if (!isObjectId(form.doctorId)) {
          notify('Validation', 'Please select a valid doctor before saving.');
          return;
        }
        if (!String(form.diagnosis || '').trim()) {
          notify('Validation', 'Diagnosis is required.');
          return;
        }
        const medicines = Array.isArray(form.medicines) ? form.medicines : [];
        if (medicines.length === 0) {
          notify('Validation', 'Add at least one medicine.');
          return;
        }
        const fd = new FormData();
        fd.append('patientId', form.patientId);
        fd.append('doctorId', form.doctorId || '');
        fd.append('diagnosis', form.diagnosis || '');
        fd.append('notes', form.notes || '');
        fd.append('followUpDate', form.followUp || '');
        fd.append('refillAllowed', form.refill ? 'true' : 'false');
        fd.append('medicines', JSON.stringify(medicines));
        if (selected?._id) await prescriptionService.update(selected._id, fd); else await prescriptionService.create(fd);
        go('PrescriptionList');
      } catch (e) { err(e); }
    }} />,
    PrescriptionHistory: <PrescriptionHistoryScreen
      patient={selected}
      onBack={() => {
        if (isFullPatientRecord(selected)) {
          go('PatientProfile', selected);
          return;
        }
        go('PrescriptionList');
      }}
      onSelect={(p) => go('PrescriptionDetail', p)}
    />,
    PrescriptionAnalytics: <PrescriptionAnalyticsScreen onBack={() => go(selected?.__from === 'AdminReports' ? 'AdminReports' : 'PrescriptionList')} />,
    PatientPrescriptions: <PrescriptionListScreen
      role={user?.role || 'Patient'}
      readOnly={(user?.role || 'Patient') === 'Patient'}
      patient={selected}
      onBack={() => go('PatientProfile', selected?.__fullPatient || selected)}
      onAdd={() => { setSelected(null); go('AddPrescription'); }}
      onSelect={(p) => go('PrescriptionDetail', { ...p, __patientContext: toPatientContext(selected) })}
      onHistory={() => go('PrescriptionHistory', toPatientContext(selected))}
      onAnalytics={() => go('PrescriptionAnalytics')}
    />,

    PatientList: <PatientListScreen role={user?.role || 'Patient'} onBack={() => go('Dashboard')} onAdd={() => { setSelected(null); go('AddPatient'); }} onSelect={(p) => go('PatientProfile', p)} />,
    PatientProfile: <PatientProfileScreen
      patient={activePatient || selected}
      onBack={() => {
        if ((user?.role || 'Patient') === 'Patient') {
          go('Dashboard');
          return;
        }
        go('PatientList');
      }}
      onEdit={(user?.role === 'Admin') ? (() => go('AddPatient', selected)) : null}
      onDelete={(user?.role === 'Admin') ? (async () => {
        try {
          if (!selected?._id) return;
          await patientService.delete(selected._id);
          setSelected(null);
          go('PatientList');
        } catch (e) { err(e); }
      }) : null}
      onHistory={() => go('MedicalHistory', activePatient || selected)}
      onReports={() => go('MedicalReports', activePatient || selected)}
      onPrescriptions={() => go('PatientPrescriptions', activePatient || selected)}
    />,
    AddPatient: <AddEditPatientScreen patient={selected} onBack={() => go(selected ? 'PatientProfile' : 'PatientList')} onSave={async (form) => {
      try {
        const data = { name: form.name, age: Number(form.age), gender: form.gender, dateOfBirth: form.dob, phone: form.phone, email: form.email, address: form.address, bloodGroup: form.bloodGroup, allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()) : [], chronicDiseases: form.chronicDiseases ? form.chronicDiseases.split(',').map((s) => s.trim()) : [], insuranceProvider: form.insurance, insuranceNumber: form.insuranceNo, emergencyContactName: form.emergencyContact, emergencyContactNumber: form.emergencyPhone };
        if (selected?._id) await patientService.update(selected._id, data); else await patientService.create(data);
        go('PatientList');
      } catch (e) { err(e); }
    }} onDelete={async () => {
      try {
        if (!selected?._id) return;
        await patientService.delete(selected._id);
        setSelected(null);
        go('PatientList');
      } catch (e) { err(e); }
    }} />,
    MedicalHistory: <MedicalHistoryScreen
      patient={{ name: activePatient?.patientName || activePatient?.name || selected?.patientName || selected?.name || 'Patient', id: activePatient?.patientId || selected?.patientId || '' }}
      history={(Array.isArray(activePatient?.medicalHistory || selected?.medicalHistory) ? (activePatient?.medicalHistory || selected?.medicalHistory) : []).map((entry, index) => ({
        id: `${activePatient?._id || selected?._id || 'p'}-${index}`,
        type: entry?.type || 'Visit',
        date: entry?.date || activePatient?.lastVisitDate || selected?.lastVisitDate || activePatient?.updatedAt || selected?.updatedAt,
        diagnosis: entry?.diagnosis || entry?.title || entry?.note || 'Medical Visit',
        note: entry?.note || entry?.description || entry,
      }))}
      onBack={() => {
        if ((user?.role || 'Patient') === 'Patient') {
          go('Dashboard');
          return;
        }
        go('PatientProfile', activePatient || selected);
      }}
    />,
    MedicalReports: <MedicalReportsScreen
      patient={{ name: activePatient?.patientName || activePatient?.name || selected?.patientName || selected?.name || 'Patient', id: activePatient?.patientId || selected?.patientId || '' }}
      reports={(Array.isArray(activePatient?.medicalReport || selected?.medicalReport) ? (activePatient?.medicalReport || selected?.medicalReport) : []).map((report, index) => ({
        id: `${activePatient?._id || selected?._id || 'p'}-r-${index}`,
        name: typeof report === 'string' ? report : (report?.name || report?.title || `Report ${index + 1}`),
        type: typeof report === 'object' ? (report?.type || 'Medical Report') : 'Medical Report',
        date: typeof report === 'object' ? (report?.date || report?.createdAt || activePatient?.updatedAt || selected?.updatedAt) : (activePatient?.updatedAt || selected?.updatedAt),
        raw: report,
      }))}
      onUpload={async () => {
        const targetPatient = activePatient || currentPatient || selected;
        if (!targetPatient?._id) return notify('Error', 'Patient record not selected.');
        try {
          if (typeof window !== 'undefined' && window.document) {
            const input = window.document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,application/pdf';
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              try {
                const fd = new FormData();
                // Check if we are uploading for a specific lab test via pendingLabTest
                if (pendingLabTest) {
                  fd.append('reportFile', file);
                  const res = await labTestService.uploadResult(pendingLabTest._id, fd);
                  // refresh state with the new lab test data
                  const updatedTest = res.test || pendingLabTest;
                  setSelected(updatedTest);
                  setPendingLabTest(null); // Clear context
                  notify('Success', 'Lab result uploaded and physician has been notified.');
                  go('LabTestDetail', updatedTest);
                } else {
                  fd.append('medicalReport', file);
                  const res = await patientService.uploadReport(targetPatient._id, fd);
                  const updated = res?.patient || targetPatient;
                  setSelected(updated);
                  if (user?.role === 'Patient') setCurrentPatient(updated);
                  notify('Success', 'Medical report uploaded.');
                  go('MedicalReports');
                }
              } catch (uploadErr) {
                err(uploadErr);
              }
            };
            input.click();
            return;
          }
          notify('Info', 'File upload from this screen is currently available on web.');
        } catch (e) {
          err(e);
        }
      }}
      onDelete={async (reportItem) => {
        try {
          const targetPatient = activePatient || selected;
          if (!targetPatient?._id) return;
          const target = reportItem?.raw ?? reportItem;
          const currentReports = Array.isArray(targetPatient.medicalReport) ? targetPatient.medicalReport : [];
          const idx = currentReports.findIndex((item) => JSON.stringify(item) === JSON.stringify(target));
          const nextReports = idx >= 0
            ? [...currentReports.slice(0, idx), ...currentReports.slice(idx + 1)]
            : currentReports;
          const res = await patientService.update(targetPatient._id, { medicalReport: nextReports });
          const updated = res?.patient || { ...targetPatient, medicalReport: nextReports };
          setSelected(updated);
          if ((user?.role || 'Patient') === 'Patient') setCurrentPatient(updated);
          notify('Success', 'Medical report deleted.');
        } catch (e) {
          err(e);
        }
      }}
      onOpen={async (reportItem) => {
        try {
          const raw = reportItem?.raw ?? reportItem;
          const path = typeof raw === 'string'
            ? raw
            : (raw?.url || raw?.path || raw?.file || raw?.name || '');
          if (!path) {
            notify('Info', 'No file path available for this report.');
            return;
          }
          const url = /^https?:\/\//i.test(path) ? path : `${backendOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
          const supported = await Linking.canOpenURL(url);
          if (!supported) {
            notify('Error', 'Cannot open this report URL.');
            return;
          }
          await Linking.openURL(url);
        } catch (e) {
          err(e);
        }
      }}
      onBack={() => {
        setPendingLabTest(null);
        if ((user?.role || 'Patient') === 'Patient') {
          go('Dashboard');
          return;
        }
        go('PatientProfile', activePatient || selected);
      }}
    />,
    HealthSummary: <HealthSummaryScreen onBack={() => go('PatientProfile')} />,

    AppointmentList: <AppointmentListScreen role={user?.role || 'Patient'} user={user} linkedPatient={currentPatient} onBack={() => go('Dashboard')} onAdd={() => { setSelected(null); go('BookAppointment'); }} onSelect={(a) => go('AppointmentDetail', a)} />,
    AppointmentDetail: <AppointmentDetailScreen role={user?.role || 'Patient'} appointment={selected} onBack={() => go('AppointmentList')} onReschedule={() => go('BookAppointment', selected)} onRefresh={() => go('AppointmentList')} />,
    BookAppointment: <BookAppointmentScreen role={user?.role || 'Patient'} user={user} currentPatient={currentPatient} appointment={selected} onBack={() => {
      const isReschedule = Boolean(
        selected && (
          selected?.appointmentId ||
          selected?.appointmentDate ||
          selected?.appointmentTime ||
          selected?.reasonForVisit ||
          selected?.appointmentStatus
        )
      );
      if (isReschedule) {
        go('AppointmentDetail');
        return;
      }
      if ((user?.role || 'Patient') === 'Patient') {
        go('Dashboard');
        return;
      }
      go('AppointmentList');
    }} onBook={async (form) => {
      try {
        let patientId = form.patientId;
        if ((user?.role || 'Patient') === 'Patient' && !isObjectId(patientId)) {
          if (isObjectId(currentPatient?._id)) {
            patientId = currentPatient._id;
          } else {
            const pRes = await patientService.getAll('');
            const allPatients = Array.isArray(pRes?.patients) ? pRes.patients : [];
            const loggedEmail = String(user?.email || '').toLowerCase();
            const loggedPhone = String(user?.phone || user?.phoneNumber || '').replace(/\s+/g, '');
            const loggedName = String(user?.fullName || user?.name || '').toLowerCase();
            const matched = allPatients.find((pt) => {
              const ptEmail = String(pt?.email || '').toLowerCase();
              const ptPhone = String(pt?.phone || '').replace(/\s+/g, '');
              const ptName = String(pt?.patientName || pt?.name || '').toLowerCase();
              return (
                (loggedEmail && ptEmail && loggedEmail === ptEmail) ||
                (loggedPhone && ptPhone && loggedPhone === ptPhone) ||
                (loggedName && ptName && loggedName === ptName)
              );
            });
            if (isObjectId(matched?._id)) patientId = matched._id;
          }
        }
        if (!isObjectId(patientId)) {
          notify('Validation', 'Please select a valid patient.');
          return;
        }
        if (!isObjectId(form.doctorId)) {
          notify('Validation', 'Please select a valid doctor.');
          return;
        }
        if (!form.date || !form.time) {
          notify('Validation', 'Please select date and time.');
          return;
        }
        const fd = new FormData();
        fd.append('patientId', patientId);
        fd.append('doctorId', form.doctorId);
        fd.append('appointmentDate', form.date);
        fd.append('appointmentTime', form.time);
        fd.append('appointmentType', form.type);
        fd.append('reasonForVisit', form.reason || '');
        fd.append('notes', form.notes || '');
        if (selected?._id) await appointmentService.reschedule(selected._id, { appointmentDate: form.date, appointmentTime: form.time });
        else await appointmentService.book(fd);
        setSelected(null);
        go('AppointmentList');
      } catch (e) { err(e); }
    }} />,
    DailySchedule: <DailyScheduleScreen onBack={() => go('Dashboard')} onSelect={(a) => go('AppointmentDetail', a)} />,
    AppointmentStats: <AppointmentStatsScreen onBack={() => go(selected?.__from === 'AdminReports' ? 'AdminReports' : 'Dashboard')} />,

    ReminderList: <ReminderListScreen role={user?.role || 'Patient'} user={user} onBack={() => go('Dashboard')} onAdd={() => { setSelected(null); go('AddReminder'); }} onSelect={(r) => go('ReminderDetail', r)} />,
    AddReminder: <AddReminderScreen
      reminder={selected}
      onBack={() => go(selected ? 'ReminderDetail' : 'ReminderList')}
      onSave={async (data) => {
        try {
          const payload = {
            ...data,
            reminderType: data?.reminderType || data?.type || 'Daily',
            userId: data?.userId || user?.id || user?._id,
          };
          if (selected?._id) await reminderService.update(selected._id, payload);
          else await reminderService.create(payload);
          setSelected(null);
          go('ReminderList');
        } catch (e) { err(e); }
      }}
      onDelete={async (id) => {
        try {
          const rid = id || selected?._id;
          if (!rid) return notify('Error', 'Reminder ID not found.');
          await reminderService.delete(rid);
          setSelected(null);
          go('ReminderList');
        } catch (e) { err(e); }
      }}
    />,
    ReminderDetail: <ReminderDetailScreen
      reminder={selected}
      onBack={() => go('ReminderList')}
      onEdit={() => go('AddReminder')}
      onMarkTaken={async (id) => {
        try {
          await reminderService.markTaken(id);
          go('ReminderList');
        } catch (e) { err(e); }
      }}
      onSnooze={async (id) => {
        try {
          await reminderService.snooze(id);
          go('ReminderList');
        } catch (e) { err(e); }
      }}
      onToggleStatus={async (id) => {
        try {
          await reminderService.toggleStatus(id);
          go('ReminderList');
        } catch (e) { err(e); }
      }}
      onDelete={async (id) => {
        try {
          await reminderService.delete(id);
          go('ReminderList');
        } catch (e) { err(e); }
      }}
    />,
    DailySummary: <DailySummaryScreen onBack={() => go('Dashboard')} />,

    NotificationList: <NotificationListScreen role={user?.role || 'Patient'} user={user} onBack={() => go('Dashboard')} onSelect={(n) => go('NotificationDetail', n)} />,
    NotificationDetail: <NotificationDetailScreen
      notification={selected}
      onBack={() => go('NotificationList')}
      onDelete={async (id) => {
        try {
          if (!id) return notify('Error', 'Notification ID not found.');
          await notificationService.delete(id);
          go('NotificationList');
        } catch (e) { err(e); }
      }}
      onMarkRead={async (id) => {
        try {
          if (!id) return notify('Error', 'Notification ID not found.');
          await notificationService.markRead(id);
          go('NotificationList');
        } catch (e) { err(e); }
      }}
    />,
    AdminBroadcast: <AdminBroadcastScreen onBack={() => go('Dashboard')} onSend={async (data) => { try { await notificationService.broadcast(data); go('NotificationList'); } catch (e) { err(e); } }} />,

    BillingList: <BillingListScreen
      user={user}
      currentPatient={currentPatient}
      onBack={() => go('Dashboard')}
      onAdd={() => { setSelected(null); go('CreateInvoice'); }}
      onSelect={(b) => go('BillingDetail', b)}
      onAnalytics={() => go('BillingAnalytics')}
    />,
    BillingDetail: <BillingDetailScreen
      bill={selected}
      userRole={user?.role}
      onBack={() => go('BillingList')}
      onEdit={() => go('CreateInvoice')}
      onRecordPayment={() => go('RecordPayment')}
      onUploadEvidence={async () => {
        try {
          if (typeof window !== 'undefined' && window.document) {
            const input = window.document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              try {
                const fd = new FormData();
                fd.append('paymentEvidence', file);
                const res = await billingService.uploadEvidence(selected._id, fd);
                setSelected(res.bill);
                notify('Success', 'Payment evidence uploaded. Admin will review it shortly.');
              } catch (e) { err(e); }
            };
            input.click();
          } else {
            notify('Info', 'Upload currently available on web environment.');
          }
        } catch (e) { err(e); }
      }}
      onApproveEvidence={async (id, status) => {
        try {
          const res = await billingService.approveEvidence(id, { status });
          setSelected(res.bill);
          notify('Success', `Payment evidence ${status.toLowerCase()} successfully.`);
        } catch (e) { err(e); }
      }}
      onDelete={async (id) => {
        try {
          await billingService.delete(id);
          go('BillingList');
        } catch (e) { err(e); }
      }}
    />,
    CreateInvoice: <CreateInvoiceScreen invoice={selected} onBack={() => go(selected ? 'BillingDetail' : 'BillingList')} onSave={async (form) => { try { const data = { patientId: form.patientId, appointmentId: form.appointmentId || undefined, items: (form.items || []).map((i) => ({ description: i.desc, amount: parseFloat(i.amount || 0) })), discount: parseFloat(form.discount || 0), paymentMethod: form.paymentMethod, insuranceClaim: form.insuranceClaim, dueDate: form.dueDate, notes: form.notes }; if (selected?._id) await billingService.update(selected._id, data); else await billingService.create(data); go('BillingList'); } catch (e) { err(e); } }} />,
    RecordPayment: <RecordPaymentScreen bill={selected} onBack={() => go('BillingDetail')} onSave={() => go('BillingList')} />,
    PaymentHistory: <PaymentHistoryScreen onBack={() => go('Dashboard')} />,
    BillingAnalytics: <BillingAnalyticsScreen onBack={() => go(selected?.__from === 'AdminReports' ? 'AdminReports' : 'BillingList')} />,

    LabTestList: <LabTestListScreen 
      role={user?.role} 
      user={user} 
      refreshKey={refreshKey}
      currentPatient={currentPatient} 
      onBack={() => go('Dashboard')} 
      onAdd={() => { setSelected(null); go('OrderLabTest'); }} 
      onSelect={(t) => go('LabTestDetail', t)} 
      onAnalytics={() => go('LabAnalytics')} 
      onMarkCompleted={(test) => { setSelected(test); setPendingLabTest(test); go('MedicalReports'); }} 
      onDelete={async (id) => {
        if (!window.confirm('Are you sure you want to delete this lab test?')) return;
        try {
          await labTestService.delete(id);
          setRefreshKey(v => v + 1);
          Alert.alert('Success', 'Lab test deleted');
          go('LabTestList');
        } catch (e) {
          Alert.alert('Error', 'Failed to delete lab test');
        }
      }}
    />,
    LabTestDetail: <LabTestDetailScreen 
      role={user?.role} 
      test={selected} 
      onBack={() => go('LabTestList')} 
      onEdit={() => go('OrderLabTest')} 
      onUpdateResults={(t) => { setSelected(t); go('UpdateLabResult'); }}
      onUploadResult={(t) => { setSelected(t); setPendingLabTest(t); go('MedicalReports'); }} 
      onDelete={async (id) => {
        if (!window.confirm('Are you sure you want to delete this diagnostic order?')) return;
        try {
          await labTestService.delete(id);
          setRefreshKey(v => v + 1);
          Alert.alert('Success', 'Order removed');
          go('LabTestList');
        } catch (e) {
          Alert.alert('Error', 'Failed to remove order');
        }
      }}
    />,
    UpdateLabResult: <UpdateLabResultScreen
      labTest={selected}
      onBack={() => go('LabTestDetail')}
      onSave={async (data) => {
        try {
          // Clean payload to ensure IDs are strings, not populated objects
          const payload = { ...data };
          if (payload.patientId?._id) payload.patientId = payload.patientId._id;
          if (payload.doctorId?._id) payload.doctorId = payload.doctorId._id;
          
          const res = await labTestService.update(selected._id, payload);
          const updated = res.test || res.labTest || selected;
          setSelected(updated);
          notify('Success', 'Lab results updated and patient notified.');
          go('LabTestDetail', updated);
        } catch (e) {
          notify('Error', 'Failed to update results');
        }
      }}
    />,
    OrderLabTest: <OrderLabTestScreen 
      role={user?.role}
      labTest={selected} 
      onBack={() => go(selected ? 'LabTestDetail' : 'LabTestList')} 
      onSave={async (data) => { 
        try { 
          // Auto-link doctor if doctor is logged in
          if (user?.role === 'Doctor' && !data.doctorId) {
            // Need to find the doctor record for this user email
            const doctorsRes = await api.get(`/doctors?email=${user.email}`);
            if (doctorsRes.doctors && doctorsRes.doctors.length > 0) {
              data.doctorId = doctorsRes.doctors[0]._id;
            }
          }
          if (selected?._id) await labTestService.update(selected._id, data); 
          else await labTestService.order(data); 
          
          notify('Success', 'Lab test order has been submitted and the patient has been notified.');
          go('LabTestList');
        } catch (e) { err(e); } 
      }} 
    />,
    LabHistory: <LabHistoryScreen onBack={() => go('PatientProfile')} onSelect={(t) => go('LabTestDetail', t)} />,
    LabAnalytics: <LabAnalyticsScreen onBack={() => go(selected?.__from === 'AdminReports' ? 'AdminReports' : 'LabTestList')} />,
  };

  return screens[screen] || (user ? screens.Dashboard : screens.Login);
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Navigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
