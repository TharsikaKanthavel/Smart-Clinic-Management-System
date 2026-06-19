import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Switch, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, Card, ScreenHeader } from '../Section0_SharedTheme/theme';
import { patientService } from '../../services/patientService';

const SERVICES = ['Consultation Fee','Blood Test','Urine Analysis','X-Ray','MRI Scan','ECG','Ultrasound','Medication','Vaccination','Wound Dressing','Physiotherapy'];
const PAYMENT_METHODS = ['Cash','Card','Bank Transfer','Insurance','Online Payment'];

function CreateInvoiceScreen({ invoice, onBack, onSave }) {
  const { colors } = useTheme();
  const isEdit = !!invoice;
  const [form, setForm] = useState(invoice || {
    patientId:'', patientName:'', 
    discount:'', insuranceClaim:false, paymentMethod:'Cash', notes:'',
    items:[{ desc:'Consultation Fee', amount:'' }],
  });
  
  const [search, setSearch] = useState(invoice?.patientId?.patientName || invoice?.patientName || '');
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (search.length > 0 && !form.patientId) {
      const delay = setTimeout(async () => {
        setLoadingPatients(true);
        try {
          const res = await patientService.getAll(`?search=${encodeURIComponent(search)}`);
          setPatients(res.patients || []);
          setShowResults(true);
        } catch (e) { console.error(e); }
        finally { setLoadingPatients(false); }
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setShowResults(false);
    }
  }, [search, form.patientId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const selectPatient = (p) => {
    setForm(f => ({ ...f, patientId: p._id, patientName: p.patientName || p.name }));
    setSearch(p.patientName || p.name);
    setShowResults(false);
  };

  const addItem    = () => setForm(f => ({ ...f, items:[...f.items, { desc:'', amount:'' }] }));
  const removeItem = i  => setForm(f => ({ ...f, items:f.items.filter((_,idx) => idx !== i) }));
  const updItem    = (i, k, v) => setForm(f => { const items=[...f.items]; items[i]={...items[i],[k]:v}; return {...f,items}; });

  const subtotal = form.items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
  const discount = parseFloat(form.discount) || 0;
  const total    = Math.max(0, subtotal - discount);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
      <ScrollView style={{ flex:1, backgroundColor:colors.background }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={isEdit ? 'Edit Invoice' : 'Create Invoice'} subtitle="Enter billing details" onBack={onBack} />

        <View style={{ padding:24 }}>
          <View style={{ zIndex: 5000, elevation: 5 }}>
            <Input 
              label="Select Patient" 
              placeholder="Start typing patient name..." 
              value={search} 
              onChangeText={v => { setSearch(v); if (form.patientId) set('patientId', ''); }} 
              icon="🧑‍🤝‍🧑" 
            />
            
            {form.patientId ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -8, marginBottom: 12, marginLeft: 4 }}>
                <Text style={{ color: colors.success, fontSize: 13, fontWeight: '700' }}>✅ {form.patientName}</Text>
                <TouchableOpacity onPress={() => { set('patientId', ''); set('patientName', ''); setSearch(''); }} style={{ marginLeft: 12 }}>
                   <Text style={{ color: colors.danger, fontSize: 12, textDecorationLine: 'underline' }}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {loadingPatients && <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 10 }} />}
            
            {showResults && !form.patientId && (
              <Card style={{ position:'absolute', top:85, left:0, right:0, zIndex: 9999, elevation: 10, padding: 8, maxHeight: 250 }}>
                <ScrollView nestedScrollEnabled scrollEventThrottle={16}>
                  {patients.length > 0 ? patients.map(p => (
                    <TouchableOpacity key={p._id} onPress={() => selectPatient(p)} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View>
                        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{p.patientName || p.name}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>ID: {p.patientId || 'N/A'}</Text>
                      </View>
                      <Text style={{ color: colors.primary, fontSize: 18 }}>→</Text>
                    </TouchableOpacity>
                  )) : (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: colors.textMuted }}>No patients match "{search}"</Text>
                    </View>
                  )}
                </ScrollView>
              </Card>
            )}
          </View>

          {/* Line Items */}
          <Text style={{ color:colors.text, fontWeight:'700', fontSize:16, marginBottom:12 }}>Invoice Items</Text>
          {form.items.map((item, i) => (
            <Card key={i} style={{ borderLeftWidth:3, borderLeftColor:colors.primary }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <Text style={{ color:colors.text, fontWeight:'700' }}>Item #{i + 1}</Text>
                {form.items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(i)}>
                    <Text style={{ color:colors.danger, fontWeight:'700', fontSize:13 }}>✕ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Service quick-select */}
              <Text style={{ color:colors.textSub, fontSize:12, fontWeight:'600', marginBottom:6 }}>Quick select service</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:10 }}>
                {SERVICES.map(s => (
                  <TouchableOpacity key={s} onPress={() => updItem(i, 'desc', s)} style={{ paddingHorizontal:10, paddingVertical:5, borderRadius:20, marginRight:6, backgroundColor:item.desc === s ? colors.primary : colors.inputBg, borderWidth:1.5, borderColor:item.desc === s ? colors.primary : colors.border }}>
                    <Text style={{ color:item.desc === s ? '#fff' : colors.textSub, fontWeight:'600', fontSize:11 }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Input placeholder="Or type description…" value={item.desc}   onChangeText={v => updItem(i,'desc',v)}   icon="📋" />
              <Input placeholder="Amount (Rs.)"         value={item.amount} onChangeText={v => updItem(i,'amount',v)} icon="💰" keyboardType="numeric" />
            </Card>
          ))}

          <Button title="+ Add Another Item" onPress={addItem} variant="outline" icon="➕" style={{ marginBottom:20 }} />

          <Input label="Discount (Rs.)" placeholder="e.g. 500" value={form.discount} onChangeText={v => set('discount', v)} icon="🏷️" keyboardType="numeric" />

          {/* Payment method */}
          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Payment Method</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
            {PAYMENT_METHODS.map(m => (
              <TouchableOpacity key={m} onPress={() => set('paymentMethod', m)} style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:20, marginRight:8, backgroundColor:form.paymentMethod === m ? colors.primary : colors.inputBg, borderWidth:1.5, borderColor:form.paymentMethod === m ? colors.primary : colors.border }}>
                <Text style={{ color:form.paymentMethod === m ? '#fff' : colors.textSub, fontWeight:'600', fontSize:13 }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Insurance toggle */}
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:colors.inputBg, borderRadius:12, padding:16, marginBottom:16, borderWidth:1, borderColor:colors.border }}>
            <View>
              <Text style={{ color:colors.text, fontWeight:'600' }}>🛡️ File Insurance Claim</Text>
              <Text style={{ color:colors.textMuted, fontSize:12 }}>Mark this bill for insurance processing</Text>
            </View>
            <Switch value={form.insuranceClaim} onValueChange={v => set('insuranceClaim', v)} trackColor={{ false:colors.border, true:colors.primary }} />
          </View>

          <Input label="Notes" placeholder="Additional billing notes…" value={form.notes} onChangeText={v => set('notes', v)} icon="📝" />

          {/* Total preview */}
          <Card style={{ backgroundColor:colors.primaryLight + '88', borderWidth:1.5, borderColor:colors.primary }}>
            <Text style={{ color:colors.primary, fontWeight:'700', fontSize:14, marginBottom:10 }}>Invoice Summary</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
              <Text style={{ color:colors.textSub, fontSize:13 }}>Subtotal</Text>
              <Text style={{ color:colors.text, fontWeight:'600' }}>Rs.{subtotal.toLocaleString()}</Text>
            </View>
            {discount > 0 && (
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
                <Text style={{ color:colors.textSub, fontSize:13 }}>Discount</Text>
                <Text style={{ color:'#00897B', fontWeight:'600' }}>- Rs.{discount.toLocaleString()}</Text>
              </View>
            )}
            <View style={{ flexDirection:'row', justifyContent:'space-between', paddingTop:8, borderTopWidth:1, borderTopColor:colors.primary + '44' }}>
              <Text style={{ color:colors.primary, fontWeight:'800', fontSize:16 }}>Total</Text>
              <Text style={{ color:colors.primary, fontWeight:'900', fontSize:20 }}>Rs.{total.toLocaleString()}</Text>
            </View>
          </Card>

          <Button title={isEdit ? 'Save Changes' : 'Create Invoice'} onPress={() => onSave(form)} icon={isEdit ? '💾' : '🧾'} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function CreateInvoiceScreenWrapper(props) {
  return <ThemeProvider><CreateInvoiceScreen {...props} /></ThemeProvider>;
}
export { CreateInvoiceScreen };
