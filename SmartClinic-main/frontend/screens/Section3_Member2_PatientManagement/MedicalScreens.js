import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeProvider, Card, Badge, Button, ScreenHeader } from '../Section0_SharedTheme/theme';

const TYPE_COLOR = { Visit: '#1A73E8', Lab: '#00897B', Report: '#7C3AED' };

const toText = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => toText(item)).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${toText(v)}`)
      .join(', ');
  }
  return 'N/A';
};

const toDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
};

function MedicalHistoryScreen({ patient = { name: 'Patient', id: '' }, history = [], onBack }) {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Medical History" subtitle={`${patient.name}${patient.id ? ` - ${patient.id}` : ''}`} onBack={onBack} />
      <View style={{ padding: 20 }}>
        {history.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 22 }}>
            <Text style={{ color: colors.textSub }}>No medical history records</Text>
          </Card>
        ) : history.map((h, i) => {
          const type = toText(h.type || 'Record');
          const diagnosis = toText(h.diagnosis || h.title || h.note || 'Medical record');
          const note = toText(h.note || h.details || h.description || '');
          const dateLabel = toDate(h.date || h.createdAt || h.updatedAt);
          return (
            <View key={String(h._id || h.id || i)} style={{ flexDirection: 'row', gap: 12, marginBottom: 4 }}>
              <View style={{ alignItems: 'center', width: 38 }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: (TYPE_COLOR[type] || '#888') + '22', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="time-outline" size={18} color={TYPE_COLOR[type] || colors.primary} />
                </View>
                {i < history.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4 }} />}
              </View>
              <Card style={{ flex: 1, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Badge label={type} color={TYPE_COLOR[type] || colors.primary} />
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{dateLabel}</Text>
                </View>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{diagnosis}</Text>
                {note !== 'N/A' ? <Text style={{ color: colors.textSub, fontSize: 12 }}>{note}</Text> : null}
              </Card>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function MedicalReportsScreen({ patient = { name: 'Patient' }, reports = [], onBack, onUpload, onDelete, onOpen }) {
  const { colors } = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Medical Reports" subtitle={patient.name} onBack={onBack} />
      <View style={{ padding: 20 }}>
        <Button title="Upload New Report" onPress={onUpload} icon="↑" style={{ marginBottom: 20 }} />
        {reports.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 22 }}>
            <Text style={{ color: colors.textSub }}>No reports available</Text>
          </Card>
        ) : reports.map((r, idx) => {
          const reportName = toText(r?.name || r?.title || r?.fileName || r);
          const reportType = toText(r?.type || 'Document');
          const reportDate = toDate(r?.date || r?.createdAt || r?.updatedAt);
          return (
            <Card key={String(r?._id || r?.id || idx)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{reportName}</Text>
                <Text style={{ color: colors.textSub, fontSize: 12 }}>{`${reportType}${reportDate ? ` - ${reportDate}` : ''}`}</Text>
              </View>
              <TouchableOpacity onPress={() => onOpen?.(r)} style={{ backgroundColor: colors.primaryLight, borderRadius: 10, padding: 10 }}>
                <Ionicons name="open-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete?.(r)} style={{ backgroundColor: '#EA433520', borderRadius: 10, padding: 10 }}>
                <Ionicons name="trash-outline" size={18} color="#EA4335" />
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

function HealthSummaryScreen({ patient = { name: 'Patient' }, vitals = [], onBack }) {
  const { colors } = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Health Summary" subtitle={`Generated for ${patient.name}`} onBack={onBack} />
      <View style={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 14 }}>Recent Vitals</Text>
          {vitals.length === 0 ? (
            <Text style={{ color: colors.textSub }}>No vitals data available</Text>
          ) : vitals.map((v) => (
            <View key={v.label} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{v.label}</Text>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>{v.value}</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}

function MedicalHistoryWrapper(props) { return <ThemeProvider><MedicalHistoryScreen {...props} /></ThemeProvider>; }
function MedicalReportsWrapper(props) { return <ThemeProvider><MedicalReportsScreen {...props} /></ThemeProvider>; }
function HealthSummaryWrapper(props) { return <ThemeProvider><HealthSummaryScreen {...props} /></ThemeProvider>; }

export default MedicalHistoryWrapper;
export { MedicalHistoryScreen, MedicalReportsScreen, HealthSummaryScreen };
