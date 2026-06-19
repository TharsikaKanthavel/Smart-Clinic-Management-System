import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { prescriptionService } from '../../services/prescriptionService';

const STATUS_COLOR = { Active: '#34A853', Completed: '#1A73E8', Cancelled: '#EA4335' };

function PrescriptionListScreen({ onAdd, onSelect, onBack, onHistory, onAnalytics, patient = null, role = 'Admin', readOnly = false }) {
  const { colors } = useTheme();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const patientMongoId = patient?._id ? String(patient._id) : '';
  const patientCodeId = patient?.patientId ? String(patient.patientId).toLowerCase() : '';
  const patientName = (patient?.patientName || patient?.name || '').toLowerCase();
  const isReadOnly = readOnly || role === 'Patient';
  const showTopActions = !patient && !isReadOnly && role === 'Admin';
  const showAddButton = !patient && typeof onAdd === 'function' && !isReadOnly;

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await prescriptionService.getAll('');
      setPrescriptions(res.prescriptions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const filteredPrescriptions = useMemo(() => {
    let list = [...prescriptions];

    if (patient) {
      list = list.filter((rx) => {
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
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((rx) => {
        const diagnosis = String(rx.diagnosis || '').toLowerCase();
        const idText = String(rx.prescriptionId || rx._id || '').toLowerCase();
        const pName = String(rx.patientName || rx.patientId?.name || rx.patientId?.patientName || '').toLowerCase();
        const dName = String(rx.doctorName || rx.doctorId?.name || rx.doctorId?.doctorName || '').toLowerCase();
        const medicines = Array.isArray(rx.medicines)
          ? rx.medicines.map((m) => String(m.name || m.medicineName || '').toLowerCase()).join(' ')
          : '';
        return diagnosis.includes(q) || idText.includes(q) || pName.includes(q) || dName.includes(q) || medicines.includes(q);
      });
    }

    return list;
  }, [prescriptions, search, patient, patientMongoId, patientCodeId, patientName]);

  const deleteRx = (id) => Alert.alert('Delete Prescription', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          if (!id) {
            Alert.alert('Error', 'Prescription ID not found.');
            return;
          }
          await prescriptionService.delete(id);
          load();
          Alert.alert('Deleted.');
        } catch (e) {
          Alert.alert('Error', e.message);
        }
      },
    },
  ]);

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSub, marginTop: 12 }}>Loading prescriptions...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Prescriptions"
        subtitle={`${filteredPrescriptions.length} records${patientName ? ` - ${patient?.patientName || patient?.name}` : ''}`}
        onBack={onBack}
      />

      {showTopActions ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <TouchableOpacity onPress={onHistory} style={{ flex: 1, backgroundColor: colors.inputBg, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textSub, fontWeight: '600', fontSize: 13 }}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onAnalytics} style={{ flex: 1, backgroundColor: colors.inputBg, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.textSub, fontWeight: '600', fontSize: 13 }}>Analytics</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search prescriptions..." placeholderTextColor={colors.textMuted} style={{ flex: 1, color: colors.text, paddingVertical: 12, fontSize: 15 }} />
        </View>
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
          data={filteredPrescriptions}
          keyExtractor={(p) => String(p._id || p.id || p.prescriptionId)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          renderItem={({ item: p }) => {
            const sc = STATUS_COLOR[p.status] || '#888';
            const patientText = p.patientName || p.patientId?.name || p.patientId?.patientName || p.patientId || 'Unknown';
            const doctorText = p.doctorName || p.doctorId?.name || p.doctorId?.doctorName || p.doctorId || 'Unknown';
            return (
              <TouchableOpacity onPress={() => onSelect?.(p)}>
                <Card style={{ borderLeftWidth: 4, borderLeftColor: sc }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{p.diagnosis || 'Prescription'}</Text>
                      <Text style={{ color: colors.textSub, fontSize: 13 }}>{patientText}</Text>
                      <Text style={{ color: colors.textSub, fontSize: 12 }}>{doctorText}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{`${p.prescriptionId || p._id} | ${p.dateIssued ? new Date(p.dateIssued).toLocaleDateString() : ''}`}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Badge label={p.status || 'Active'} color={sc} />
                      {p.refillAllowed ? <Badge label="Refill" color="#00897B" /> : null}
                      {!isReadOnly ? (
                        <TouchableOpacity onPress={() => deleteRx(p._id || p.id)} style={{ backgroundColor: '#EA433520', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 }}>
                          <Text style={{ color: '#EA4335', fontSize: 11, fontWeight: '600' }}>Delete</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                  {p.medicines?.length > 0 ? (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <Text style={{ color: colors.textSub, fontSize: 12 }}>{p.medicines.map((m) => m.name || m.medicineName).join(', ')}</Text>
                    </View>
                  ) : null}
                </Card>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Text style={{ color: colors.textSub, marginTop: 12 }}>No prescriptions found</Text></View>}
        />
      )}

      {showAddButton ? (
        <TouchableOpacity onPress={onAdd} style={{ position: 'absolute', bottom: 30, right: 24, backgroundColor: colors.primary, borderRadius: 28, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', elevation: 6 }}>
          <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32 }}>+</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function PrescriptionListScreenWrapper(p) {
  return <ThemeProvider><PrescriptionListScreen {...p} /></ThemeProvider>;
}

export { PrescriptionListScreen };
