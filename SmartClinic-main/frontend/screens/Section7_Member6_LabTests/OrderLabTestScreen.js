// ============================================================
//  OrderLabTestScreen.js
//  Member 5 — Lab Tests & Reports
//  Order a new lab test, select category, sample type
// ============================================================
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, Card, ScreenHeader } from '../Section0_SharedTheme/theme';
import { patientService } from '../../services/patientService';

const CATEGORIES = ['Haematology','Biochemistry','Radiology','Immunology','Neurology','Microbiology','Pathology','Cardiology'];
const TESTS_BY_CAT = {
  Haematology:  ['Complete Blood Count','Haemoglobin','Blood Group','Coagulation Profile','ESR'],
  Biochemistry: ['HbA1c','Lipid Panel','Liver Function Test','Kidney Function Test','Thyroid Profile','Electrolytes','Blood Glucose (Fasting)'],
  Radiology:    ['X-Ray Chest','X-Ray Bone','MRI Brain','MRI Spine','CT Scan Abdomen','Ultrasound Abdomen','Echocardiogram'],
  Immunology:   ['Skin Patch Test','ANA Test','Rheumatoid Factor','Allergy Panel','CRP','Widal Test'],
  Neurology:    ['EEG','NCS','EMG','CSF Analysis'],
  Microbiology: ['Urine Culture','Blood Culture','Stool Culture','Sputum Culture','Throat Swab'],
  Pathology:    ['Biopsy','PAP Smear','Fine Needle Aspiration','Histopathology'],
  Cardiology:   ['ECG','Stress Test','Holter Monitor','Cardiac Enzymes'],
};
const SAMPLE_TYPES = ['Blood','Urine','Stool','Sputum','Skin','Tissue','N/A'];
const PRIORITY_OPTS = ['Routine','Urgent','STAT'];

