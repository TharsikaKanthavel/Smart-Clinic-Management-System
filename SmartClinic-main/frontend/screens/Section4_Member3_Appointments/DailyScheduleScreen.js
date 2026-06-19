// ============================================================
//  DailyScheduleScreen.js
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';

const HOURS = ['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM'];
const STATUS_COLORS = {
  'Approved': '#1A73E8',
  'Pending': '#FBBC04',
  'Completed': '#34A853',
  'Cancelled': '#EA4335'
};

function DailyScheduleScreen({ onBack, onSelect }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  
  // Generate date strip (Today + 6 days)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendar, setCalendar] = useState([]);

  useEffect(() => {
    const cal = [];
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for(let i=0; i<7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        cal.push({
            label: days[d.getDay()],
            num: d.getDate().toString(),
            date: d.toISOString().split('T')[0]
        });
    }
    setCalendar(cal);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAll();
      const all = Array.isArray(res.appointments) ? res.appointments : [];
      
      const loggedEmail = String(user?.email || '').toLowerCase();
      const loggedName = String(user?.fullName || user?.name || '').toLowerCase();

      // Filter by current doctor and selected date
      const filtered = all.filter(a => {
        const drEmail = String(a.email || (typeof a.doctorId === 'object' ? a.doctorId?.email : '')).toLowerCase();
        const drName = String(a.doctorName || (typeof a.doctorId === 'object' ? a.doctorId?.doctorName : '')).toLowerCase();
        const aDate = String(a.appointmentDate || '').split('T')[0];
        
        const isThisDr = (loggedEmail && drEmail === loggedEmail) || (loggedName && drName === loggedName);
        const isThisDate = aDate === date;

        return isThisDr && isThisDate;
      });

      setAppointments(filtered);
    } catch (e) {
      console.error('Schedule Load Error:', e);
    } finally {
      setLoading(false);
    }
  }, [user, date]);

  useEffect(() => { load(); }, [load]);

  const total     = appointments.length;
  const pending   = appointments.filter(a => (a.appointmentStatus || a.status) === 'Pending').length;
  const approved  = appointments.filter(a => (a.appointmentStatus || a.status) === 'Approved').length;
  const completed = appointments.filter(a => (a.appointmentStatus || a.status) === 'Completed').length;

  return (
    <ScrollView style={{ flex:1, backgroundColor:colors.background }}>
      <ScreenHeader title="My Schedule" subtitle="Your appointments for the day" onBack={onBack} />

      {/* Date strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft:20, marginVertical:16 }}>
        {calendar.map(d => (
          <TouchableOpacity key={d.date} onPress={() => setDate(d.date)} style={{ width:54, height:72, borderRadius:14, alignItems:'center', justifyContent:'center', marginRight:10, backgroundColor:date === d.date ? colors.primary : colors.inputBg, borderWidth:1.5, borderColor:date === d.date ? colors.primary : colors.border }}>
            <Text style={{ color:date === d.date ? 'rgba(255,255,255,0.7)' : colors.textMuted, fontSize:10 }}>{d.label}</Text>
            <Text style={{ color:date === d.date ? '#fff' : colors.text, fontWeight:'800', fontSize:20 }}>{d.num}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal:20 }}>
        {/* Summary row */}
        <View style={{ flexDirection:'row', gap:10, marginBottom:20 }}>
          {[{ icon:'📅', label:'Total',    value:total,     color:colors.primary },
            { icon:'⏳', label:'Pending',  value:pending,   color:'#FBBC04' },
            { icon:'✅', label:'Approved', value:approved,  color:'#1A73E8' },
            { icon:'🏁', label:'Done',     value:completed, color:'#34A853' }].map(s => (
            <View key={s.label} style={{ flex:1, backgroundColor:s.color + '15', borderRadius:14, padding:10, alignItems:'center', borderWidth:1.5, borderColor:s.color + '44' }}>
              <Text style={{ fontSize:18 }}>{s.icon}</Text>
              <Text style={{ color:s.color, fontWeight:'900', fontSize:18 }}>{s.value}</Text>
              <Text style={{ color:colors.textSub, fontSize:9 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        {loading ? (
             <ActivityIndicator size="large" color={colors.primary} style={{ marginTop:40 }} />
        ) : (
          HOURS.map(hour => {
            const h = hour.replace(' AM','').replace(' PM','');
            const apt = appointments.find(a => {
              const t = String(a.appointmentTime || '');
              if (!t) return false;
              const tHour = t.split(':')[0];
              const isPM = t.includes('PM') && parseInt(tHour) !== 12;
              const aptH = isPM ? parseInt(tHour) + 12 : (t.includes('AM') && parseInt(tHour) === 12 ? 0 : parseInt(tHour));
              
              const slotH = hour.includes('PM') && parseInt(h) !== 12 ? parseInt(h) + 12 : (hour.includes('AM') && parseInt(h) === 12 ? 0 : parseInt(h));
              return aptH === slotH;
            });
            const status = apt?.appointmentStatus || apt?.status || 'Pending';
            const color  = STATUS_COLORS[status] || '#888';

            return (
              <View key={hour} style={{ flexDirection:'row', gap:12, marginBottom:4, minHeight:75 }}>
                <Text style={{ color:colors.textMuted, fontSize:12, width:46, paddingTop:14, textAlign:'right' }}>{hour}</Text>
                <View style={{ width:1, backgroundColor:colors.border }} />
                {apt ? (
                  <TouchableOpacity onPress={() => onSelect?.(apt)} style={{ flex:1, backgroundColor:color + '10', borderRadius:10, padding:12, marginVertical:4, borderLeftWidth:4, borderLeftColor:color }}>
                    <Text style={{ color:colors.text, fontWeight:'700', fontSize:14 }}>{apt.patientName || apt.patientId?.patientName || 'Patient'}</Text>
                    <Text style={{ color:colors.textSub, fontSize:11, marginTop:2 }}>{apt.appointmentTime} · {apt.appointmentType}</Text>
                    <View style={{ marginTop:4, flexDirection:'row', justifyContent:'flex-end' }}>
                       <Badge label={status} color={color} />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={{ flex:1, marginVertical:4, justifyContent:'center', paddingLeft:10 }}>
                    <Text style={{ color:colors.textMuted, fontSize:12, fontStyle:'italic' }}>-- Available --</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
      <View style={{ height:40 }} />
    </ScrollView>
  );
}

export default function DailyScheduleScreenWrapper(props) {
  return <ThemeProvider><DailyScheduleScreen {...props} /></ThemeProvider>;
}
export { DailyScheduleScreen };
