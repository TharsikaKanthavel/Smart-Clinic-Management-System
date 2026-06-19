// BillingListScreen.js — FULLY API INTEGRATED
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, RefreshControl, Alert, Platform } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { billingService } from '../../services/otherServices';

function BillingListScreen({ user, currentPatient, onAdd, onSelect, onBack, onAnalytics }) {
  const { colors } = useTheme();
  
  const STATUS_COLOR = { 
    Paid: colors.success, 
    Partial: colors.warning, 
    Unpaid: colors.danger, 
    Overdue: '#C62828',
    Cancelled: colors.textMuted
  };
  const STATUS_ICON  = { Paid:'✅', Partial:'⏳', Unpaid:'❌', Overdue:'🚨', Cancelled:'🚫' };

  const [bills, setBills]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState('All');
  const [search, setSearch]         = useState('');
  const [error, setError]           = useState(null);
  const isManagement = user?.role === 'Admin' || user?.role === 'Staff' || user?.role === 'Doctor';
  const FILTERS = ['All','Paid','Partial','Unpaid','Overdue','Cancelled'];

  const load = useCallback(async () => {
    // If user is a patient but currentPatient isn't loaded yet, don't load bills
    if (user?.role === 'Patient' && !currentPatient) return;

    try {
      setError(null);
      const params = [];
      if (filter !== 'All') params.push(`paymentStatus=${filter}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      
      // If patient, STRICTLY restrict to their own ID
      if (user?.role === 'Patient' && currentPatient?._id) {
        params.push(`patientId=${currentPatient._id}`);
      }

      const res = await billingService.getAll(params.length ? `?${params.join('&')}` : '');
      setBills(res.bills || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filter, search, isManagement, currentPatient?._id]);

  useEffect(() => { 
    // Only show full loader on initial mount or when filter changes
    // Avoid showing it on every keystroke in search
    if (!bills.length) setLoading(true); 
    load(); 
  }, [load]);

  const autoOverdue = async () => {
    try { const r = await billingService.autoOverdue(); Alert.alert('Done', r.message); load(); }
    catch (e) { Alert.alert('Error', e.message); }
  };

  const deleteBill = (id) => {
    const performDelete = async () => {
      try {
        await billingService.delete(id);
        load();
      } catch (e) {
        if (Platform.OS === 'web') alert('Error: ' + e.message);
        else Alert.alert('Error', e.message);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this bill?')) {
        performDelete();
      }
    } else {
      Alert.alert('Delete Bill', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const totalRevenue = bills.filter(b => b.paymentStatus === 'Paid').reduce((s, b) => s + (b.paidAmount || 0), 0);
  const totalPending = bills.filter(b => b.paymentStatus !== 'Paid').reduce((s, b) => s + (b.balanceDue || 0), 0);

  if (loading && !refreshing) return <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:colors.background }}><ActivityIndicator size="large" color={colors.primary} /><Text style={{ color:colors.textSub, marginTop:12 }}>Loading bills...</Text></View>;

  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <View style={{ backgroundColor:colors.primary, paddingTop:56, paddingBottom:24, paddingHorizontal:24, borderBottomLeftRadius:24, borderBottomRightRadius:24 }}>
        {onBack && <TouchableOpacity onPress={onBack}><Text style={{ color:'rgba(255,255,255,0.8)', marginBottom:10 }}>← Back</Text></TouchableOpacity>}
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
          <View><Text style={{ color:'#fff', fontSize:22, fontWeight:'800' }}>{isManagement ? 'Billing Management' : 'My Invoices'}</Text><Text style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>{bills.length} invoices</Text></View>
          {isManagement && (
            <View style={{ flexDirection:'row', gap:8 }}>
              <TouchableOpacity onPress={autoOverdue} style={{ backgroundColor:'rgba(255,255,255,0.2)', borderRadius:10, paddingHorizontal:10, paddingVertical:7 }}>
                <Text style={{ color:'#fff', fontWeight:'700', fontSize:12 }}>⏰ Overdue</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onAnalytics} style={{ backgroundColor:'rgba(255,255,255,0.2)', borderRadius:10, paddingHorizontal:12, paddingVertical:7 }}>
                <Text style={{ color:'#fff', fontWeight:'700', fontSize:13 }}>📊 Stats</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={{ flexDirection:'row', gap:10, marginTop:14, backgroundColor:'rgba(255,255,255,0.14)', borderRadius:14, padding:12 }}>
          {[{ icon:'💰', label: isManagement ? 'Total Revenue' : 'Total Paid', value:`Rs.${totalRevenue.toLocaleString()}`, color:'#fff' },
            { icon:'⏳', label: isManagement ? 'Pending Collections' : 'Outstanding', value:`Rs.${totalPending.toLocaleString()}`, color:'#FFF9C4' }].map(s => (
            <View key={s.label} style={{ flex:1, alignItems:'center' }}>
              <Text style={{ fontSize:16 }}>{s.icon}</Text>
              <Text style={{ color:s.color, fontWeight:'800', fontSize:14, marginTop:2 }}>{s.value}</Text>
              <Text style={{ color:'rgba(255,255,255,0.6)', fontSize:10 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal:20, paddingTop:14 }}>
        <View style={{ flexDirection:'row', alignItems:'center', backgroundColor:colors.inputBg, borderRadius:12, paddingHorizontal:14, borderWidth:1, borderColor:colors.border, marginBottom:12 }}>
          <Text style={{ fontSize:18, marginRight:8 }}>🔍</Text>
          <TextInput value={search} onChangeText={setSearch} placeholder={isManagement ? "Search by patient or bill ID..." : "Search invoices..."} placeholderTextColor={colors.textMuted} style={{ flex:1, color:colors.text, paddingVertical:12, fontSize:15 }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:14 }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{ paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:filter===f?colors.primary:colors.inputBg, marginRight:8, borderWidth:1.5, borderColor:filter===f?colors.primary:colors.border }}>
              <Text style={{ color:filter===f?'#fff':colors.textSub, fontWeight:'600', fontSize:13 }}>{f}</Text>
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
          data={bills}
          keyExtractor={b => b._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />}
          contentContainerStyle={{ paddingHorizontal:20, paddingBottom:100 }}
          renderItem={({ item:b }) => {
            const sc = STATUS_COLOR[b.paymentStatus] || '#888';
            const si = STATUS_ICON[b.paymentStatus]  || '❓';
            const patient = b.patientId?.patientName || b.patientId?.name || 'Unknown';
            const doctor  = b.doctorId?.name  || '';
            return (
              <TouchableOpacity onPress={() => onSelect?.(b)}>
                <Card style={{ borderLeftWidth:4, borderLeftColor:sc }}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <View style={{ flex:1 }}>
                      <Text style={{ color:colors.text, fontWeight:'700', fontSize:15 }}>{isManagement ? patient : (b.billId || 'Invoice')}</Text>
                      {isManagement && doctor ? <Text style={{ color:colors.textSub, fontSize:12 }}>👨‍⚕️ {doctor}</Text> : null}
                      <Text style={{ color:colors.textMuted, fontSize:11 }}>{b.invoiceDate ? new Date(b.invoiceDate).toLocaleDateString() : 'No Date'}</Text>
                    </View>
                    <View style={{ alignItems:'flex-end', gap:4 }}>
                      <Text style={{ color:colors.text, fontWeight:'800', fontSize:16 }}>Rs.{(b.totalAmount||0).toLocaleString()}</Text>
                      <Badge label={`${si} ${b.paymentStatus}`} color={sc} />
                      {(b.balanceDue||0) > 0 && <Text style={{ color:sc, fontSize:11, fontWeight:'600' }}>Due: Rs.{(b.balanceDue||0).toLocaleString()}</Text>}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                    {b.insuranceClaim && <Badge label="🛡️ Insurance" color="#1A73E8" />}
                    {(b.discount || 0) > 0 && <Badge label={`🏷️ Rs.${b.discount} off`} color="#00897B" />}
                    {isManagement && b.evidenceStatus === 'Pending' && <Badge label="🔍 Review Needed" color="#F57F17" />}
                    {isManagement && (
                      <TouchableOpacity onPress={(e) => { e.stopPropagation(); deleteBill(b._id); }} style={{ marginLeft: 'auto', backgroundColor: '#EA433520', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: '#EA4335', fontSize: 11, fontWeight: '600' }}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<View style={{ alignItems:'center', paddingTop:60 }}><Text style={{ fontSize:48 }}>💰</Text><Text style={{ color:colors.textSub, marginTop:12 }}>No bills found</Text></View>}
        />
      )}
      {isManagement && (
        <TouchableOpacity onPress={onAdd} style={{ position:'absolute', bottom:30, right:24, backgroundColor:colors.primary, borderRadius:28, width:56, height:56, alignItems:'center', justifyContent:'center', elevation:6 }}>
          <Text style={{ color:'#fff', fontSize:28, lineHeight:32 }}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
export default BillingListScreen;
export { BillingListScreen };