function OrderLabTestScreen({ labTest, onBack, onSave, role }) {
  const { colors } = useTheme();
  const isEdit = !!labTest;
  const isPhysician = role === 'Doctor' || role === 'Admin';
  
  const [form, setForm] = useState(labTest || { 
    patientId:'', 
    testCategory:'Haematology', 
    testName:'', 
    sampleType:'Blood', 
    priority:'Routine', 
    notes:'', 
    collectionDate:'',
    status: 'Pending',
    resultValue: '',
    normalRange: '',
    detailedResults: [] 
  });
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientList, setShowPatientList] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  useEffect(() => {
    console.log('Search triggered with:', patientSearch);
    if (patientSearch.length > 0 && !selectedPatient) {
      const delay = setTimeout(async () => {
        setLoadingPatients(true);
        try {
          const res = await patientService.getAll(`?search=${encodeURIComponent(patientSearch)}`);
          console.log('API Results:', res.patients?.length || 0, 'patients found');
          setPatients(res.patients || []);
          setShowPatientList(true);
        } catch (e) {
          console.error('Patient load failed:', e);
        } finally {
          setLoadingPatients(false);
        }
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setShowPatientList(false);
    }
  }, [patientSearch, selectedPatient]);

  const availableTests = TESTS_BY_CAT[form.testCategory] || [];

  const priorityColor = { Routine:'#34A853', Urgent:'#FBBC04', STAT:'#EA4335' };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
      <ScrollView style={{ flex:1, backgroundColor:colors.background }} keyboardShouldPersistTaps="always">
        <ScreenHeader title={isEdit ? 'Edit Lab Order' : 'Order Lab Test'} subtitle="Fill in test order details" onBack={onBack} />

        <View style={{ padding:24, zIndex: 1000 }}>
          <View style={{ zIndex: 2000 }}>
            {!selectedPatient ? (
              <Input 
                label="Search Patient" 
                placeholder="Type patient name or ID…" 
                value={patientSearch} 
                onChangeText={v => { setPatientSearch(v); set('patientId', v); }} 
                onFocus={async () => {
                  console.log('Focus triggered');
                  if (!selectedPatient) {
                    setLoadingPatients(true);
                    try {
                      const res = await patientService.getAll(patientSearch ? `?search=${encodeURIComponent(patientSearch)}` : '');
                      console.log('Focus API results:', res.patients?.length || 0);
                      setPatients(res.patients || []);
                      setShowPatientList(true);
                    } catch (e) {
                      console.error('Focus load failed:', e);
                    } finally {
                      setLoadingPatients(false);
                    }
                  }
                }}
                icon="🔍" 
              />
            ) : (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color:colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Selected Patient</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E1F5EE', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#00897B' }}>
                  <View>
                    <Text style={{ fontWeight: '700', color: '#085041' }}>{selectedPatient.name || selectedPatient.patientName}</Text>
                    <Text style={{ fontSize: 12, color: '#0F6E56' }}>ID: {selectedPatient._id}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { setSelectedPatient(null); setPatientSearch(''); set('patientId', ''); }}>
                    <Text style={{ color: '#EA4335', fontWeight: '700' }}>Change</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {showPatientList && (
              <View style={{ position: 'absolute', top: 80, left: 0, right: 0, zIndex: 3000, backgroundColor: colors.card, borderRadius: 12, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, borderWeight: 1, borderColor: colors.border }}>
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="always" style={{ maxHeight: 200 }}>
                  {patients.map(p => (
                    <TouchableOpacity 
                      key={p._id} 
                      onPress={() => {
                        console.log('Selected:', p.name || p.patientName);
                        setSelectedPatient(p);
                        set('patientId', p._id);
                        setPatientSearch(p.name || p.patientName);
                        setShowPatientList(false);
                      }}
                      style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border }}
                    >
                      <Text style={{ fontWeight: '700', color: colors.text }}>{p.name || p.patientName}</Text>
                      <Text style={{ fontSize: 12, color: colors.textSub }}>ID: {p._id} · Email: {p.email}</Text>
                    </TouchableOpacity>
                  ))}
                  {patients.length === 0 && !loadingPatients && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: colors.textMuted }}>No patients found</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
            {loadingPatients && <ActivityIndicator size="small" color="#00897B" style={{ marginTop: -10, marginBottom: 10 }} />}
          </View>

          {/* Priority */}
          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Priority Level</Text>
          <View style={{ flexDirection:'row', gap:10, marginBottom:18 }}>
            {PRIORITY_OPTS.map(p => {
              const pc = priorityColor[p];
              return (
                <TouchableOpacity key={p} onPress={() => set('priority', p)} style={{ flex:1, paddingVertical:12, borderRadius:12, alignItems:'center', backgroundColor:form.priority === p ? pc : colors.inputBg, borderWidth:1.5, borderColor:form.priority === p ? pc : colors.border }}>
                  <Text style={{ color:form.priority === p ? '#fff' : colors.textSub, fontWeight:'700', fontSize:13 }}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Category selector */}
          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Test Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} onPress={() => { set('testCategory', c); set('testName', ''); }} style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:20, marginRight:8, backgroundColor:form.testCategory === c ? '#00897B' : colors.inputBg, borderWidth:1.5, borderColor:form.testCategory === c ? '#00897B' : colors.border }}>
                <Text style={{ color:form.testCategory === c ? '#fff' : colors.textSub, fontWeight:'600', fontSize:13 }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Test name from category */}
          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Select Test</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:16 }}>
            {availableTests.map(t => (
              <TouchableOpacity key={t} onPress={() => set('testName', t)} style={{ paddingHorizontal:12, paddingVertical:8, borderRadius:10, backgroundColor:form.testName === t ? '#00897B' : colors.inputBg, borderWidth:1.5, borderColor:form.testName === t ? '#00897B' : colors.border }}>
                <Text style={{ color:form.testName === t ? '#fff' : colors.text, fontWeight:'600', fontSize:12 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input placeholder="Or type test name…" value={form.testName} onChangeText={v => set('testName', v)} icon="🧪" />

          {/* Sample type */}
          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Sample Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
            {SAMPLE_TYPES.map(s => (
              <TouchableOpacity key={s} onPress={() => set('sampleType', s)} style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:20, marginRight:8, backgroundColor:form.sampleType === s ? colors.primary : colors.inputBg, borderWidth:1.5, borderColor:form.sampleType === s ? colors.primary : colors.border }}>
                <Text style={{ color:form.sampleType === s ? '#fff' : colors.textSub, fontWeight:'600', fontSize:13 }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input label="Collection Date" placeholder="YYYY-MM-DD" value={form.collectionDate} onChangeText={v => set('collectionDate', v)} icon="📅" />
          <Input label="Clinical Notes" placeholder="Reason for test, symptoms…" value={form.notes} onChangeText={v => set('notes', v)} icon="📝" />

          {form.testName && (
            <Card style={{ backgroundColor:'#E1F5EE', borderWidth:1.5, borderColor:'#00897B' }}>
              <Text style={{ color:'#085041', fontWeight:'700', fontSize:14, marginBottom:8 }}>Order Summary</Text>
              <Text style={{ color:'#0F6E56', fontSize:13 }}>🧪 {form.testName}</Text>
              <Text style={{ color:'#0F6E56', fontSize:13 }}>📂 {form.testCategory}</Text>
              <Text style={{ color:'#0F6E56', fontSize:13 }}>💉 Sample: {form.sampleType}</Text>
              <Text style={{ color:priorityColor[form.priority], fontWeight:'700', fontSize:13 }}>⚡ Priority: {form.priority}</Text>
            </Card>
          )}

          <Button title={isEdit ? 'Save Changes' : 'Submit Lab Order'} onPress={() => onSave(form)} icon={isEdit ? '💾' : '🧪'} style={{ opacity: form.patientId && form.testName ? 1 : 0.45 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function OrderLabTestScreenWrapper(props) {
  return <ThemeProvider><OrderLabTestScreen {...props} /></ThemeProvider>;
}
export { OrderLabTestScreen };
