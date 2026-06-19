import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, Button } from '../Section0_SharedTheme/theme';

function DoctorProfileScreen({ doctor, onBack, onEdit, onCalendar, onHistory, onToggleStatus, onDelete }) {
  const { colors } = useTheme();

  if (!doctor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ fontSize: 40 }}>{'\uD83D\uDC68\u200D\u2695\uFE0F'}</Text>
        <Text style={{ color: colors.textSub, fontSize: 15, marginTop: 12 }}>No doctor selected</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const d = doctor;
  const availableDays = Array.isArray(d.availableDays) ? d.availableDays : [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.primary, paddingTop: 56, paddingBottom: 28, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <TouchableOpacity onPress={onBack} style={{ position: 'absolute', top: 56, left: 24, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: '#fff' }}>{'\u2190 Back'}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 10 }}>{d.doctorName || d.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{d.specialization || 'General'} · {d.department || 'N/A'}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Badge label={d.status || 'Active'} color="#fff" />
          <Badge label={d.consultationMode || d.mode || 'Physical'} color="#fff" />
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Details</Text>
          {[
            ['Hospital', d.hospitalName || d.hospital],
            ['Qualification', d.qualification],
            ['License', d.licenseNumber || d.license],
            ['Phone', d.phone],
            ['Email', d.email],
            ['Fee', `Rs.${d.consultationFee || d.fee || 0}`],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSub, fontSize: 13, width: 110 }}>{label}</Text>
              <Text style={{ flex: 1, color: colors.text, fontWeight: '600', fontSize: 13 }}>{val || 'N/A'}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Availability</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <View key={day} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: availableDays.includes(day) ? colors.primary : colors.inputBg }}>
                <Text style={{ color: availableDays.includes(day) ? '#fff' : colors.textMuted, fontWeight: '600', fontSize: 12 }}>{day}</Text>
              </View>
            ))}
          </View>
          <Text style={{ color: colors.textSub, fontSize: 13 }}>{d.availableTime || 'N/A'}</Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button title="Edit Doctor" onPress={onEdit} icon={"\u270F\uFE0F"} style={{ flex: 1 }} />
          <Button title={(d.status || 'Active') === 'Active' ? 'Disable' : 'Enable'} onPress={onToggleStatus} variant="outline" style={{ flex: 1 }} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Button title="Delete Doctor" onPress={onDelete} icon={"\uD83D\uDDD1\uFE0F"} variant="danger" />
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Button title="Calendar" onPress={onCalendar} variant="outline" style={{ flex: 1 }} />
          <Button title="History" onPress={onHistory} variant="outline" style={{ flex: 1 }} />
        </View>
      </View>
    </ScrollView>
  );
}

export default function DoctorProfileScreenWrapper(props) {
  return <ThemeProvider><DoctorProfileScreen {...props} /></ThemeProvider>;
}

export { DoctorProfileScreen };



