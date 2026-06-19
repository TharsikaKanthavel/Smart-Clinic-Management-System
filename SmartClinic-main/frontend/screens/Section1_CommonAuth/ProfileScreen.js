import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge } from '../Section0_SharedTheme/theme';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';

function ProfileScreen({ onBack, onNavigate, onLogout }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = React.useState(null);
  const [patientProfile, setPatientProfile] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const loggedEmail = String(user?.email || '').toLowerCase();
        const loggedPhone = String(user?.phone || user?.phoneNumber || '').replace(/\s+/g, '');
        const loggedName = String(user?.fullName || user?.name || '').toLowerCase();

        if (user?.role === 'Doctor') {
          const res = await doctorService.getAll('');
          if (!mounted) return;
          const d = (res.doctors || []).find(dr => {
            return (loggedEmail && String(dr.email).toLowerCase() === loggedEmail) || 
                   (loggedName && String(dr.doctorName || dr.name).toLowerCase() === loggedName);
          });
          setDoctorProfile(d || null);
        } else if (user?.role === 'Patient') {
          const res = await patientService.getAll('');
          if (!mounted) return;
          const p = (res.patients || []).find(pt => {
            const pe = String(pt.email || '').toLowerCase();
            const ph = String(pt.phone || '').replace(/\s+/g, '');
            const pn = String(pt.patientName || pt.name || '').toLowerCase();
            return (loggedEmail && pe === loggedEmail) || 
                   (loggedPhone && ph === loggedPhone) ||
                   (loggedName && pn === loggedName);
          });
          setPatientProfile(p || null);
        }
      } catch (e) {
        console.log('Profile Load Error', e);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [user]);

  const u = user || { name: 'User', email: '', role: 'Patient', accountStatus: 'Active', phone: '' };
  const statusColor = u.accountStatus === 'Active' ? '#34A853' : u.accountStatus === 'Suspended' ? '#EA4335' : '#FBBC04';

  const handleLogout = () => {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const ok = window.confirm('Are you sure you want to logout?');
      if (ok) onLogout?.();
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await onLogout?.(); } },
    ]);
  };

  const menuItems = [
    { icon: '✏️', label: 'Edit Profile', screen: 'EditProfile' },
    { icon: '🔑', label: 'Change Password', screen: 'ChangePassword' },
    ...(u.role === 'Patient' ? [{ icon: '💊', label: 'My Reminders', screen: 'ReminderList' }] : []),
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.primary, paddingTop: 56, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        {onBack && (
          <TouchableOpacity onPress={onBack}>
            <Text style={{ color: '#FFFFFF', marginBottom: 12, fontWeight: '700' }}>{'< Back'}</Text>
          </TouchableOpacity>
        )}
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>{u.name || u.fullName || 'User'}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>{u.email || 'No email'}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <Badge label={u.role || 'User'} color="#fff" />
          <Badge label={u.accountStatus || 'Active'} color={statusColor} />
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 17, marginBottom: 12 }}>Profile Details</Text>
          {[
            ['Full Name', u.fullName || u.name || 'N/A'],
            ['Email', u.email || 'N/A'],
            ['Phone', u.phone || u.phoneNumber || 'N/A'],
            ['Role', u.role || 'N/A'],
            ...(doctorProfile ? [
              ['Specialization', doctorProfile.specialization || 'N/A'],
              ['Qualification', doctorProfile.qualification || 'N/A'],
              ['License', doctorProfile.licenseNumber || 'N/A'],
            ] : []),
            ...(patientProfile ? [
              ['Patient ID', patientProfile.patientId || 'N/A'],
              ['Age', patientProfile.age ? `${patientProfile.age} years` : 'N/A'],
              ['Gender', patientProfile.gender || 'N/A'],
              ['Blood Group', patientProfile.bloodGroup || 'N/A'],
              ['Address', patientProfile.address || 'N/A'],
              ['Emergency Contact', patientProfile.emergencyContactName || 'N/A'],
              ['Emergency Phone', patientProfile.emergencyContactNumber || 'N/A'],
              ['Insurance', patientProfile.insuranceProvider || 'N/A'],
            ] : []),
          ].map(([label, value]) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSub, flex: 1 }}>{label}</Text>
              <Text style={{ color: colors.text, fontWeight: '600', flex: 2, textAlign: 'right' }}>{value}</Text>
            </View>
          ))}
        </Card>

        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} onPress={() => onNavigate?.(item.screen)}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryLight || '#E6F1FB', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <Text style={{ flex: 1, color: colors.text, fontWeight: '600', fontSize: 15 }}>{item.label}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 18 }}>{'>'}</Text>
            </Card>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={handleLogout}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3' }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFE4E6', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18 }}>🚪</Text>
            </View>
            <Text style={{ flex: 1, color: '#EA4335', fontWeight: '700', fontSize: 15 }}>Logout</Text>
          </Card>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function ProfileScreenWrapper(props) {
  return <ThemeProvider><ProfileScreen {...props} /></ThemeProvider>;
}

export { ProfileScreen };
