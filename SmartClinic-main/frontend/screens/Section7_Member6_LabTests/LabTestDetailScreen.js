import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, Button } from '../Section0_SharedTheme/theme';
import { STATUS_COLOR, RESULT_COLOR } from '../Section7_Member6_LabTests/LabTestListScreen';
import { FILE_URL } from '../../services/api';


const DETAILED_RESULTS = {
  LAB001: [
    { name: 'Haemoglobin', value: '14.2', unit: 'g/dL', range: '13.5-17.5', status: 'Normal' },
    { name: 'WBC Count', value: '8.1', unit: 'x10^3/uL', range: '4.5-11.0', status: 'Normal' },
  ],
};

function LabTestDetailScreen({ test = null, onBack, onEdit, onSendToDoctor, onUploadResult, onUpdateResults, onDelete, role }) {
  const { colors } = useTheme();
  const isPatient = role === 'Patient';
  const isAdmin = role === 'Admin';

  if (!test) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' }}>
        <Text style={{ fontSize: 40 }}>{'\u{1F539}'}</Text>
        <Text style={{ color: '#64748B', fontSize: 15, marginTop: 12 }}>No data available</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20, backgroundColor: '#1A73E8', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const t = test;
  const DETAIL_STATUS_MAP = {
    Completed: { icon: '✅', color: '#34A853' },
    Pending: { icon: '⌛', color: '#FBBC04' },
    Processing: { icon: '⚙️', color: '#1A73E8' },
    Cancelled: { icon: '❌', color: '#EA4335' },
  };

  const sc = DETAIL_STATUS_MAP[t.status] || { icon: '📋', color: '#888' };
  const rc = RESULT_COLOR?.[t.resultStatus] || '#888';
  const detailRows = t.detailedResults || [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: '#00897B', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 12 }}>{'<'} Back</Text></TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{t.testName || 'N/A'}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{t.testCategory || 'N/A'} · {t.labTestId || t._id || 'N/A'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Badge label={`${sc.icon} ${t.status || 'Unknown'}`} color="#fff" />
            {t.reportFile && t.status !== 'Completed' && <Badge label="✓ Report Submitted" color="#fff" />}
            {t.status === 'Completed' && <Badge label={t.resultStatus || 'N/A'} color="#fff" />}
          </View>
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
          <Card style={{ flex: 1, margin: 0 }}>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>PATIENT</Text>
            <Text style={{ fontSize: 20 }}>{'\u{1F9D1}\u200D\u{1F91D}\u200D\u{1F9D1}'}</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, marginTop: 4 }}>{t.patientId?.patientName || t.patientId?.name || t.patientName || 'N/A'}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t.patientId?.patientId || t.patientId?._id || 'N/A'}</Text>
          </Card>
          <Card style={{ flex: 1, margin: 0 }}>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>ORDERED BY</Text>
            <Text style={{ fontSize: 20 }}>{'\u{1F468}\u200D\u2695\uFE0F'}</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14, marginTop: 4 }}>{t.doctorId?.doctorName || t.doctorId?.name || t.doctorName || 'N/A'}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>Sample: {t.sampleType || 'N/A'}</Text>
          </Card>
        </View>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Test Details</Text>
          {[
            ['📋', 'Category', t.testCategory],
            ['💉', 'Sample Type', t.sampleType],
            ['⚡', 'Priority', t.priority],
            ['📅', 'Collection Date', t.collectionDate ? new Date(t.collectionDate).toLocaleDateString() : 'Pending'],
            ['⏱️', 'Tested On', t.testedAt ? new Date(t.testedAt).toLocaleDateString() : 'Pending'],
            ['🆔', 'Test ID', t.labTestId || t._id],
            ['📝', 'Clinical Notes', t.notes || 'No notes available'],
          ].map(([icon, label, val]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600' }}>{label.toUpperCase()}</Text>
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14, marginTop: 2 }}>{val || 'N/A'}</Text>
              </View>
            </View>
          ))}
          {t.status === 'Completed' && (
            <View style={{ marginTop: 12, padding: 12, backgroundColor: colors.primaryLight + '44', borderRadius: 10 }}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13, marginBottom: 4 }}>🔬 PRIMARY RESULT</Text>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18 }}>{t.resultValue || 'Awaiting Value'}</Text>
              <Text style={{ color: colors.textSub, fontSize: 12 }}>Reference: {t.normalRange || 'N/A'}</Text>
            </View>
          )}
        </Card>

        {detailRows.length > 0 && (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Test Results</Text>
              <Badge label={t.resultStatus || 'N/A'} color={rc} />
            </View>
            {detailRows.map((row, i) => {
               const isAbnormal = row.status && (row.status.toLowerCase().includes('high') || row.status.toLowerCase().includes('low') || row.status.toLowerCase().includes('abnormal'));
               const rowColor = isAbnormal ? '#C62828' : (RESULT_COLOR?.[row.status] || rc);
               return (
                <View key={i} style={{ marginBottom: 12, paddingBottom: 8, borderBottomWidth: i < detailRows.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{row.name}</Text>
                    {isAbnormal && <Text style={{ color: '#C62828', fontWeight: '800', fontSize: 12 }}>⚠️ {row.status}</Text>}
                  </View>
                  <Text style={{ color: rowColor, fontWeight: '800', fontSize: 15, marginVertical: 2 }}>{row.value} {row.unit}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>Normal range: {row.range || row.normalRange}</Text>
                </View>
               );
            })}
          </Card>
        )}

        {t.reportFile && (
          <Card style={{ padding: 12, backgroundColor: '#E1F5FE', borderColor: '#0288D1', borderWidth: 1 }}>
            <Text style={{ fontWeight: '800', fontSize: 13, marginBottom: 8, color: '#01579B' }}>📄 LAB REPORT ATTACHMENT</Text>
            <TouchableOpacity 
              onPress={() => {
                const url = t.reportFile.startsWith('http') ? t.reportFile : `${FILE_URL}${t.reportFile}`;
                Linking.openURL(url).catch(err => Alert.alert('Error', 'Cannot open report file.'));
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 12, borderRadius: 10, elevation: 2 }}
            >
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>📄</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: colors.text, fontSize: 14 }}>View Diagnostic Report</Text>
                <Text style={{ color: colors.textSub, fontSize: 11 }}>Uploaded {t.testedAt ? new Date(t.testedAt).toLocaleDateString() : 'recently'}</Text>
              </View>
              <Text style={{ fontSize: 18 }}>➡️</Text>
            </TouchableOpacity>
          </Card>
        )}

        {isPatient && t.status !== 'Completed' && (
          <View style={{ marginBottom: 10 }}>
            <Button title="📤 Upload Test Result" onPress={() => onUploadResult(t)} variant="outline" style={{ borderColor: colors.primary }} />
            {t.reportFile && (
              <Text style={{ color: '#34A853', fontSize: 11, fontWeight: '600', marginTop: 6, textAlign: 'center' }}>
                ✅ Shared automatically with your doctor
              </Text>
            )}
          </View>
        )}
        
        {!isPatient && (
          <>
            {t.reportFile ? (
              <Button title="📊 Update Lab Results" onPress={() => onUpdateResults(t)} variant="outline" style={{ borderStyle: 'dashed', marginBottom: 10, borderColor: colors.primary }} />
            ) : (
              <Card style={{ backgroundColor: '#FFF9C4', padding: 8, marginBottom: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#FBC02D', fontWeight: '700' }}>⚠️ Awaiting Patient Report Upload</Text>
              </Card>
            )}
            
            <View style={{ marginBottom: 10 }}>
              <Button title="🖨️ Print Report" onPress={() => typeof window !== 'undefined' && window.print && window.print()} variant="outline" />
              {t.status === 'Completed' && (
                <Text style={{ color: '#34A853', fontSize: 11, fontWeight: '600', marginTop: 6, textAlign: 'center' }}>
                  ✅ Patient has been notified of findings
                </Text>
              )}
            </View>
            <Button title="📝 Edit Order" onPress={onEdit} variant="outline" />
            <TouchableOpacity onPress={() => onDelete(t._id)} style={{ marginTop: 20, padding: 10, alignItems: 'center' }}>
              <Text style={{ color: '#EA4335', fontSize: 13, fontWeight: '700' }}>🗑️ Delete Diagnostic Order</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

export default function LabTestDetailScreenWrapper(props) {
  return <ThemeProvider><LabTestDetailScreen {...props} /></ThemeProvider>;
}
export { LabTestDetailScreen };




