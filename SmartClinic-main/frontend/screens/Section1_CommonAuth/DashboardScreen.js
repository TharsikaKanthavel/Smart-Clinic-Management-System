import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Dimensions, Alert } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge } from '../Section0_SharedTheme/theme';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import { reminderService, notificationService } from '../../services/otherServices';

const { width } = Dimensions.get('window');

function DashboardScreen({ role = 'Admin', userName = 'User', user = null, currentPatient = null, onNavigate, onLogout }) {
  const { colors, mode } = useTheme();
  const [counts, setCounts] = useState({
    doctors: '--',
    patients: '--',
    appointments: '--',
    prescriptions: '--',
    reminders: '--',
    notifications: '--',
    reports: '--',
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  const getAppointmentDateTime = (appointment) => {
    const date = String(appointment?.appointmentDate || '').trim();
    const time = String(appointment?.appointmentTime || '').trim();
    if (!date) return null;
    const dt = new Date(time ? `${date}T${time}` : date);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [d, p, a, rx, r, n] = await Promise.all([
          doctorService.getAll(''),
          patientService.getAll(''),
          appointmentService.getAll(''),
          prescriptionService.getAll(''),
          reminderService.getAll(''),
          notificationService.getAll(''),
        ]);
        if (!mounted) return;
        const allPatients = Array.isArray(p?.patients) ? p.patients : [];
        const allDoctors = Array.isArray(d?.doctors) ? d.doctors : [];
        const allAppointments = Array.isArray(a?.appointments) ? a.appointments : [];
        const allPrescriptions = Array.isArray(rx?.prescriptions) ? rx.prescriptions : [];
        const allReminders = Array.isArray(r?.reminders) ? r.reminders : [];
        const allNotifications = Array.isArray(n?.notifications) ? n.notifications : [];

        const loggedUserId = String(user?.id || user?._id || '');
        const loggedEmail = String(user?.email || '').toLowerCase();
        const loggedPhone = String(user?.phone || user?.phoneNumber || '').replace(/\s+/g, '');
        const loggedName = String(user?.fullName || user?.name || '').toLowerCase();

        const doctorRecord = role === 'Doctor' 
          ? allDoctors.find(dr => String(dr.email).toLowerCase() === loggedEmail || String(dr.doctorName).toLowerCase() === loggedName)
          : null;

        const patientRecord = role === 'Patient'
          ? (currentPatient || allPatients.find((pt) => {
            const ptEmail = String(pt?.email || '').toLowerCase();
            const ptPhone = String(pt?.phone || '').replace(/\s+/g, '');
            const ptName = String(pt?.patientName || pt?.name || '').toLowerCase();
            return (
              (loggedEmail && ptEmail && loggedEmail === ptEmail) ||
              (loggedPhone && ptPhone && loggedPhone === ptPhone) ||
              (loggedName && ptName && loggedName === ptName)
            );
          }))
          : null;

        const currentProfileId = (role === 'Doctor' ? doctorRecord?._id : patientRecord?._id) ? String(role === 'Doctor' ? doctorRecord._id : patientRecord._id) : '';
        const currentProfileName = String(role === 'Doctor' ? (doctorRecord?.doctorName || doctorRecord?.name) : (patientRecord?.patientName || patientRecord?.name) || '').toLowerCase();

        const filteredAppointments = (role === 'Doctor' || role === 'Patient')
          ? allAppointments.filter((ap) => {
            const apTargetIdRaw = role === 'Doctor' 
              ? (typeof ap?.doctorId === 'object' ? ap?.doctorId?._id : ap?.doctorId)
              : (typeof ap?.patientId === 'object' ? ap?.patientId?._id : ap?.patientId);
            const apTargetId = apTargetIdRaw ? String(apTargetIdRaw) : '';
            const apTargetName = String(role === 'Doctor' 
              ? (ap?.doctorName || ap?.doctorId?.doctorName || ap?.doctorId?.name)
              : (ap?.patientName || ap?.patientId?.patientName || ap?.patientId?.name) || ''
            ).toLowerCase();
            
            return (
              (currentProfileId && apTargetId === currentProfileId) ||
              (currentProfileName && apTargetName === currentProfileName)
            );
          })
          : allAppointments;

        const filteredPrescriptions = (role === 'Doctor' || role === 'Patient')
          ? allPrescriptions.filter((rxItem) => {
            const rxTargetIdRaw = role === 'Doctor'
              ? (typeof rxItem?.doctorId === 'object' ? rxItem?.doctorId?._id : rxItem?.doctorId)
              : (typeof rxItem?.patientId === 'object' ? rxItem?.patientId?._id : rxItem?.patientId);
            const rxTargetId = rxTargetIdRaw ? String(rxTargetIdRaw) : '';
            const rxTargetName = String(role === 'Doctor'
              ? (rxItem?.doctorName || rxItem?.doctorId?.doctorName || rxItem?.doctorId?.name)
              : (rxItem?.patientName || rxItem?.patientId?.patientName || rxItem?.patientId?.name) || ''
            ).toLowerCase();

            return (
              (currentProfileId && rxTargetId === currentProfileId) ||
              (currentProfileName && rxTargetName === currentProfileName)
            );
          })
          : allPrescriptions;

        const doctorUniquePatients = role === 'Doctor'
          ? [...new Set(filteredAppointments.map(ap => String(ap.patientId?._id || ap.patientId)))]
          : [];

        const patientReminders = role === 'Patient'
          ? allReminders.filter((rem) => String(rem?.userId?._id || rem?.userId || '') === loggedUserId)
          : allReminders;

        const patientNotifications = role === 'Patient'
          ? allNotifications.filter((ntf) => String(ntf?.userId?._id || ntf?.userId || '') === loggedUserId)
          : allNotifications;

        const reportCount = role === 'Patient'
          ? String(Array.isArray(patientRecord?.medicalReport) ? patientRecord.medicalReport.length : 0)
          : '--';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = filteredAppointments
          .map((item) => {
            const d = item?.appointmentDate ? new Date(item.appointmentDate) : null;
            const hasValidDate = d && !Number.isNaN(d.getTime());
            const dateOnly = hasValidDate ? new Date(d) : null;
            if (dateOnly) dateOnly.setHours(0, 0, 0, 0);
            return { ...item, __dt: getAppointmentDateTime(item), __dateOnly: dateOnly };
          })
          .filter((item) => item.__dateOnly && item.__dateOnly >= today)
          .filter((item) => ['Pending', 'Approved'].includes(String(item?.appointmentStatus || item?.status || '')))
          .sort((x, y) => {
            const dx = x.__dt ? x.__dt.getTime() : (x.__dateOnly ? x.__dateOnly.getTime() : 0);
            const dy = y.__dt ? y.__dt.getTime() : (y.__dateOnly ? y.__dateOnly.getTime() : 0);
            return dx - dy;
          })
          .slice(0, 4);

        const todayOnlyAppointments = filteredAppointments.filter(ap => {
          const apDate = String(ap.appointmentDate || '').split('T')[0];
          const todayDate = new Date().toISOString().split('T')[0];
          return apDate === todayDate;
        });

        setCounts({
          doctors: String(d?.count ?? allDoctors.length ?? 0),
          patients: String(role === 'Doctor' ? doctorUniquePatients.length : (p?.count ?? allPatients.length ?? 0)),
          appointments: String(role === 'Doctor' ? todayOnlyAppointments.length : filteredAppointments.length),
          prescriptions: String(filteredPrescriptions.length),
          reminders: String(role === 'Patient' ? patientReminders.length : (r?.count ?? allReminders.length ?? 0)),
          notifications: String(role === 'Patient' ? patientNotifications.length : (n?.count ?? allNotifications.length ?? 0)),
          reports: reportCount,
          rating: doctorRecord?.rating ? String(Number(doctorRecord.rating).toFixed(1)) : '--'
        });
        setUpcomingAppointments(upcoming);
      } catch {
        if (!mounted) return;
        setUpcomingAppointments([]);
      } finally {
        if (mounted) setLoadingUpcoming(false);
      }
    })();
    return () => { mounted = false; };
  }, [role, user?.id, user?._id, user?.email, user?.phone, user?.phoneNumber, user?.name, user?.fullName, currentPatient?._id]);

  const STATS = {
    Admin: [
      { icon: '👨‍⚕️', label: 'Doctors', value: counts.doctors },
      { icon: '👥', label: 'Patients', value: counts.patients },
      { icon: '📅', label: 'Appts', value: counts.appointments },
    ],
    Doctor: [
      { icon: '📅', label: "Today's Appts", value: counts.appointments },
      { icon: '👥', label: 'My Patients', value: counts.patients },
      { icon: '💊', label: 'Scripts', value: counts.prescriptions },
      { icon: '⭐', label: 'Rating', value: counts.rating },
    ],
    Patient: [
      { icon: '📅', label: 'Appts', value: counts.appointments },
      { icon: '⏰', label: 'Reminders', value: counts.reminders },
      { icon: '🔔', label: 'Alerts', value: counts.notifications },
    ],
  };

  const MENU = {
    Admin: [
      { icon: '👨‍⚕️', label: 'Doctors', screen: 'DoctorList' },
      { icon: '👥', label: 'Patients', screen: 'PatientList' },
      { icon: '📅', label: 'Appointments', screen: 'AppointmentList' },
      { icon: '💰', label: 'Billing', screen: 'BillingList' },
      { icon: '📊', label: 'Reports', screen: 'AdminReports' },
      { icon: '👥', label: 'Users', screen: 'AdminUsers' },
      { icon: '👤', label: 'Profile', screen: 'Profile' },
    ],
    Doctor: [
      { icon: '📅', label: 'Schedule', screen: 'DailySchedule' },
      { icon: '👥', label: 'Patients', screen: 'PatientList' },
      { icon: '💊', label: 'Prescriptions', screen: 'PrescriptionList' },
      { icon: '🧪', label: 'Lab Orders', screen: 'LabTestList' },
      { icon: '🔔', label: 'Notifications', screen: 'NotificationList' },
      { icon: '👤', label: 'Profile', screen: 'Profile' },
    ],
    Patient: [
      { icon: '📅', label: 'Book Appt', screen: 'BookAppointment' },
      { icon: '📋', label: 'My Appts', screen: 'AppointmentList' },
      { icon: '💊', label: 'My Meds', screen: 'MyPrescriptions' },
      { icon: '💰', label: 'My Bills', screen: 'BillingList' },
      { icon: '🔬', label: 'Lab History', screen: 'LabTestList' },
      { icon: '⏰', label: 'Reminders', screen: 'ReminderList' },
      { icon: '👤', label: 'Profile', screen: 'Profile' },
    ],
  };

  const stats = STATS[role] || STATS.Admin;
  const menu = MENU[role] || MENU.Admin;
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const handleLogout = () => {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm('Do you want to logout?')) onLogout?.();
      return;
    }
    Alert.alert('Logout', 'Do you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => onLogout?.() },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />

      <View style={{ backgroundColor: colors.primary, paddingTop: 56, paddingHorizontal: 24, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Welcome back</Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 }}>{userName}</Text>
            <Badge label={role} color="#fff" />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => onNavigate?.('NotificationList')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 8 }}>{dateStr}</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 18, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 16, padding: 14 }}>
          {stats.map((s) => (
            <View key={s.label} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18 }}>{s.icon}</Text>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{s.value}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, textAlign: 'center' }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 17, marginBottom: 14 }}>Quick Actions</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {menu.map((m) => (
            <TouchableOpacity key={m.label} onPress={() => onNavigate?.(m.screen)} style={{ width: (width - 64) / 3, alignItems: 'center', backgroundColor: colors.card, borderRadius: 16, paddingVertical: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 26, marginBottom: 6 }}>{m.icon}</Text>
              <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', textAlign: 'center' }}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 17, marginBottom: 14 }}>Upcoming Appointments</Text>
        {loadingUpcoming ? (
          <Card style={{ alignItems: 'center', paddingVertical: 28 }}><Text style={{ color: colors.textSub, fontSize: 13 }}>Loading...</Text></Card>
        ) : upcomingAppointments.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 28 }}><Text style={{ color: colors.textSub, fontSize: 13 }}>No upcoming appointments</Text></Card>
        ) : (
          upcomingAppointments.map((ap, index) => {
            const patientStr = ap?.patientName || ap?.patientId?.patientName || ap?.patientId?.name || 'Patient';
            const doctorStr = ap?.doctorName || ap?.doctorId?.doctorName || ap?.doctorId?.name || 'Doctor';
            const dtStr = ap.__dt ? ap.__dt.toLocaleString() : `${ap?.appointmentDate || ''} ${ap?.appointmentTime || ''}`.trim();
            return (
              <TouchableOpacity key={ap?._id || String(index)} onPress={() => onNavigate?.('AppointmentList')}>
                <Card style={{ borderLeftWidth: 4, borderLeftColor: colors.primary }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{patientStr}</Text>
                  <Text style={{ color: colors.textSub, fontSize: 12, marginTop: 2 }}>{doctorStr}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{dtStr}</Text>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

export default function DashboardScreenWrapper(props) {
  return <ThemeProvider><DashboardScreen {...props} /></ThemeProvider>;
}
export { DashboardScreen };
