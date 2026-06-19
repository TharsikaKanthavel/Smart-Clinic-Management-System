import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { appointmentService } from '../../services/appointmentService';

function DoctorCalendarScreen({ doctor, onBack, onSelectAppointment }) {
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await appointmentService.getAll('');
        const all = res?.appointments || [];
        const list = all.filter((a) => {
          const did = a?.doctorId?._id || a?.doctorId;
          return doctor?._id && String(did) === String(doctor._id);
        });
        if (!mounted) return;
        setAppointments(list);
      } catch {
        if (!mounted) return;
        setAppointments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [doctor?._id]);

  const dates = useMemo(() => {
    const unique = [...new Set(appointments.map((a) => (a.appointmentDate ? new Date(a.appointmentDate).toISOString().slice(0, 10) : '')).filter(Boolean))];
    return unique.sort();
  }, [appointments]);

  const effectiveDate = selectedDate || dates[0] || '';
  const dayApts = appointments.filter((a) => a.appointmentDate && new Date(a.appointmentDate).toISOString().slice(0, 10) === effectiveDate);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Appointment Calendar" subtitle={`${doctor?.doctorName || doctor?.name || 'Doctor'} - ${doctor?.specialization || ''}`} onBack={onBack} />

      <View style={{ paddingHorizontal: 20 }}>
        {loading ? (
          <View style={{ paddingVertical: 30, alignItems: 'center' }}><ActivityIndicator color={colors.primary} /></View>
        ) : (
          <>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 17, marginBottom: 12 }}>Available Dates</Text>
            {dates.length === 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: 24 }}><Text style={{ color: colors.textSub }}>No appointment data available</Text></Card>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
                {dates.map((d) => (
                  <TouchableOpacity key={d} onPress={() => setSelectedDate(d)} style={{ marginRight: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: (effectiveDate === d) ? colors.primary : colors.inputBg, borderWidth: 1, borderColor: (effectiveDate === d) ? colors.primary : colors.border }}>
                    <Text style={{ color: (effectiveDate === d) ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 12 }}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{effectiveDate || 'No date selected'}</Text>
              <Badge label={`${dayApts.length} total`} color={colors.primary} />
            </View>

            {dayApts.length === 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
                <Text style={{ color: colors.textSub }}>No appointments for selected date</Text>
              </Card>
            ) : dayApts.map((apt) => (
              <TouchableOpacity key={apt._id || apt.appointmentId} onPress={() => onSelectAppointment?.(apt)}>
                <Card>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{apt.patientName || 'Unknown Patient'}</Text>
                  <Text style={{ color: colors.textSub, fontSize: 12 }}>{apt.reasonForVisit || ''}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                    <Text style={{ color: colors.textSub, fontSize: 12 }}>Time: {apt.appointmentTime || ''}</Text>
                    <Text style={{ color: colors.textSub, fontSize: 12 }}>{apt.appointmentType || 'Physical'}</Text>
                    <Text style={{ color: colors.textSub, fontSize: 12 }}>{apt.appointmentStatus || 'Pending'}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

export default function DoctorCalendarScreenWrapper(props) {
  return <ThemeProvider><DoctorCalendarScreen {...props} /></ThemeProvider>;
}

export { DoctorCalendarScreen };

