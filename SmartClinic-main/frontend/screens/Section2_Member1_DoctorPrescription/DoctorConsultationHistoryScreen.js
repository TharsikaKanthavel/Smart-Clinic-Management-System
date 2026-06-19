import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Card } from '../Section0_SharedTheme/theme';
import { appointmentService } from '../../services/appointmentService';

function DoctorConsultationHistoryScreen({ doctor, onBack }) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await appointmentService.getAll('');
        const all = res?.appointments || [];
        const list = all
          .filter((a) => {
            const did = a?.doctorId?._id || a?.doctorId;
            return doctor?._id && String(did) === String(doctor._id);
          })
          .map((a) => ({
            _id: a._id,
            consultationId: a.appointmentId,
            patientName: a.patientName || a.patientId?.patientName || 'Unknown Patient',
            diagnosis: a.reasonForVisit || 'Consultation',
            type: a.appointmentType || 'Physical',
            outcome: a.notes || '',
            date: a.appointmentDate,
            time: a.appointmentTime,
            status: a.appointmentStatus,
          }));
        if (!mounted) return;
        setConsultations(list);
      } catch {
        if (!mounted) return;
        setConsultations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [doctor?._id]);

  const filtered = useMemo(() => consultations.filter((c) => {
    const q = search.toLowerCase();
    const ms = (c.patientName || '').toLowerCase().includes(q) || (c.diagnosis || '').toLowerCase().includes(q) || String(c.consultationId || c._id || '').toLowerCase().includes(q);
    const mt = typeFilter === 'All' || (c.type || '') === typeFilter;
    return ms && mt;
  }), [consultations, search, typeFilter]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.primary, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>{'\u2190 Back'}</Text></TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Consultation History</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{doctor?.doctorName || doctor?.name || 'Doctor'}</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>{'\uD83D\uDD0D'}</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by patient or diagnosis..." placeholderTextColor={colors.textMuted} style={{ flex: 1, color: colors.text, paddingVertical: 12, fontSize: 15 }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          {['All', 'Physical', 'Online'].map((t) => (
            <TouchableOpacity key={t} onPress={() => setTypeFilter(t)} style={{ paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: typeFilter === t ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: typeFilter === t ? colors.primary : colors.border }}>
              <Text style={{ color: typeFilter === t ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 13 }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.consultationId || i._id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          renderItem={({ item: c }) => (
            <Card>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{c.patientName || 'Unknown Patient'}</Text>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>{c.diagnosis || ''}</Text>
              <Text style={{ color: colors.textSub, fontSize: 12, marginTop: 6 }}>
                {c.date ? new Date(c.date).toLocaleDateString() : ''} {c.time ? `· ${c.time}` : ''} · {c.status || ''}
              </Text>
              <Text style={{ color: colors.textSub, fontSize: 13, marginTop: 6 }}>{c.outcome || ''}</Text>
            </Card>
          )}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Text style={{ fontSize: 48 }}>{'\uD83D\uDD0D'}</Text><Text style={{ color: colors.textSub, marginTop: 12 }}>No consultations found</Text></View>}
        />
      )}
    </View>
  );
}

export default function DoctorConsultationHistoryScreenWrapper(props) {
  return <ThemeProvider><DoctorConsultationHistoryScreen {...props} /></ThemeProvider>;
}

export { DoctorConsultationHistoryScreen };


