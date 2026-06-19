import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme, ThemeProvider, Card, Button } from '../Section0_SharedTheme/theme';
import { appointmentService } from '../../services/appointmentService';
import { ratingService } from '../../services/otherServices';

const STATUS_COLOR = { Pending: '#FBBC04', Approved: '#34A853', Completed: '#1A73E8', Cancelled: '#EA4335', Rejected: '#EA4335' };

function AppointmentDetailScreen({ appointment, onBack, onReschedule, onRefresh, role = 'Admin' }) {
  const { colors } = useTheme();
  const isPatient = role === 'Patient';

  const submitRating = async (doctorId, appointmentId, star) => {
    try {
      if (!doctorId) return;
      await ratingService.submit({ doctorId, appointmentId, rating: star });
      Alert.alert('Thank you!', 'Your rating has been submitted.');
      onRefresh?.();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (!appointment) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSub, marginTop: 12 }}>No appointment selected</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const a = appointment;
  const appointmentId = a._id || a.id;
  const sc = STATUS_COLOR[a.appointmentStatus] || '#888';
  const patient = a.patientName || a.patientId?.patientName || a.patientId?.name || 'Unknown Patient';
  const doctor = a.doctorName || a.doctorId?.doctorName || a.doctorId?.name || 'Unknown Doctor';
  const spec = a.doctorId?.specialization || a.specialization || '';

  const doAction = (newStatus, label) => {
    const run = async () => {
      try {
        if (!appointmentId) {
          if (typeof window !== 'undefined' && window.alert) window.alert('Error: Appointment ID not found.');
          else Alert.alert('Error', 'Appointment ID not found.');
          return;
        }
        await appointmentService.updateStatus(appointmentId, { appointmentStatus: newStatus });
        if (typeof window !== 'undefined' && window.alert) window.alert(`Done: ${label} successful.`);
        else Alert.alert('Done', `${label} successful.`);
        onRefresh?.();
        onBack?.();
      } catch (e) {
        if (typeof window !== 'undefined' && window.alert) window.alert(`Error: ${e.message}`);
        else Alert.alert('Error', e.message);
      }
    };

    if (typeof window !== 'undefined' && window.confirm) {
      const ok = window.confirm(`${label} this appointment?`);
      if (ok) run();
      return;
    }

    Alert.alert(label, 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', onPress: run },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: sc, paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 12 }}>Back</Text></TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Appointment ID</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{a.appointmentId || appointmentId}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : ''} - {a.appointmentTime || ''}</Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{a.appointmentStatus || 'Pending'}</Text>
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
          <Card style={{ flex: 1, margin: 0 }}>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6 }}>PATIENT</Text>
            <Text style={{ color: colors.text, fontWeight: '700', marginTop: 4, fontSize: 14 }}>{patient}</Text>
          </Card>
          <Card style={{ flex: 1, margin: 0 }}>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 6 }}>DOCTOR</Text>
            <Text style={{ color: colors.text, fontWeight: '700', marginTop: 4, fontSize: 14 }}>{doctor}</Text>
            {spec ? <Text style={{ color: colors.primary, fontSize: 12 }}>{spec}</Text> : null}
          </Card>
        </View>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Details</Text>
          {[
            ['Date', a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : '-'],
            ['Time', a.appointmentTime || '-'],
            ['Type', a.appointmentType || '-'],
            ['Queue', a.queueNumber ? `#${a.queueNumber}` : 'N/A'],
            ['Reason', a.reasonForVisit || '-'],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSub, fontSize: 13, width: 90 }}>{label}</Text>
              <Text style={{ flex: 1, color: colors.text, fontWeight: '600', fontSize: 13 }}>{val}</Text>
            </View>
          ))}
        </Card>

        {a.notes ? (
          <Card style={{ backgroundColor: colors.primaryLight + '66', borderWidth: 1, borderColor: colors.primary }}>
            <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 6 }}>Notes</Text>
            <Text style={{ color: colors.text, fontSize: 13 }}>{a.notes}</Text>
          </Card>
        ) : null}

        <View style={{ gap: 10, marginTop: 8 }}>
          {isPatient ? (
            <>
              {['Pending', 'Approved'].includes(a.appointmentStatus) ? (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button title="Reschedule" onPress={onReschedule} variant="outline" style={{ flex: 1 }} />
                  <Button title="Cancel" onPress={() => doAction('Cancelled', 'Cancel')} variant="danger" style={{ flex: 1 }} />
                </View>
              ) : null}
              {['Completed', 'Cancelled', 'Rejected'].includes(a.appointmentStatus) ? (
                <View style={{ gap: 10 }}>
                  <View style={{ backgroundColor: `${sc}20`, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: sc }}>
                    <Text style={{ color: sc, fontWeight: '700', fontSize: 15 }}>{a.appointmentStatus}</Text>
                  </View>
                  {a.appointmentStatus === 'Completed' && (
                    <Button
                      title="Rate Doctor"
                      onPress={() => {
                        const drId = a.doctorId?._id || a.doctorId;
                        const appId = a._id || a.id;
                        
                        const handleSelect = (star) => submitRating(drId, appId, star);

                        if (typeof window !== 'undefined' && window.confirm) {
                           const msg = `Rate ${doctor}\nSelect stars:\n1 - ⭐\n3 - ⭐⭐⭐\n5 - ⭐⭐⭐⭐⭐\nEnter 1, 3, or 5:`;
                           const val = window.prompt(msg, "5");
                           if (val && ['1','3','5'].includes(val)) {
                              handleSelect(Number(val));
                           }
                           return;
                        }

                        Alert.alert('Rate Doctor', `${doctor}\nHow was your experience?`, [
                          { text: '1 ⭐', onPress: () => handleSelect(1) },
                          { text: '3 ⭐', onPress: () => handleSelect(3) },
                          { text: '5 ⭐', onPress: () => handleSelect(5) },
                          { text: 'Cancel', style: 'cancel' }
                        ]);
                      }}
                    />
                  )}
                </View>
              ) : null}
            </>
          ) : a.appointmentStatus === 'Pending' ? (
            <>
              <Button title="Approve" onPress={() => doAction('Approved', 'Approve')} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title="Reschedule" onPress={onReschedule} variant="outline" style={{ flex: 1 }} />
                <Button title="Reject" onPress={() => doAction('Rejected', 'Reject')} variant="danger" style={{ flex: 1 }} />
              </View>
            </>
          ) : null}

          {!isPatient && a.appointmentStatus === 'Approved' ? (
            <>
              <Button title="Mark Complete" onPress={() => doAction('Completed', 'Complete')} />
              <Button title="Cancel" onPress={() => doAction('Cancelled', 'Cancel')} variant="danger" />
            </>
          ) : null}

          {!isPatient && ['Completed', 'Cancelled', 'Rejected'].includes(a.appointmentStatus) ? (
            <View style={{ backgroundColor: `${sc}20`, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: sc }}>
              <Text style={{ color: sc, fontWeight: '700', fontSize: 15 }}>{a.appointmentStatus}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

export default function AppointmentDetailScreenWrapper(p) {
  return <ThemeProvider><AppointmentDetailScreen {...p} /></ThemeProvider>;
}

export { AppointmentDetailScreen };
