import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, Card, ScreenHeader } from '../Section0_SharedTheme/theme';

function UpdateLabResultScreen({ labTest, onBack, onSave }) {
  const { colors } = useTheme();
  const [form, setForm] = useState(labTest || { 
    status: 'Completed',
    resultValue: '',
    normalRange: '',
    detailedResults: [] 
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
      <ScrollView style={{ flex:1, backgroundColor:colors.background }}>
        <ScreenHeader title="Update Lab Results" subtitle={`Test ID: ${labTest?.labTestId || labTest?._id}`} onBack={onBack} />
        
        <View style={{ padding: 24 }}>
          <Card style={{ backgroundColor: colors.primaryLight + '22', marginBottom: 20 }}>
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13, marginBottom: 4 }}>🔬 TEST OVERVIEW</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18 }}>{labTest?.testName}</Text>
            <Text style={{ color: colors.textSub, fontSize: 13 }}>{labTest?.patientId?.patientName || labTest?.patientName}</Text>
          </Card>

          <Text style={{ color: colors.textSub, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>RESULT INTERPRETATION</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {['Normal', 'High', 'Low', 'Abnormal', 'Critical'].map(s => (
              <TouchableOpacity key={s} onPress={() => set('resultStatus', s)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center', backgroundColor: form.resultStatus === s ? (s === 'Normal' ? '#34A853' : '#EA4335') : colors.inputBg, borderWidth: 1.5, borderColor: form.resultStatus === s ? (s === 'Normal' ? '#34A853' : '#EA4335') : colors.border }}>
                <Text style={{ color: form.resultStatus === s ? '#fff' : colors.textSub, fontWeight: '700', fontSize: 12 }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Primary Result Summary" placeholder="e.g. 14.5 g/dL, Positive, Stable" value={form.resultValue} onChangeText={v => set('resultValue', v)} icon="🔬" />
          <Input label="Normal Range / Reference" placeholder="e.g. 13.5-17.5" value={form.normalRange} onChangeText={v => set('normalRange', v)} icon="📊" />
          <Input label="Collection Date" placeholder="YYYY-MM-DD" value={form.collectionDate} onChangeText={v => set('collectionDate', v)} icon="📅" />

          <Text style={{ color: colors.textSub, fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 10 }}>DETAILED PARAMETER TABLE</Text>
          {(form.detailedResults || []).map((res, i) => (
            <Card key={i} style={{ padding: 12, marginBottom: 12 }}>
              <Input label="Parameter (e.g. WBC, LDL)" value={res.name} onChangeText={v => {
                const next = [...form.detailedResults];
                next[i].name = v;
                set('detailedResults', next);
              }} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Input label="Value" containerStyle={{ flex: 1 }} value={res.value} onChangeText={v => {
                  const next = [...form.detailedResults];
                  next[i].value = v;
                  set('detailedResults', next);
                }} />
                <Input label="Unit" containerStyle={{ flex: 1 }} value={res.unit} onChangeText={v => {
                  const next = [...form.detailedResults];
                  next[i].unit = v;
                  set('detailedResults', next);
                }} />
              </View>
              <TouchableOpacity onPress={() => {
                const next = form.detailedResults.filter((_, idx) => idx !== i);
                set('detailedResults', next);
              }} style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                <Text style={{ color: '#EA4335', fontSize: 12, fontWeight: '700' }}>🗑️ Delete Row</Text>
              </TouchableOpacity>
            </Card>
          ))}
          
          <Button title="+ Add New Parameter Row" variant="outline" onPress={() => set('detailedResults', [...(form.detailedResults || []), { name:'', value:'', unit:'', status:'Normal' }])} style={{ marginBottom: 20 }} />

          <Button title="💾 Save Results & Notify Patient" onPress={() => onSave({ 
            ...form, 
            status: 'Completed', 
            testedAt: new Date(),
            collectionDate: form.collectionDate || new Date()
          })} icon="✔️" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function UpdateLabResultScreenWrapper(props) {
  return <ThemeProvider><UpdateLabResultScreen {...props} /></ThemeProvider>;
}
export { UpdateLabResultScreen };
