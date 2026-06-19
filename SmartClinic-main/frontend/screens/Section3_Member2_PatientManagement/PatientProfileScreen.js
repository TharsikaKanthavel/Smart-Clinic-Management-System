import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, Button } from '../Section0_SharedTheme/theme';

function PatientProfileScreen({ patient = null, onBack, onEdit, onDelete, onHistory, onReports, onPrescriptions }) {
  const { colors } = useTheme();

  if (!patient) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ fontSize: 40 }}>🧑‍🤝‍🧑</Text>
        <Text style={{ color: colors.textSub, fontSize: 15, marginTop: 12 }}>No patient selected</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const p = patient;
  const name = p.name || p.patientName || 'Unknown Patient';
  const patientId = p.id || p.patientId || 'N/A';
  const chronicDiseases = Array.isArray(p.chronicDiseases) ? p.chronicDiseases : [];
  const allergies = Array.isArray(p.allergies) ? p.allergies : [];
  const emergencyContactName = p.emergencyContactName || p.emergencyContact || 'N/A';
  const emergencyPhone = p.emergencyContactNumber || p.emergencyPhone || 'N/A';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: p.gender === 'Female' ? '#EC4899' : colors.primary, paddingTop: 56, paddingBottom: 28, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <TouchableOpacity onPress={onBack} style={{ position: 'absolute', top: 56, left: 24, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: '#fff' }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.45)' }}>
          <Text style={{ fontSize: 36 }}>{p.gender === 'Female' ? '👩' : '👨'}</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 10 }}>{name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{p.age || 'N/A'} years - {p.gender || 'N/A'} - {patientId}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Badge label={p.bloodGroup || 'N/A'} color="#fff" />
          <Badge label="Active" color="#fff" />
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Visits', value: p.visitCount || 0 },
            { label: 'Reports', value: (p.medicalReport || []).length || 0 },
            { label: 'Conditions', value: chronicDiseases.length },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18 }}>{s.value}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Personal Info</Text>
          {[
            ['Date of Birth', p.dob || (p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : 'N/A')],
            ['Phone', p.phone || 'N/A'],
            ['Email', p.email || 'N/A'],
            ['Address', p.address || 'N/A'],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSub, fontSize: 13, width: 120 }}>{label}</Text>
              <Text style={{ flex: 1, color: colors.text, fontWeight: '600', fontSize: 13 }}>{String(val)}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Medical Info</Text>
          <Text style={{ color: colors.textSub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>CHRONIC CONDITIONS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {chronicDiseases.length > 0 ? chronicDiseases.map((d) => <Badge key={d} label={d} color="#EA4335" />) : <Text style={{ color: colors.textMuted, fontSize: 13 }}>None reported</Text>}
          </View>
          <Text style={{ color: colors.textSub, fontSize: 12, fontWeight: '600', marginBottom: 6 }}>ALLERGIES</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {allergies.length > 0 ? allergies.map((a) => <Badge key={a} label={`⚠️ ${a}`} color="#FBBC04" />) : <Text style={{ color: colors.textMuted, fontSize: 13 }}>No known allergies</Text>}
          </View>
        </Card>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Insurance & Emergency</Text>
          {[
            ['Insurance Provider', p.insuranceProvider || p.insurance || 'N/A'],
            ['Insurance Number', p.insuranceNumber || p.insuranceNo || 'N/A'],
            ['Emergency Contact', emergencyContactName],
            ['Emergency Phone', emergencyPhone],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSub, fontSize: 13, width: 150 }}>{label}</Text>
              <Text style={{ flex: 1, color: colors.text, fontWeight: '600', fontSize: 13 }}>{String(val)}</Text>
            </View>
          ))}
        </Card>

        <View style={{ gap: 10 }}>
          {(onEdit || onDelete) && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {onEdit && <Button title="Edit Profile" onPress={onEdit} icon="✏️" style={{ flex: 1 }} />}
              {onDelete && <Button title="Delete" onPress={onDelete} icon="🗑️" variant="danger" style={{ flex: 1 }} />}
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="History" onPress={onHistory} variant="outline" style={{ flex: 1 }} />
            <Button title="Medical Reports" onPress={onReports} variant="outline" style={{ flex: 1 }} />
          </View>
          <Button title="Prescriptions" onPress={onPrescriptions} variant="outline" />
        </View>
      </View>
    </ScrollView>
  );
}

export default function PatientProfileScreenWrapper(props) {
  return <ThemeProvider><PatientProfileScreen {...props} /></ThemeProvider>;
}

export { PatientProfileScreen };
