// ============================================================
//  index.js  —  SmartClinic Master Screen Index
//  Import any screen from here for use in your navigator
// ============================================================

// ── Shared Theme ─────────────────────────────────────────────
export { ThemeProvider, useTheme } from './theme';

// ── COMMON (All Members) ─────────────────────────────────────
export { SplashScreen }       from './SplashScreen';
export { LoginScreen }        from './LoginScreen';
export { RegisterScreen }     from './RegisterScreen';
export { OTPVerifyScreen }    from './OTPVerifyScreen';
export { DashboardScreen }    from './DashboardScreen';
export { ChangePasswordScreen } from './ChangePasswordScreen';
export { ThemeSettingsScreen } from './ThemeSettingsScreen';
export { ProfileScreen }      from './ProfileScreen';

// ── MEMBER 1 — Doctor + Prescription ────────────────────────
export { DoctorListScreen }        from './DoctorListScreen';
export { DoctorProfileScreen }     from './DoctorProfileScreen';
export { AddEditDoctorScreen }     from './AddEditDoctorScreen';
export { PrescriptionListScreen }  from './PrescriptionListScreen';
export { PrescriptionDetailScreen }from './PrescriptionDetailScreen';
export { AddPrescriptionScreen }   from './AddPrescriptionScreen';

// ── MEMBER 2 — Patient Management ────────────────────────────
export { PatientListScreen }    from './PatientListScreen';
export { PatientProfileScreen } from './PatientProfileScreen';
export { AddEditPatientScreen } from './AddEditPatientScreen';
export { MedicalHistoryScreen, MedicalReportsScreen, HealthSummaryScreen } from './MedicalScreens';

// ── MEMBER 3 — Appointments ───────────────────────────────────
export { AppointmentListScreen }   from './AppointmentListScreen';
export { AppointmentDetailScreen } from './AppointmentDetailScreen';
export { BookAppointmentScreen }   from './BookAppointmentScreen';
export { DailyScheduleScreen }     from './DailyScheduleScreen';
export { AppointmentStatsScreen }  from './AppointmentStatsScreen';

// ── MEMBER 4 — Reminders + Notifications ─────────────────────
export { ReminderListScreen }       from './ReminderListScreen';
export { AddReminderScreen }        from './AddReminderScreen';
export { ReminderDetailScreen }     from './ReminderDetailScreen';
export { DailySummaryScreen }       from './DailySummaryScreen';
export { NotificationListScreen }   from './NotificationListScreen';
export { NotificationDetailScreen } from './NotificationDetailScreen';
export { AdminBroadcastScreen }     from './AdminBroadcastScreen';

// ============================================================
//  SCREEN REGISTRY  (for use with React Navigation)
//  Usage example:
//
//  import { SCREEN_REGISTRY } from './screens/index';
//  const Stack = createNativeStackNavigator();
//  Object.entries(SCREEN_REGISTRY).map(([name, comp]) =>
//    <Stack.Screen key={name} name={name} component={comp} />
//  )
// ============================================================
import { SplashScreen }            from './SplashScreen';
import { LoginScreen }             from './LoginScreen';
import { RegisterScreen }          from './RegisterScreen';
import { OTPVerifyScreen }         from './OTPVerifyScreen';
import { DashboardScreen }         from './DashboardScreen';
import { ChangePasswordScreen }    from './ChangePasswordScreen';
import { ThemeSettingsScreen }     from './ThemeSettingsScreen';
import { ProfileScreen }           from './ProfileScreen';
import { DoctorListScreen }        from './DoctorListScreen';
import { DoctorProfileScreen }     from './DoctorProfileScreen';
import { AddEditDoctorScreen }     from './AddEditDoctorScreen';
import { PrescriptionListScreen }  from './PrescriptionListScreen';
import { PrescriptionDetailScreen }from './PrescriptionDetailScreen';
import { AddPrescriptionScreen }   from './AddPrescriptionScreen';
import { PatientListScreen }       from './PatientListScreen';
import { PatientProfileScreen }    from './PatientProfileScreen';
import { AddEditPatientScreen }    from './AddEditPatientScreen';
import { MedicalHistoryScreen, MedicalReportsScreen, HealthSummaryScreen } from './MedicalScreens';
import { AppointmentListScreen }   from './AppointmentListScreen';
import { AppointmentDetailScreen } from './AppointmentDetailScreen';
import { BookAppointmentScreen }   from './BookAppointmentScreen';
import { DailyScheduleScreen }     from './DailyScheduleScreen';
import { AppointmentStatsScreen }  from './AppointmentStatsScreen';
import { ReminderListScreen }      from './ReminderListScreen';
import { AddReminderScreen }       from './AddReminderScreen';
import { ReminderDetailScreen }    from './ReminderDetailScreen';
import { DailySummaryScreen }      from './DailySummaryScreen';
import { NotificationListScreen }  from './NotificationListScreen';
import { NotificationDetailScreen }from './NotificationDetailScreen';
import { AdminBroadcastScreen }    from './AdminBroadcastScreen';

