// DoctorListScreen.js — FULLY API INTEGRATED
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { doctorService } from '../../services/doctorService';

const STATUS_COLOR = { Active:'#34A853', Inactive:'#EA4335', 'On Leave':'#FBBC04' };

function DoctorListScreen({ onAdd, onSelect, onBack }) {
  const { colors } = useTheme();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [specs, setSpecs] = useState(['All']);
  const [error, setError] = useState(null);

  const loadDoctors = useCallback(async () => {
    try {
      setError(null);
      const res = await doctorService.getAll('');
      setDoctors(res.doctors || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    doctorService.getSpecializations().then(r => setSpecs(['All', ...(r.specializations || [])])).catch(() => {});
  }, []);

  useEffect(() => { setLoading(true); loadDoctors(); }, [loadDoctors]);

  const filteredDoctors = useMemo(() => {
    let list = [...doctors];
    if (filter !== 'All') {
      list = list.filter((d) => (d.specialization || '').toLowerCase() === filter.toLowerCase());
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((d) =>
        (d.name || d.doctorName || '').toLowerCase().includes(q) ||
        (d.specialization || '').toLowerCase().includes(q) ||
        (d.department || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [doctors, filter, search]);

  const deleteDoctor = (id) => Alert.alert('Delete Doctor', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await doctorService.delete(id); loadDoctors(); Alert.alert('Success', 'Doctor deleted.'); }
      catch (e) { Alert.alert('Error', e.message); }
    }}
  ]);

  const toggleStatus = async (doc) => {
    try {
      await doctorService.updateStatus(doc._id, { status: doc.status === 'Active' ? 'Inactive' : 'Active' });
      loadDoctors();
    } catch (e) { Alert.alert('Error', e.message); }
  };

  if (loading && !refreshing) return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color:colors.textSub, marginTop:12, fontSize:14 }}>Loading doctors...</Text>
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <ScreenHeader title="Doctors" subtitle={`${filteredDoctors.length} doctors`} onBack={onBack} />
      <View style={{ paddingHorizontal:20, paddingTop:12 }}>
        <View style={{ flexDirection:'row', alignItems:'center', backgroundColor:colors.inputBg, borderRadius:12, paddingHorizontal:14, borderWidth:1, borderColor:colors.border, marginBottom:12 }}>
          <Text style={{ fontSize:18, marginRight:8 }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search doctors..." placeholderTextColor={colors.textMuted} style={{ flex:1, color:colors.text, paddingVertical:12, fontSize:15 }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14 }}>
          {specs.map(s => (
            <TouchableOpacity key={s} onPress={() => setFilter(s)} style={{ paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:filter===s ? colors.primary : colors.inputBg, marginRight:8, borderWidth:1.5, borderColor:filter===s ? colors.primary : colors.border }}>
              <Text style={{ color:filter===s ? '#fff' : colors.textSub, fontWeight:'600', fontSize:13 }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:40 }}>
          <Text style={{ fontSize:40 }}>⚠️</Text>
          <Text style={{ color:'#EA4335', fontSize:14, marginTop:8, textAlign:'center' }}>{error}</Text>
          <TouchableOpacity onPress={loadDoctors} style={{ marginTop:16, backgroundColor:colors.primary, borderRadius:10, paddingHorizontal:24, paddingVertical:10 }}>
            <Text style={{ color:'#fff', fontWeight:'700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={d => d._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDoctors(); }} colors={[colors.primary]} />}
          contentContainerStyle={{ paddingHorizontal:20, paddingBottom:100 }}
          renderItem={({ item:d }) => {
            const sc = STATUS_COLOR[d.status] || '#888';
            return (
              <TouchableOpacity onPress={() => onSelect?.(d)}>
                <Card style={{ borderLeftWidth:4, borderLeftColor:sc }}>
                  <View style={{ flexDirection:'row', alignItems:'flex-start' }}>
                    <View style={{ width:48, height:48, borderRadius:24, backgroundColor:colors.primaryLight||'#E6F1FB', alignItems:'center', justifyContent:'center', marginRight:12 }}>
                      <Text style={{ fontSize:22 }}>👨‍⚕️</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={{ color:colors.text, fontWeight:'700', fontSize:15 }}>{d.name || d.doctorName}</Text>
                      <Text style={{ color:colors.primary, fontWeight:'600', fontSize:13 }}>{d.specialization}</Text>
                      <Text style={{ color:colors.textSub, fontSize:12 }}>{d.qualification} · {d.experienceYears || d.experience} yrs exp</Text>
                    </View>
                    <View style={{ alignItems:'flex-end', gap:4 }}>
                      <Badge label={d.status || 'Active'} color={sc} />
                      <Text style={{ color:colors.textSub, fontSize:12 }}>⭐ {(d.rating || 0).toFixed(1)}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection:'row', gap:8, marginTop:10, paddingTop:8, borderTopWidth:1, borderTopColor:colors.border, flexWrap:'wrap' }}>
                    <Text style={{ color:colors.textSub, fontSize:12 }}>💰 Rs.{d.consultationFee}</Text>
                    <Text style={{ color:colors.textSub, fontSize:12 }}>📞 {d.phone}</Text>
                    <Text style={{ color:colors.textSub, fontSize:12 }}>🩺 {d.consultationMode || 'Both'}</Text>
                    <View style={{ flexDirection:'row', gap:6, marginLeft:'auto' }}>
                      <TouchableOpacity onPress={() => toggleStatus(d)} style={{ backgroundColor:d.status==='Active'?'#EA433520':'#34A85320', borderRadius:6, paddingHorizontal:8, paddingVertical:3 }}>
                        <Text style={{ color:d.status==='Active'?'#EA4335':'#34A853', fontSize:11, fontWeight:'600' }}>{d.status==='Active'?'Disable':'Enable'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteDoctor(d._id)} style={{ backgroundColor:'#EA433520', borderRadius:6, paddingHorizontal:8, paddingVertical:3 }}>
                        <Text style={{ color:'#EA4335', fontSize:11, fontWeight:'600' }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<View style={{ alignItems:'center', paddingTop:60 }}><Text style={{ fontSize:48 }}>👨‍⚕️</Text><Text style={{ color:colors.textSub, marginTop:12 }}>No doctors found</Text></View>}
        />
      )}
      <TouchableOpacity onPress={onAdd} style={{ position:'absolute', bottom:30, right:24, backgroundColor:colors.primary, borderRadius:28, width:56, height:56, alignItems:'center', justifyContent:'center', elevation:6 }}>
        <Text style={{ color:'#fff', fontSize:28, lineHeight:32 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
export default function DoctorListScreenWrapper(p) { return <ThemeProvider><DoctorListScreen {...p} /></ThemeProvider>; }
export { DoctorListScreen };
