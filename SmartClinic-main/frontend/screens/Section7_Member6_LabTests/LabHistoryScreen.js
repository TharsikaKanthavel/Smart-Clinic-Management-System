import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge } from '../Section0_SharedTheme/theme';

function LabHistoryScreen({ patient = { name: 'Patient', id: '' }, tests = [], onBack, onSelect }) {
  const { colors } = useTheme();
  const completed = tests.filter((t) => t.status === 'Completed').length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: '#00897B', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 12 }}>? Back</Text></TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Lab History</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{patient.name}{patient.id ? ` · ${patient.id}` : ''}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 14, padding: 12 }}>
          {[{ label: 'Total Tests', value: tests.length }, { label: 'Completed', value: completed }].map((s) => (
            <View key={s.label} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>{s.value}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ padding: 20 }}>
        {tests.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 48 }}>{'\u{1F539}'}</Text>
            <Text style={{ color: colors.textSub, marginTop: 12 }}>No lab tests found for this patient</Text>
          </View>
        ) : tests.map((t, i) => (
          <TouchableOpacity key={t._id || i} style={{ flex: 1 }} onPress={() => onSelect?.(t)}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Badge label={t.testCategory || 'Lab'} color="#00897B" />
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.testedAt ? new Date(t.testedAt).toLocaleDateString() : ''}</Text>
              </View>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{t.testName || 'Test'}</Text>
              <Text style={{ color: colors.textSub, fontSize: 12, marginTop: 2 }}>{t.resultStatus || t.status || ''}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

export default function LabHistoryScreenWrapper(props) {
  return <ThemeProvider><LabHistoryScreen {...props} /></ThemeProvider>;
}

export { LabHistoryScreen };