export const SCREEN_REGISTRY = {
  // Auth
  Splash:             SplashScreen,
  Login:              LoginScreen,
  Register:           RegisterScreen,
  OTPVerify:          OTPVerifyScreen,
  Dashboard:          DashboardScreen,
  ChangePassword:     ChangePasswordScreen,
  ThemeSettings:      ThemeSettingsScreen,
  Profile:            ProfileScreen,
  // Doctor
  DoctorList:         DoctorListScreen,
  DoctorProfile:      DoctorProfileScreen,
  AddDoctor:          AddEditDoctorScreen,
  EditDoctor:         AddEditDoctorScreen,
  PrescriptionList:   PrescriptionListScreen,
  PrescriptionDetail: PrescriptionDetailScreen,
  AddPrescription:    AddPrescriptionScreen,
  // Patient
  PatientList:        PatientListScreen,
  PatientProfile:     PatientProfileScreen,
  AddPatient:         AddEditPatientScreen,
  EditPatient:        AddEditPatientScreen,
  MedicalHistory:     MedicalHistoryScreen,
  MedicalReports:     MedicalReportsScreen,
  HealthSummary:      HealthSummaryScreen,
  // Appointments
  AppointmentList:    AppointmentListScreen,
  AppointmentDetail:  AppointmentDetailScreen,
  BookAppointment:    BookAppointmentScreen,
  DailySchedule:      DailyScheduleScreen,
  AppointmentStats:   AppointmentStatsScreen,
  // Reminders & Notifications
  ReminderList:       ReminderListScreen,
  AddReminder:        AddReminderScreen,
  ReminderDetail:     ReminderDetailScreen,
  DailySummary:       DailySummaryScreen,
  NotificationList:   NotificationListScreen,
  NotificationDetail: NotificationDetailScreen,
  AdminBroadcast:     AdminBroadcastScreen,
};

/*
  FILE STRUCTURE:
  screens/
  ├── theme.js                    Shared theme + reusable components
  ├── index.js                    This file — master export
  │
  ├── ── COMMON (Auth) ──
  ├── SplashScreen.js
  ├── LoginScreen.js
  ├── RegisterScreen.js
  ├── OTPVerifyScreen.js
  ├── DashboardScreen.js
  ├── ChangePasswordScreen.js
  ├── ThemeSettingsScreen.js
  └── ProfileScreen.js
  │
  ├── ── MEMBER 1 ──
  ├── DoctorListScreen.js
  ├── DoctorProfileScreen.js
  ├── AddEditDoctorScreen.js
  ├── PrescriptionListScreen.js
  ├── PrescriptionDetailScreen.js
  └── AddPrescriptionScreen.js
  │
  ├── ── MEMBER 2 ──
  ├── PatientListScreen.js
  ├── PatientProfileScreen.js
  ├── AddEditPatientScreen.js
  └── MedicalScreens.js          (MedicalHistory + MedicalReports + HealthSummary)
  │
  ├── ── MEMBER 3 ──
  ├── AppointmentListScreen.js
  ├── AppointmentDetailScreen.js
  ├── BookAppointmentScreen.js
  ├── DailyScheduleScreen.js
  └── AppointmentStatsScreen.js
  │
  └── ── MEMBER 4 ──
      ├── ReminderListScreen.js
      ├── AddReminderScreen.js
      ├── ReminderDetailScreen.js
      ├── DailySummaryScreen.js
      ├── NotificationListScreen.js
      ├── NotificationDetailScreen.js
      └── AdminBroadcastScreen.js
*/
