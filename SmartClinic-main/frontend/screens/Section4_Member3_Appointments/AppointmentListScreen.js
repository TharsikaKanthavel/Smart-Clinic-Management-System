import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';

const STATUS_COLOR = { Pending: '#FBBC04', Approved: '#34A853', Completed: '#1A73E8', Cancelled: '#EA4335', Rejected: '#EA4335' };
const TABS = ['Upcoming', 'Pending', 'Approved', 'Completed', 'Cancelled', 'All'];

function AppointmentListScreen({ onAdd, onSelect, onBack, role = 'Admin', user = null, linkedPatient = null }) {
  const { colors } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [patientNameMap, setPatientNameMap] = useState({});
  const [currentPatient, setCurrentPatient] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [appointmentRes, patientRes, doctorRes] = await Promise.all([
        appointmentService.getAll(''),
        patientService.getAll(''),
        doctorService.getAll('')
      ]);
      setAppointments(appointmentRes.appointments || []);

      const map = {};
      (patientRes.patients || []).forEach((p) => {
        if (p?._id) map[String(p._id)] = p.patientName || p.name || '';
      });
      setPatientNameMap(map);

      const loggedEmail = String(user?.email || '').toLowerCase();
      const loggedPhone = String(user?.phone || user?.phoneNumber || '').replace(/\s+/g, '');
      const loggedName = String(user?.fullName || user?.name || '').toLowerCase();

      if (role === 'Patient') {
        if (linkedPatient?._id) {
          setCurrentPatient(linkedPatient);
          return;
        }
        const found = (patientRes.patients || []).find((pt) => {
          const ptEmail = String(pt?.email || '').toLowerCase();
          const ptPhone = String(pt?.phone || '').replace(/\s+/g, '');
          const ptName = String(pt?.patientName || pt?.name || '').toLowerCase();
          return (
            (loggedEmail && ptEmail && loggedEmail === ptEmail) ||
            (loggedPhone && ptPhone && loggedPhone === ptPhone) ||
            (loggedName && ptName && loggedName === ptName)
          );
        });
        setCurrentPatient(found || null);
      } else if (role === 'Doctor') {
        const foundDr = (doctorRes.doctors || []).find(dr => {
            const drEmail = String(dr.email || '').toLowerCase();
            const drName  = String(dr.doctorName || dr.name || '').toLowerCase();
            return (loggedEmail && drEmail === loggedEmail) || (loggedName && drName === loggedName);
        });
        setCurrentDoctor(foundDr || null);
      } else {
        setCurrentPatient(null);
        setCurrentDoctor(null);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role, user?.email, user?.phone, user?.phoneNumber, user?.name, user?.fullName, linkedPatient?._id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let data = [...appointments];

    if (role === 'Patient') {
      const patientMongoId = currentPatient?._id ? String(currentPatient._id) : '';
      const patientName = String(currentPatient?.patientName || currentPatient?.name || '').toLowerCase();
      data = data.filter((a) => {
        const apPatientIdRaw = typeof a.patientId === 'object' ? a.patientId?._id : a.patientId;
        const apPatientId = apPatientIdRaw ? String(apPatientIdRaw) : '';
        const apPatientName = String(a.patientName || a.patientId?.patientName || a.patientId?.name || '').toLowerCase();
        return (
          (patientMongoId && apPatientId === patientMongoId) ||
          (patientName && apPatientName === patientName)
        );
      });
    } else if (role === 'Doctor') {
      const doctorMongoId = currentDoctor?._id ? String(currentDoctor._id) : '';
      const doctorName = String(currentDoctor?.doctorName || currentDoctor?.name || '').toLowerCase();
      data = data.filter((a) => {
        const apDoctorIdRaw = typeof a.doctorId === 'object' ? a.doctorId?._id : a.doctorId;
        const apDoctorId = apDoctorIdRaw ? String(apDoctorIdRaw) : '';
        const apDoctorName = String(a.doctorName || a.doctorId?.doctorName || a.doctorId?.name || '').toLowerCase();
        return (
          (doctorMongoId && apDoctorId === doctorMongoId) ||
          (doctorName && apDoctorName === doctorName)
        );
      });
    }

    if (tab === 'Upcoming') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      data = data.filter((a) => {
        const d = new Date(a.appointmentDate);
        return !Number.isNaN(d.getTime()) && d >= now && ['Pending', 'Approved'].includes(a.appointmentStatus);
      });
    } else if (tab !== 'All') {
      data = data.filter((a) => (a.appointmentStatus || 'Pending') === tab);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter((a) =>
        (a.patientName || a.patientId?.name || a.patientId?.patientName || '').toLowerCase().includes(s) ||
        (a.doctorName || a.doctorId?.name || a.doctorId?.doctorName || '').toLowerCase().includes(s) ||
        String(a.appointmentId || '').toLowerCase().includes(s)
      );
    }

    return data;
  }, [appointments, tab, search, role, currentPatient?._id, currentPatient?.patientName, currentPatient?.name]);

  const cancelExpired = async () => {
    try {
      await appointmentService.cancelExpired();
      Alert.alert('Done', 'Expired pending appointments cancelled.');
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSub, marginTop: 12 }}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Appointments" subtitle={`${filtered.length} records`} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search appointments..." placeholderTextColor={colors.textMuted} style={{ flex: 1, color: colors.text, paddingVertical: 12, fontSize: 15 }} />
          {role === 'Admin' ? (
            <TouchableOpacity onPress={cancelExpired} style={{ backgroundColor: '#EA433520', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: '#EA4335', fontSize: 11, fontWeight: '600' }}>Auto-Cancel</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {TABS.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: tab === t ? colors.primary : colors.inputBg, marginRight: 8, borderWidth: 1.5, borderColor: tab === t ? colors.primary : colors.border }}>
              <Text style={{ color: tab === t ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 13 }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Text style={{ color: '#EA4335', fontSize: 14, marginTop: 8, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 16, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(a) => String(a._id || a.id || a.appointmentId)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          renderItem={({ item: a }) => {
            const sc = STATUS_COLOR[a.appointmentStatus] || '#888';
            const patientIdStr = typeof a.patientId === 'string' ? a.patientId : a.patientId?._id;
            const patient = a.patientName || a.patientId?.name || a.patientId?.patientName || patientNameMap[String(patientIdStr || '')] || 'Unknown Patient';
            const doctor = a.doctorName || a.doctorId?.name || a.doctorId?.doctorName || 'Unknown Doctor';
            return (
              <TouchableOpacity onPress={() => onSelect?.(a)}>
                <Card style={{ borderLeftWidth: 4, borderLeftColor: sc }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{patient}</Text>
                      <Text style={{ color: colors.textSub, fontSize: 13 }}>{doctor}</Text>
                      <Text style={{ color: colors.textSub, fontSize: 12 }}>{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : ''} - {a.appointmentTime || ''}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{`${a.appointmentId || a._id} - Q#${a.queueNumber || '-'}`}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Badge label={a.appointmentStatus || 'Pending'} color={sc} />
                      <Badge label={a.appointmentType || 'Physical'} color={colors.primary} />
                    </View>
                  </View>
                  {a.reasonForVisit ? (
                    <Text style={{ color: colors.textSub, fontSize: 12, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border }}>{a.reasonForVisit}</Text>
                  ) : null}
                </Card>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Text style={{ color: colors.textSub, marginTop: 12 }}>No appointments found</Text></View>}
        />
      )}

      {role === 'Admin' ? (
        <TouchableOpacity onPress={onAdd} style={{ position: 'absolute', bottom: 30, right: 24, backgroundColor: colors.primary, borderRadius: 28, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', elevation: 6 }}>
          <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32 }}>+</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function AppointmentListScreenWrapper(p) {
  return <ThemeProvider><AppointmentListScreen {...p} /></ThemeProvider>;
}

export { AppointmentListScreen };
