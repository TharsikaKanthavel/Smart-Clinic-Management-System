import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, Card, ScreenHeader } from '../Section0_SharedTheme/theme';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';

const { width } = Dimensions.get('window');

const TIME_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'];

function StepIndicator({ current }) {
  const { colors } = useTheme();
  const labels = ['Select Doctor', 'Date & Time', 'Confirm'];
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 24, marginBottom: 22 }}>
      {labels.map((label, i) => {
        const n = i + 1;
        return (
          <View key={n} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              {i > 0 ? <View style={{ flex: 1, height: 2, backgroundColor: current > i ? colors.primary : colors.border }} /> : null}
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: current >= n ? colors.primary : colors.inputBg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: current >= n ? colors.primary : colors.border }}>
                <Text style={{ color: current >= n ? '#fff' : colors.textMuted, fontWeight: '700', fontSize: 13 }}>{n}</Text>
              </View>
              {i < labels.length - 1 ? <View style={{ flex: 1, height: 2, backgroundColor: current > n ? colors.primary : colors.border }} /> : null}
            </View>
            <Text style={{ color: current === n ? colors.primary : colors.textMuted, fontSize: 10, marginTop: 4, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function next7Days() {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    days.push({ label: `${dayName} ${dayNum}`, iso: `${yyyy}-${mm}-${dd}` });
  }
  return days;
}

function BookAppointmentScreen({ onBack, onBook, appointment = null, role = 'Admin', user = null, currentPatient = null }) {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  const [form, setForm] = useState({
    patientId: typeof appointment?.patientId === 'object' ? appointment?.patientId?._id : (appointment?.patientId || ''),
    doctorId: typeof appointment?.doctorId === 'object' ? appointment?.doctorId?._id : (appointment?.doctorId || ''),
    selectedDoctor: null,
    selectedPatient: null,
    date: appointment?.appointmentDate ? String(appointment.appointmentDate).slice(0, 10) : '',
    time: appointment?.appointmentTime || '',
    type: appointment?.appointmentType || 'Physical',
    reason: appointment?.reasonForVisit || '',
    notes: appointment?.notes || '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [doctorRes, patientRes] = await Promise.all([
          doctorService.getAll(''),
          patientService.getAll(''),
        ]);
        if (!active) return;
        const doctorList = (doctorRes.doctors || []).filter((d) => (d.status || 'Active') === 'Active');
        const patientList = patientRes.patients || [];
        setDoctors(doctorList);
        setPatients(patientList);

        if (role === 'Patient') {
          if (currentPatient?._id) {
            setForm((f) => ({ ...f, patientId: currentPatient._id, selectedPatient: currentPatient }));
          }
          const loggedEmail = String(user?.email || '').toLowerCase();
          const loggedPhone = String(user?.phone || user?.phoneNumber || '').replace(/\s+/g, '');
          const loggedName = String(user?.fullName || user?.name || '').toLowerCase();
          const matchedPatient = patientList.find((pt) => {
            const ptEmail = String(pt?.email || '').toLowerCase();
            const ptPhone = String(pt?.phone || '').replace(/\s+/g, '');
            const ptName = String(pt?.patientName || pt?.name || '').toLowerCase();
            return (
              (loggedEmail && ptEmail && loggedEmail === ptEmail) ||
              (loggedPhone && ptPhone && loggedPhone === ptPhone) ||
              (loggedName && ptName && loggedName === ptName)
            );
          });
          if (matchedPatient) {
            setForm((f) => ({ ...f, patientId: matchedPatient._id, selectedPatient: matchedPatient }));
          }
        }

        if (form.doctorId) {
          const foundDoctor = doctorList.find((d) => d._id === form.doctorId);
          if (foundDoctor) set('selectedDoctor', foundDoctor);
        }
        if (form.patientId) {
          const foundPatient = patientList.find((p) => p._id === form.patientId);
          if (foundPatient) set('selectedPatient', foundPatient);
        }
      } finally {
        if (active) setLoadingRefs(false);
      }
    })();

    return () => { active = false; };
  }, []);

  const calDays = useMemo(() => next7Days(), []);

  const canStep1Next = role === 'Patient' ? Boolean(form.doctorId) : Boolean(form.patientId && form.doctorId);
  const canStep2Next = Boolean(form.date && form.time);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={appointment ? 'Reschedule Appointment' : 'Book Appointment'} subtitle="Schedule a new visit" onBack={onBack} />
        <StepIndicator current={step} />

        <View style={{ paddingHorizontal: 24 }}>
          {step === 1 ? (
            <View>
              {loadingRefs ? (
                <View style={{ paddingVertical: 18, alignItems: 'center' }}><ActivityIndicator color={colors.primary} /></View>
              ) : null}

              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Select Patient</Text>
              {role === 'Patient' ? (
                <Card style={{ marginBottom: 14 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{form.selectedPatient?.patientName || form.selectedPatient?.name || user?.fullName || user?.name || 'Patient'}</Text>
                  <Text style={{ color: colors.textSub, marginTop: 4 }}>{form.selectedPatient?.patientId || 'Your account'}</Text>
                </Card>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {patients.map((p) => {
                    const selectedPatient = form.patientId === p._id;
                    return (
                      <TouchableOpacity key={p._id} onPress={() => setForm((f) => ({ ...f, patientId: p._id, selectedPatient: p }))} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: selectedPatient ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: selectedPatient ? colors.primary : colors.border }}>
                        <Text style={{ color: selectedPatient ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 12 }}>{`${p.patientName || p.name} (${p.patientId || 'ID'})`}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Select Doctor</Text>
              {doctors.map((d) => (
                <TouchableOpacity key={d._id} onPress={() => setForm((f) => ({ ...f, doctorId: d._id, selectedDoctor: d }))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: form.doctorId === d._id ? colors.primaryLight : colors.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: form.doctorId === d._id ? colors.primary : colors.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{d.doctorName || d.name}</Text>
                    <Text style={{ color: colors.primary, fontSize: 12 }}>{d.specialization || 'General'}</Text>
                  </View>
                  <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 15 }}>{`Rs.${d.consultationFee || 0}`}</Text>
                </TouchableOpacity>
              ))}

              <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 8 }}>Appointment Type</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
                {['Physical', 'Online'].map((t) => (
                  <TouchableOpacity key={t} onPress={() => set('type', t)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: form.type === t ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: form.type === t ? colors.primary : colors.border }}>
                    <Text style={{ color: form.type === t ? '#fff' : colors.textSub, fontWeight: '600' }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button title="Next: Choose Date & Time" onPress={() => canStep1Next ? setStep(2) : null} style={{ opacity: canStep1Next ? 1 : 0.45 }} />
            </View>
          ) : null}

          {step === 2 ? (
            <View>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Select Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {calDays.map((d) => (
                  <TouchableOpacity key={d.iso} onPress={() => set('date', d.iso)} style={{ width: 70, height: 74, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: form.date === d.iso ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: form.date === d.iso ? colors.primary : colors.border }}>
                    <Text style={{ color: form.date === d.iso ? 'rgba(255,255,255,0.75)' : colors.textMuted, fontSize: 10 }}>{d.label.split(' ')[0]}</Text>
                    <Text style={{ color: form.date === d.iso ? '#fff' : colors.text, fontWeight: '800', fontSize: 22 }}>{d.label.split(' ')[1]}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Select Time Slot</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                {TIME_SLOTS.map((t) => (
                  <TouchableOpacity key={t} onPress={() => set('time', t)} style={{ width: (width - 64) / 3 - 4, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: form.time === t ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: form.time === t ? colors.primary : colors.border }}>
                    <Text style={{ color: form.time === t ? '#fff' : colors.text, fontSize: 12, fontWeight: '600' }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input label="Reason for Visit" placeholder="Briefly describe your symptoms..." value={form.reason} onChangeText={(v) => set('reason', v)} />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title="Back" onPress={() => setStep(1)} variant="outline" style={{ flex: 1 }} />
                <Button title="Next" onPress={() => canStep2Next ? setStep(3) : null} style={{ flex: 2, opacity: canStep2Next ? 1 : 0.45 }} />
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 16 }}>Confirm Appointment</Text>
              <Card style={{ borderWidth: 2, borderColor: colors.primary }}>
                {[
                  ['Doctor', form.selectedDoctor?.doctorName || form.selectedDoctor?.name || '-'],
                  ['Patient', form.selectedPatient?.patientName || form.selectedPatient?.name || '-'],
                  ['Date', form.date || '-'],
                  ['Time', form.time || '-'],
                  ['Type', form.type],
                  ['Reason', form.reason || '-'],
                ].map(([label, val]) => (
                  <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ color: colors.textSub, fontSize: 13, width: 80 }}>{label}</Text>
                    <Text style={{ flex: 1, color: colors.text, fontWeight: '600', fontSize: 13 }}>{val}</Text>
                  </View>
                ))}
              </Card>

              {form.selectedDoctor ? (
                <Card style={{ backgroundColor: colors.primaryLight + '88', borderWidth: 1, borderColor: colors.primary }}>
                  <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 4 }}>Consultation Fee</Text>
                  <Text style={{ color: colors.text, fontWeight: '900', fontSize: 22 }}>{`Rs. ${form.selectedDoctor.consultationFee || 0}`}</Text>
                </Card>
              ) : null}

              <Input label="Additional Notes (optional)" placeholder="Any extra info for the doctor..." value={form.notes} onChangeText={(v) => set('notes', v)} />

              <View style={{ gap: 10 }}>
                <Button title={appointment ? 'Confirm Reschedule' : 'Confirm Booking'} onPress={() => onBook(form)} />
                <Button title="Back" onPress={() => setStep(2)} variant="outline" />
              </View>
            </View>
          ) : null}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function BookAppointmentScreenWrapper(props) {
  return <ThemeProvider><BookAppointmentScreen {...props} /></ThemeProvider>;
}

export { BookAppointmentScreen };
