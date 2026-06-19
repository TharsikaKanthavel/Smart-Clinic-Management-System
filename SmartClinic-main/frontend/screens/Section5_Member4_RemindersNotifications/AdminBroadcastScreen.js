// ============================================================
//  AdminBroadcastScreen.js
// ============================================================
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { NOTIF_CONFIG } from '../Section5_Member4_RemindersNotifications/NotificationListScreen';

function AdminBroadcastScreen({ onBack, onSend }) {
  const { colors } = useTheme();
  const [form, setForm] = useState({ message:'', type:'Announcement', priority:'Medium', audience:'All', delivery:'Push', scheduled:false, scheduleDate:'' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const TYPES     = ['Announcement','System','Emergency'];
  const PRIORITIES= ['Low','Medium','High'];
  const AUDIENCES = ['All Users','Doctors Only','Patients Only','Admin Only'];
  const DELIVERIES= ['Push','Email','SMS','All Channels'];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
      <ScrollView style={{ flex:1, backgroundColor:colors.background }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Broadcast Notification" subtitle="Send system-wide announcement" onBack={onBack} />

        <View style={{ padding:24 }}>
          {/* Type */}
          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Notification Type</Text>
          <View style={{ flexDirection:'row', gap:10, marginBottom:18 }}>
            {TYPES.map(t => {
              const nc = NOTIF_CONFIG[t] || { icon:'🔔', color:'#888' };
              return (
                <TouchableOpacity key={t} onPress={() => set('type', t)} style={{ flex:1, paddingVertical:12, borderRadius:12, alignItems:'center', gap:4, backgroundColor:form.type === t ? nc.color : colors.inputBg, borderWidth:1.5, borderColor:form.type === t ? nc.color : colors.border }}>
                  <Text style={{ fontSize:20 }}>{nc.icon}</Text>
                  <Text style={{ color:form.type === t ? '#fff' : colors.textSub, fontWeight:'600', fontSize:11 }}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Message */}
          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Message</Text>
          <View style={{ backgroundColor:colors.inputBg, borderRadius:12, borderWidth:1.5, borderColor:colors.border, padding:14, marginBottom:16 }}>
            <TextInput value={form.message} onChangeText={v => set('message', v)} placeholder="Type your broadcast message here…" placeholderTextColor={colors.textMuted} multiline numberOfLines={4} style={{ color:colors.text, fontSize:15, minHeight:90, textAlignVertical:'top' }} />
          </View>
          <Text style={{ color:colors.textMuted, fontSize:11, marginBottom:16, textAlign:'right' }}>{form.message.length}/500 characters</Text>

          {/* Priority */}
          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Priority Level</Text>
          <View style={{ flexDirection:'row', gap:10, marginBottom:18 }}>
            {PRIORITIES.map(p => {
              const pColor = p === 'High' ? '#EA4335' : p === 'Medium' ? '#FBBC04' : '#94A3B8';
              return (
                <TouchableOpacity key={p} onPress={() => set('priority', p)} style={{ flex:1, paddingVertical:12, borderRadius:12, alignItems:'center', backgroundColor:form.priority === p ? pColor : colors.inputBg, borderWidth:1.5, borderColor:form.priority === p ? pColor : colors.border }}>
                  <Text style={{ color:form.priority === p ? '#fff' : colors.textSub, fontWeight:'700', fontSize:13 }}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Audience */}
          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Target Audience</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:18 }}>
            {AUDIENCES.map(a => (
              <TouchableOpacity key={a} onPress={() => set('audience', a)} style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:form.audience === a ? colors.primary : colors.inputBg, borderWidth:1.5, borderColor:form.audience === a ? colors.primary : colors.border }}>
                <Text style={{ color:form.audience === a ? '#fff' : colors.textSub, fontWeight:'600', fontSize:13 }}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Delivery */}
          <Text style={{ color:colors.textSub, fontSize:13, fontWeight:'600', marginBottom:8 }}>Delivery Method</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:18 }}>
            {DELIVERIES.map(d => (
              <TouchableOpacity key={d} onPress={() => set('delivery', d)} style={{ paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:form.delivery === d ? colors.accent : colors.inputBg, borderWidth:1.5, borderColor:form.delivery === d ? colors.accent : colors.border }}>
                <Text style={{ color:form.delivery === d ? '#fff' : colors.textSub, fontWeight:'600', fontSize:13 }}>
                  {d === 'Push' ? '🔔 Push' : d === 'Email' ? '📧 Email' : d === 'SMS' ? '💬 SMS' : '📡 All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Schedule toggle */}
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:colors.inputBg, borderRadius:12, padding:16, marginBottom:form.scheduled ? 12 : 22, borderWidth:1, borderColor:colors.border }}>
            <View>
              <Text style={{ color:colors.text, fontWeight:'600' }}>📅 Schedule for Later</Text>
              <Text style={{ color:colors.textMuted, fontSize:12 }}>Send at a specific date & time</Text>
            </View>
            <Switch value={form.scheduled} onValueChange={v => set('scheduled', v)} trackColor={{ false:colors.border, true:colors.primary }} />
          </View>
          {form.scheduled && (
            <Input label="Schedule Date & Time" placeholder="YYYY-MM-DD HH:MM" value={form.scheduleDate} onChangeText={v => set('scheduleDate', v)} icon="🕐" style={{ marginBottom:22 }} />
          )}

          {/* Preview card */}
          <Card style={{ borderWidth:1.5, borderColor:(NOTIF_CONFIG[form.type] || { color:'#888' }).color, backgroundColor:(NOTIF_CONFIG[form.type] || { color:'#888' }).color + '11' }}>
            <Text style={{ color:colors.text, fontWeight:'700', fontSize:14, marginBottom:8 }}>Preview</Text>
            <View style={{ flexDirection:'row', gap:10, alignItems:'flex-start' }}>
              <Text style={{ fontSize:22 }}>{(NOTIF_CONFIG[form.type] || { icon:'🔔' }).icon}</Text>
              <View style={{ flex:1 }}>
                <View style={{ flexDirection:'row', gap:6, marginBottom:4 }}>
                  <Badge label={form.type}     color={(NOTIF_CONFIG[form.type] || { color:'#888' }).color} />
                  <Badge label={form.priority} color={form.priority === 'High' ? '#EA4335' : form.priority === 'Medium' ? '#FBBC04' : '#94A3B8'} />
                </View>
                <Text style={{ color:colors.text, fontSize:13 }}>{form.message || 'Your message will appear here…'}</Text>
                <Text style={{ color:colors.textMuted, fontSize:11, marginTop:4 }}>To: {form.audience} · via {form.delivery}</Text>
              </View>
            </View>
          </Card>

          <Button title="📢 Send Broadcast" onPress={onSend} icon="🚀" style={{ opacity:form.message ? 1 : 0.45 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function AdminBroadcastScreenWrapper(props) {
  return <ThemeProvider><AdminBroadcastScreen {...props} /></ThemeProvider>;
}
export { AdminBroadcastScreen };
