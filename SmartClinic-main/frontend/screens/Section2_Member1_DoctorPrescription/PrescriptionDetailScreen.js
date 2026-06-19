import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeProvider, Card, Badge, Button } from '../Section0_SharedTheme/theme';

function PrescriptionDetailScreen({ prescription, onBack, onEdit, onDelete, canManage = true }) {
  const { colors } = useTheme();

  if (!prescription) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Ionicons name="document-text-outline" size={44} color={colors.primary} />
        <Text style={{ color: colors.textSub, fontSize: 15, marginTop: 12 }}>No prescription selected</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rx = prescription;
  const recordId = rx._id || rx.id || '';
  const patient = rx.patientName || rx.patientId?.patientName || rx.patientId?.name || 'Unknown Patient';
  const doctor = rx.doctorName || rx.doctorId?.doctorName || rx.doctorId?.name || 'Unknown Doctor';
  const medicines = Array.isArray(rx.medicines) ? rx.medicines : [];
  const issuedDate = rx.dateIssued ? new Date(rx.dateIssued).toLocaleDateString() : 'N/A';
  const followUpDate = rx.followUpDate ? new Date(rx.followUpDate).toLocaleDateString() : 'N/A';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.primary, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 }}>
          <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Prescription ID</Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{rx.prescriptionId || rx._id}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{rx.dateIssued ? new Date(rx.dateIssued).toLocaleDateString() : ''}</Text>
          </View>
          <Badge label={rx.refillAllowed ? 'Refill Allowed' : 'No Refill'} color="#fff" />
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
          <Card style={{ flex: 1, margin: 0 }}>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>PATIENT</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, marginTop: 4 }}>{patient}</Text>
          </Card>
          <Card style={{ flex: 1, margin: 0 }}>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>DOCTOR</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, marginTop: 4 }}>{doctor}</Text>
          </Card>
        </View>

        <Card>
          <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6 }}>DIAGNOSIS</Text>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{rx.diagnosis || 'N/A'}</Text>
          {rx.notes && (
            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>NOTES</Text>
              <Text style={{ color: colors.text, fontSize: 14 }}>{rx.notes}</Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Prescription Info</Text>
          {[
            ['Status', rx.status || 'Active'],
            ['Issued Date', issuedDate],
            ['Follow Up Date', followUpDate],
            ['Refill', rx.refillAllowed ? 'Allowed' : 'Not Allowed'],
            ['Prescription Number', rx.prescriptionId || rx._id || 'N/A'],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSub, fontSize: 13, width: 130 }}>{label}</Text>
              <Text style={{ flex: 1, color: colors.text, fontWeight: '600', fontSize: 13 }}>{String(val)}</Text>
            </View>
          ))}
        </Card>

        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Medicines Prescribed</Text>
        {medicines.length === 0 ? (
          <Card><Text style={{ color: colors.textSub }}>No medicine items</Text></Card>
        ) : medicines.map((m, i) => (
          <Card key={i} style={{ borderLeftWidth: 4, borderLeftColor: colors.primary }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{m.name || m.medicineName}</Text>
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>{m.dosage || '-'}</Text>
                {m.instructions ? <Text style={{ color: colors.textSub, fontSize: 12, marginTop: 2 }}>{m.instructions}</Text> : null}
                {(m.duration || m.days) ? <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{`Duration: ${m.duration || m.days}`}</Text> : null}
              </View>
              <Badge label={`Qty: ${m.qty || m.quantity || 0}`} color={colors.primary} />
            </View>
          </Card>
        ))}

        {canManage ? (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
              <Button title="Edit" onPress={onEdit} icon="✎" style={{ flex: 1 }} />
            </View>

            <Button
              title="Delete Prescription"
              onPress={() => {
                if (!recordId) {
                  Alert.alert('Error', 'Prescription ID not found.');
                  return;
                }
                onDelete?.(recordId);
              }}
              icon="🗑"
              variant="danger"
            />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

export default function PrescriptionDetailScreenWrapper(props) {
  return <ThemeProvider><PrescriptionDetailScreen {...props} /></ThemeProvider>;
}

export { PrescriptionDetailScreen };
