// PatientListScreen.js — FULLY API INTEGRATED
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { patientService } from '../../services/patientService';

function PatientListScreen({ onAdd, onSelect, onBack, role = 'Patient' }) {
  const { colors } = useTheme();
  const [patients, setPatients]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState('');
  const [gender, setGender]         = useState('All');
  const [ageGroup, setAgeGroup]     = useState('All');
  const [error, setError]           = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await patientService.getAll('');
      setPatients(res.patients || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const filteredPatients = useMemo(() => {
    let list = [...patients];
    if (gender !== 'All') {
      list = list.filter((p) => (p.gender || '').toLowerCase() === gender.toLowerCase());
    }
    if (ageGroup !== 'All') {
      list = list.filter((p) => {
        const age = Number(p.age || 0);
        if (ageGroup === '0-30') return age >= 0 && age <= 30;
        if (ageGroup === '31-60') return age >= 31 && age <= 60;
        if (ageGroup === '61+') return age >= 61;
        return true;
      });
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        (p.name || p.patientName || '').toLowerCase().includes(q) ||
        String(p.patientId || '').toLowerCase().includes(q) ||
        String(p.phone || '').toLowerCase().includes(q) ||
        String(p.email || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [patients, gender, ageGroup, search]);

  const deletePatient = (id) => Alert.alert('Delete Patient', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await patientService.delete(id); load(); }
      catch (e) { Alert.alert('Error', e.message); }
    }}
  ]);

  if (loading && !refreshing) return <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:colors.background }}><ActivityIndicator size="large" color={colors.primary} /><Text style={{ color:colors.textSub, marginTop:12 }}>Loading patients...</Text></View>;

  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <ScreenHeader title="Patients" subtitle={`${filteredPatients.length} patients`} onBack={onBack} />
      <View style={{ paddingHorizontal:20, paddingTop:12 }}>
        <View style={{ flexDirection:'row', alignItems:'center', backgroundColor:colors.inputBg, borderRadius:12, paddingHorizontal:14, borderWidth:1, borderColor:colors.border, marginBottom:12 }}>
          <Text style={{ fontSize:18, marginRight:8 }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search patients..." placeholderTextColor={colors.textMuted} style={{ flex:1, color:colors.text, paddingVertical:12, fontSize:15 }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:8 }}>
          {['All','Male','Female'].map(g => (
            <TouchableOpacity key={g} onPress={() => setGender(g)} style={{ paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:gender===g?colors.primary:colors.inputBg, marginRight:8, borderWidth:1.5, borderColor:gender===g?colors.primary:colors.border }}>
              <Text style={{ color:gender===g?'#fff':colors.textSub, fontWeight:'600', fontSize:13 }}>{g === 'All' ? 'All Genders' : g === 'Male' ? '👨 Male' : '👩 Female'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14 }}>
          {['All','0-30','31-60','61+'].map(a => (
            <TouchableOpacity key={a} onPress={() => setAgeGroup(a)} style={{ paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:ageGroup===a?colors.primary:colors.inputBg, marginRight:8, borderWidth:1.5, borderColor:ageGroup===a?colors.primary:colors.border }}>
              <Text style={{ color:ageGroup===a?'#fff':colors.textSub, fontWeight:'600', fontSize:13 }}>{a === 'All' ? 'All Ages' : `Age ${a}`}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:40 }}>
          <Text style={{ fontSize:40 }}>⚠️</Text>
          <Text style={{ color:'#EA4335', fontSize:14, marginTop:8, textAlign:'center' }}>{error}</Text>
          <TouchableOpacity onPress={load} style={{ marginTop:16, backgroundColor:colors.primary, borderRadius:10, paddingHorizontal:24, paddingVertical:10 }}>
            <Text style={{ color:'#fff', fontWeight:'700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={p => p._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />}
          contentContainerStyle={{ paddingHorizontal:20, paddingBottom:100 }}
          renderItem={({ item:p }) => (
            <TouchableOpacity onPress={() => onSelect?.(p)}>
              <Card>
                <View style={{ flexDirection:'row', alignItems:'center' }}>
                  <View style={{ width:44, height:44, borderRadius:22, backgroundColor:p.gender==='Female'?'#FCE7F3':'#EFF6FF', alignItems:'center', justifyContent:'center', marginRight:12 }}>
                    <Text style={{ fontSize:22 }}>{p.gender==='Female'?'👩':'👨'}</Text>
                  </View>
                  <View style={{ flex:1 }}>
                    <Text style={{ color:colors.text, fontWeight:'700', fontSize:15 }}>{p.name || p.patientName}</Text>
                    <Text style={{ color:colors.textSub, fontSize:13 }}>Age {p.age} · {p.gender} · 🩸 {p.bloodGroup || 'N/A'}</Text>
                    <Text style={{ color:colors.textMuted, fontSize:12 }}>{p.phone} · {p.patientId}</Text>
                  </View>
                  <View style={{ alignItems:'flex-end', gap:4 }}>
                    <Text style={{ color:colors.textSub, fontSize:12 }}>🏥 {p.visitCount || 0} visits</Text>
                    {role === 'Admin' && (
                      <TouchableOpacity onPress={() => deletePatient(p._id)} style={{ backgroundColor:'#EA433520', borderRadius:6, paddingHorizontal:8, paddingVertical:3 }}>
                        <Text style={{ color:'#EA4335', fontSize:11, fontWeight:'600' }}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {p.chronicDiseases?.length > 0 && (
                  <View style={{ flexDirection:'row', gap:6, marginTop:8, paddingTop:8, borderTopWidth:1, borderTopColor:colors.border, flexWrap:'wrap' }}>
                    {p.chronicDiseases.slice(0,3).map(d => <Badge key={d} label={d} color="#EA4335" />)}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={{ alignItems:'center', paddingTop:60 }}><Text style={{ fontSize:48 }}>🧑‍🤝‍🧑</Text><Text style={{ color:colors.textSub, marginTop:12 }}>No patients found</Text></View>}
        />
      )}
      {role === 'Admin' && (
        <TouchableOpacity onPress={onAdd} style={{ position:'absolute', bottom:30, right:24, backgroundColor:colors.primary, borderRadius:28, width:56, height:56, alignItems:'center', justifyContent:'center', elevation:6 }}>
          <Text style={{ color:'#fff', fontSize:28, lineHeight:32 }}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
export default function PatientListScreenWrapper(p) { return <ThemeProvider><PatientListScreen {...p} /></ThemeProvider>; }
export { PatientListScreen };
