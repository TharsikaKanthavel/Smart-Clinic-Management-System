// LabTestListScreen.js — FULLY API INTEGRATED
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { labTestService } from '../../services/otherServices';

const STATUS_COLOR = { Completed:'#34A853', Pending:'#FBBC04', Processing:'#1A73E8', Cancelled:'#EA4335' };
const RESULT_COLOR = { Normal:'#34A853', High:'#EA4335', Low:'#FBBC04', Abnormal:'#C62828', Pending:'#94A3B8', Processing:'#1A73E8' };

function LabTestListScreen({ role, user, currentPatient, onAdd, onSelect, onBack, onAnalytics, onMarkCompleted, onDelete, refreshKey }) {
  const { colors } = useTheme();
  const [tests, setTests]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('All');
  const [catFilter, setCat]         = useState('All');
  const [error, setError]           = useState(null);
  const STATUS_FILTERS = ['All','Pending','Processing','Completed','Cancelled'];
  const CATS = ['All','Haematology','Biochemistry','Radiology','Immunology','Neurology','Microbiology'];

  const [initialLoading, setInitialLoading] = useState(true);

  const isPatient = role === 'Patient';

  const load = useCallback(async (isInitial = false) => {
    try {
      setError(null);
      if (isInitial) setInitialLoading(true);
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter !== 'All') params.push(`status=${statusFilter}`);
      if (catFilter !== 'All') params.push(`category=${encodeURIComponent(catFilter)}`);
      
      // Patient Filter
      if (isPatient) {
        const pId = currentPatient?._id || '';
        if (pId) params.push(`patientId=${pId}`);
      }

      const res = await labTestService.getAll(params.length ? `?${params.join('&')}` : '');
      setTests(res.tests || []);
    } catch (e) { setError(e.message); }
    finally { 
      setLoading(false); 
      setRefreshing(false); 
      setInitialLoading(false); 
    }
  }, [search, statusFilter, catFilter, isPatient, currentPatient?._id]);

  useEffect(() => { load(true); }, [refreshKey]); // Initial load and refresh trigger
  useEffect(() => { load(); }, [search, statusFilter, catFilter, refreshKey]); // Search/Filter/Refresh updates

  const deleteTest = (id) => {
    const perform = async () => {
      try {
        await labTestService.delete(id);
        load();
      } catch (e) {
        if (Platform.OS === 'web') alert('Error: ' + e.message);
        else Alert.alert('Error', e.message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this lab test?')) perform();
    } else {
      Alert.alert('Delete Lab Test', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: perform }
      ]);
    }
  };

  const criticalCount = tests.filter(t => t.criticalFlag).length;

  if (initialLoading && !refreshing) return <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:colors.background }}><ActivityIndicator size="large" color="#00897B" /><Text style={{ color:colors.textSub, marginTop:12 }}>Loading lab tests...</Text></View>;

  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <View style={{ backgroundColor:'#00897B', paddingTop:56, paddingBottom:24, paddingHorizontal:24, borderBottomLeftRadius:24, borderBottomRightRadius:24 }}>
        {onBack && <TouchableOpacity onPress={onBack}><Text style={{ color:'rgba(255,255,255,0.8)', marginBottom:10 }}>← Back</Text></TouchableOpacity>}
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
          <View><Text style={{ color:'#fff', fontSize:22, fontWeight:'800' }}>Lab Tests</Text><Text style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>{tests.length} orders</Text></View>
          {!isPatient && (
            <TouchableOpacity onPress={onAnalytics} style={{ backgroundColor:'rgba(255,255,255,0.2)', borderRadius:10, paddingHorizontal:12, paddingVertical:7 }}>
              <Text style={{ color:'#fff', fontWeight:'700', fontSize:13 }}>📊 Analytics</Text>
            </TouchableOpacity>
          )}
        </View>
        {criticalCount > 0 && !isPatient && (
          <View style={{ marginTop:12, backgroundColor:'rgba(198,40,40,0.3)', borderRadius:10, padding:10, flexDirection:'row', alignItems:'center', gap:8 }}>
            <Text style={{ fontSize:16 }}>🚨</Text>
            <Text style={{ color:'#fff', fontWeight:'700', fontSize:13 }}>{criticalCount} critical result{criticalCount>1?'s':''} — immediate attention required</Text>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal:20, paddingTop:14 }}>
        <View style={{ flexDirection:'row', alignItems:'center', backgroundColor:colors.inputBg, borderRadius:12, paddingHorizontal:14, borderWidth:1, borderColor:colors.border, marginBottom:12 }}>
          <Text style={{ fontSize:18, marginRight:8 }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by patient, test or ID..." placeholderTextColor={colors.textMuted} style={{ flex:1, color:colors.text, paddingVertical:12, fontSize:15 }} />
          {loading && <ActivityIndicator size="small" color="#00897B" />}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:8 }}>
          {STATUS_FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setStatus(f)} style={{ paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:statusFilter===f?'#00897B':colors.inputBg, marginRight:8, borderWidth:1.5, borderColor:statusFilter===f?'#00897B':colors.border }}>
              <Text style={{ color:statusFilter===f?'#fff':colors.textSub, fontWeight:'600', fontSize:13 }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14 }}>
          {CATS.map(c => (
            <TouchableOpacity key={c} onPress={() => setCat(c)} style={{ paddingHorizontal:14, paddingVertical:6, borderRadius:20, backgroundColor:catFilter===c?'#E1F5EE':colors.inputBg, marginRight:8, borderWidth:1.5, borderColor:catFilter===c?'#00897B':colors.border }}>
              <Text style={{ color:catFilter===c?'#085041':colors.textSub, fontWeight:'600', fontSize:12 }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:40 }}>
          <Text style={{ fontSize:40 }}>⚠️</Text>
          <Text style={{ color:'#EA4335', fontSize:14, marginTop:8, textAlign:'center' }}>{error}</Text>
          <TouchableOpacity onPress={load} style={{ marginTop:16, backgroundColor:'#00897B', borderRadius:10, paddingHorizontal:24, paddingVertical:10 }}>
            <Text style={{ color:'#fff', fontWeight:'700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tests}
          keyExtractor={t => t._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={['#00897B']} />}
          contentContainerStyle={{ paddingHorizontal:20, paddingBottom:100 }}
          renderItem={({ item:t }) => {
            const sc = STATUS_COLOR[t.status] || '#888';
            const rc = RESULT_COLOR[t.resultStatus] || '#888';
            const patient = t.patientId?.name || t.patientId?.patientName || 'Unknown';
            const doctor  = t.doctorId?.name  || t.doctorId?.doctorName || 'Unknown';
            return (
              <TouchableOpacity onPress={() => onSelect?.(t)}>
                <Card style={{ borderLeftWidth:4, borderLeftColor:sc }}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <View style={{ flex:1 }}>
                      <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
                        <Text style={{ color:colors.text, fontWeight:'700', fontSize:15 }}>{t.testName}</Text>
                        {t.criticalFlag && <Text style={{ fontSize:14 }}>🚨</Text>}
                      </View>
                      <Text style={{ color:'#00897B', fontWeight:'600', fontSize:12 }}>{t.testCategory} · {t.sampleType}</Text>
                      <Text style={{ color:colors.textSub, fontSize:12 }}>👤 {patient} · 👨‍⚕️ {doctor}</Text>
                      <Text style={{ color:colors.textMuted, fontSize:11 }}>{t.labTestId} · {t.priority}</Text>
                    </View>
                    <View style={{ alignItems:'flex-end', gap:4 }}>
                      <Badge label={t.status} color={sc} />
                      {t.status === 'Completed' && <Badge label={t.resultStatus || 'N/A'} color={rc} />}
                      {!isPatient && (
                        <TouchableOpacity onPress={() => onDelete(t._id)} style={{ backgroundColor:'#EA433520', borderRadius:6, paddingHorizontal:8, paddingVertical:3, marginTop:2 }}>
                          <Text style={{ color:'#EA4335', fontSize:11, fontWeight:'600' }}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', gap:8, marginTop:8, paddingTop:8, borderTopWidth:1, borderTopColor:colors.border }}>
                    <View style={{ flexDirection:'row', gap:8 }}>
                      {t.testedAt && <Text style={{ color:colors.textSub, fontSize:12 }}>📅 {new Date(t.testedAt).toLocaleDateString()}</Text>}
                      {t.reportFile && <Badge label="📄 Report Submitted" color="#1A73E8" />}
                    </View>
                    {isPatient && t.status !== 'Completed' && (
                      <TouchableOpacity onPress={() => onMarkCompleted(t)} style={{ backgroundColor:'#00897B', borderRadius:6, paddingHorizontal:10, paddingVertical:4 }}>
                        <Text style={{ color:'#fff', fontSize:12, fontWeight:'700' }}>Mark Completed</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<View style={{ alignItems:'center', paddingTop:60 }}><Text style={{ fontSize:48 }}>🧪</Text><Text style={{ color:colors.textSub, marginTop:12 }}>No lab tests found</Text></View>}
        />
      )}
      {!isPatient && (
        <TouchableOpacity onPress={onAdd} style={{ position:'absolute', bottom:30, right:24, backgroundColor:'#00897B', borderRadius:28, width:56, height:56, alignItems:'center', justifyContent:'center', elevation:6 }}>
          <Text style={{ color:'#fff', fontSize:28, lineHeight:32 }}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
export default function LabTestListScreenWrapper(p) { return <ThemeProvider><LabTestListScreen {...p} /></ThemeProvider>; }
export { LabTestListScreen };
