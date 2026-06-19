import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeProvider, Card, Badge } from '../Section0_SharedTheme/theme';
import { prescriptionService } from '../../services/prescriptionService';

const STATUS_COLOR = { Active: '#1A73E8', Completed: '#34A853', Expired: '#94A3B8' };

function PrescriptionHistoryScreen({ history, patient, onBack, onSelect }) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadedHistory, setLoadedHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    if (Array.isArray(history)) {
      setLoadedHistory(history);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await prescriptionService.getAll('');
      setLoadedHistory(res?.prescriptions || []);
    } catch (e) {
      setError(e?.message || 'Failed to load prescription history');
    } finally {
      setLoading(false);
    }
  }, [history]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const normalized = useMemo(() => {
    const patientMongoId = patient?._id ? String(patient._id) : '';
    const patientCodeId = patient?.patientId ? String(patient.patientId).toLowerCase() : '';
    const patientName = (patient?.patientName || patient?.name || '').toLowerCase();
    const hasPatientContext = Boolean(
      patient && (
        patient.patientId ||
        patient.patientName ||
        (patient.name && patient.name !== 'Patient')
      )
    );
    const list = loadedHistory.filter((rx) => {
      if (!hasPatientContext) return true;
      const rxPatientIdRaw = typeof rx.patientId === 'object' ? rx.patientId?._id : rx.patientId;
      const rxPatientId = rxPatientIdRaw ? String(rxPatientIdRaw) : '';
      const rxPatientCodeRaw = rx.patientId?.patientId || rx.patientCode || rx.patientRef;
      const rxPatientCode = rxPatientCodeRaw ? String(rxPatientCodeRaw).toLowerCase() : '';
      const rxPatientName = (rx.patientName || rx.patientId?.patientName || rx.patientId?.name || '').toLowerCase();
      return (
        (patientMongoId && rxPatientId === patientMongoId) ||
        (patientCodeId && rxPatientCode === patientCodeId) ||
        (patientName && rxPatientName === patientName)
      );
    });

    return list.map((rx) => ({
      id: rx.prescriptionId || rx.id || rx._id,
      doctor: rx.doctorName || rx.doctorId?.doctorName || rx.doctorId?.name || 'Unknown Doctor',
      date: rx.dateIssued ? new Date(rx.dateIssued).toLocaleDateString() : rx.date || '',
      diagnosis: rx.diagnosis || 'N/A',
      medicines: Array.isArray(rx.medicines) ? rx.medicines : [],
      refillAllowed: !!rx.refillAllowed,
      followUp: rx.followUpDate ? new Date(rx.followUpDate).toLocaleDateString() : rx.followUp,
      status: rx.status || 'Active',
      raw: rx,
    }));
  }, [loadedHistory, patient?._id, patient?.patientId, patient?.patientName, patient?.name]);

  const filtered = normalized.filter((rx) => {
    const q = search.toLowerCase();
    const matchSearch = rx.diagnosis.toLowerCase().includes(q) || rx.doctor.toLowerCase().includes(q) || String(rx.id).toLowerCase().includes(q);
    const matchFilter = filter === 'All' || rx.status === filter;
    return matchSearch && matchFilter;
  });

  const totalMeds = normalized.reduce((sum, rx) => sum + rx.medicines.length, 0);
  const activeRx = normalized.filter((r) => r.status === 'Active').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.primary, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 }}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Prescription History</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
          {patient?.name || patient?.patientName || 'All Patients'}{patient?.patientId ? ` - ${patient.patientId}` : ''}
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 14, padding: 12 }}>
          {[
            { icon: 'document-text-outline', label: 'Total Rx', value: normalized.length },
            { icon: 'checkmark-circle-outline', label: 'Active', value: activeRx },
            { icon: 'medkit-outline', label: 'Medicines', value: totalMeds },
            { icon: 'refresh-outline', label: 'Refillable', value: normalized.filter((r) => r.refillAllowed).length },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, alignItems: 'center' }}>
              <Ionicons name={s.icon} size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{s.value}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by diagnosis, doctor or ID..." placeholderTextColor={colors.textMuted} style={{ flex: 1, color: colors.text, paddingVertical: 12, fontSize: 15 }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {['All', 'Active', 'Completed'].map((f) => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: filter === f ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: filter === f ? colors.primary : colors.border }}>
              <Text style={{ color: filter === f ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 13 }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSub, marginTop: 10 }}>Loading prescription history...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: '#EA4335', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={loadHistory} style={{ marginTop: 14, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(rx) => String(rx.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          renderItem={({ item: rx }) => (
            <TouchableOpacity style={{ flex: 1 }} onPress={() => onSelect?.(rx.raw)}>
              <Card style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{rx.diagnosis}</Text>
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>By {rx.doctor}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Badge label={rx.status} color={STATUS_COLOR[rx.status] || colors.textMuted} />
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>{rx.id}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Text style={{ color: colors.textSub, fontSize: 12 }}>{`Date: ${rx.date}`}</Text>
                  <Badge label={rx.refillAllowed ? 'Refill OK' : 'No Refill'} color={rx.refillAllowed ? '#34A853' : '#94A3B8'} />
                  {rx.followUp ? <Text style={{ color: colors.textSub, fontSize: 12 }}>{`Follow-up: ${rx.followUp}`}</Text> : null}
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textSub, marginTop: 12 }}>No prescription history found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

export default function PrescriptionHistoryScreenWrapper(props) {
  return <ThemeProvider><PrescriptionHistoryScreen {...props} /></ThemeProvider>;
}

export { PrescriptionHistoryScreen };
