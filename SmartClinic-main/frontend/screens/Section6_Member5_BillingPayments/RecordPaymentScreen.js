// RecordPaymentScreen.js — real API call
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { billingService } from '../../services/otherServices';

const METHODS = [
  { key:'Cash', icon:'💵' }, { key:'Card', icon:'💳' },
  { key:'Bank Transfer', icon:'🏦' }, { key:'Insurance', icon:'🛡️' }, { key:'Online Payment', icon:'📱' },
];
const STATUS_COLOR = { Paid:'#34A853', Partial:'#FBBC04', Unpaid:'#EA4335', Overdue:'#C62828' };

function RecordPaymentScreen({ bill, onBack, onSave }) {
  const { colors } = useTheme();
  if (!bill) return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:colors.background }}>
      <Text style={{ fontSize:40 }}>💰</Text>
      <Text style={{ color:colors.textSub, marginTop:12 }}>No bill selected</Text>
      <TouchableOpacity onPress={onBack} style={{ marginTop:20, backgroundColor:colors.primary, borderRadius:10, paddingHorizontal:24, paddingVertical:10 }}><Text style={{ color:'#fff', fontWeight:'700' }}>Go Back</Text></TouchableOpacity>
    </View>
  );

  const balanceDue = bill.balanceDue || 0;
  const [amount, setAmount] = useState(balanceDue.toString());
  const [method, setMethod] = useState('Cash');
  const [ref,    setRef]    = useState('');
  const [notes,  setNotes]  = useState('');

  const paying    = parseFloat(amount) || 0;
  const newPaid   = Math.min(bill.totalAmount || 0, (bill.paidAmount || 0) + paying);
  const newBal    = Math.max(0, (bill.totalAmount || 0) - newPaid);
  const newStatus = newBal === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
  const sc        = STATUS_COLOR[newStatus] || '#888';

  const submit = async () => {
    if (!paying || paying > balanceDue) { Alert.alert('Error', 'Enter a valid payment amount.'); return; }
    try {
      await billingService.recordPayment(bill._id, { amount: paying, paymentMethod: method, transactionRef: ref, notes });
      Alert.alert('Success', 'Payment recorded!');
      onSave?.();
      onBack?.();
    } catch (e) { Alert.alert('Error', e.message); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
      <ScrollView style={{ flex:1, backgroundColor:colors.background }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Record Payment" subtitle={`Bill ${bill.billId || ''}`} onBack={onBack} />
        <View style={{ padding:24 }}>
          <Card>
            <Text style={{ color:colors.text, fontWeight:'700', fontSize:15, marginBottom:12 }}>Bill Summary</Text>
            {[['👤','Patient', bill.patientId?.name || 'Unknown'],
              ['💰','Total',   `Rs.${(bill.totalAmount||0).toLocaleString()}`],
              ['✅','Paid',    `Rs.${(bill.paidAmount||0).toLocaleString()}`],
              ['⏳','Balance', `Rs.${balanceDue.toLocaleString()}`]].map(([icon,label,val]) => (
              <View key={label} style={{ flexDirection:'row', alignItems:'center', gap:10, paddingVertical:8, borderBottomWidth:1, borderBottomColor:colors.border }}>
                <Text style={{ fontSize:17 }}>{icon}</Text>
                <Text style={{ color:colors.textSub, fontSize:13, width:90 }}>{label}</Text>
                <Text style={{ flex:1, color:colors.text, fontWeight:'600', fontSize:13 }}>{val}</Text>
              </View>
            ))}
          </Card>

          <Text style={{ color:colors.text, fontWeight:'700', fontSize:16, marginVertical:12 }}>Payment Amount</Text>
          <View style={{ flexDirection:'row', gap:10, marginBottom:8 }}>
            {[balanceDue, Math.floor(balanceDue/2)].map((v,i) => (
              <TouchableOpacity key={i} onPress={() => setAmount(v.toString())} style={{ flex:1, paddingVertical:10, borderRadius:12, alignItems:'center', backgroundColor:amount===v.toString()?colors.primary:colors.inputBg, borderWidth:1.5, borderColor:amount===v.toString()?colors.primary:colors.border }}>
                <Text style={{ color:amount===v.toString()?'#fff':colors.textSub, fontWeight:'700', fontSize:13 }}>{i===0?'Full amount':'Half amount'}</Text>
                <Text style={{ color:amount===v.toString()?'rgba(255,255,255,0.8)':colors.textMuted, fontSize:12 }}>Rs.{v.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input label="Custom Amount (Rs.)" placeholder="Enter amount" value={amount} onChangeText={setAmount} icon="💰" keyboardType="numeric" />

          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Payment Method</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:18 }}>
            {METHODS.map(m => (
              <TouchableOpacity key={m.key} onPress={() => setMethod(m.key)} style={{ paddingHorizontal:14, paddingVertical:10, borderRadius:12, backgroundColor:method===m.key?colors.primary:colors.inputBg, borderWidth:1.5, borderColor:method===m.key?colors.primary:colors.border, flexDirection:'row', alignItems:'center', gap:6 }}>
                <Text style={{ fontSize:16 }}>{m.icon}</Text>
                <Text style={{ color:method===m.key?'#fff':colors.textSub, fontWeight:'600', fontSize:13 }}>{m.key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Transaction Reference" placeholder="e.g. TXN123456" value={ref}   onChangeText={setRef}   icon="🔢" />
          <Input label="Notes (optional)"      placeholder="Any notes…"        value={notes} onChangeText={setNotes} icon="📝" />

          <Card style={{ backgroundColor:`${sc}15`, borderWidth:1.5, borderColor:sc }}>
            <Text style={{ color:colors.text, fontWeight:'700', fontSize:14, marginBottom:10 }}>After This Payment</Text>
            <View style={{ flexDirection:'row', gap:16, flexWrap:'wrap' }}>
              <View><Text style={{ color:colors.textSub, fontSize:12 }}>New status</Text><Badge label={newStatus} color={sc} /></View>
              <View><Text style={{ color:colors.textSub, fontSize:12 }}>Total paid</Text><Text style={{ color:'#34A853', fontWeight:'700', fontSize:14 }}>Rs.{newPaid.toLocaleString()}</Text></View>
              <View><Text style={{ color:colors.textSub, fontSize:12 }}>Remaining</Text><Text style={{ color:newBal>0?colors.danger:'#34A853', fontWeight:'700', fontSize:14 }}>Rs.{newBal.toLocaleString()}</Text></View>
            </View>
          </Card>
          <Button title="✅ Confirm Payment" onPress={submit} icon="💳" style={{ opacity:paying>0&&paying<=balanceDue?1:0.45 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export default function RecordPaymentScreenWrapper(p) { return <ThemeProvider><RecordPaymentScreen {...p} /></ThemeProvider>; }
export { RecordPaymentScreen };
