// ============================================================
//  AddEditDoctorScreen.js
// ============================================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, ScreenHeader } from '../Section0_SharedTheme/theme';

function AddEditDoctorScreen({ doctor, onBack, onSave }) {
  const { colors } = useTheme();
  const isEdit = !!doctor;
  const [form, setForm] = useState(doctor ? {
    name: doctor.name || doctor.doctorName || '',
    specialization: doctor.specialization || '',
    department: doctor.department || '',
    qualification: doctor.qualification || '',
    experience: String(doctor.experience || doctor.experienceYears || ''),
    hospital: doctor.hospital || doctor.hospitalName || '',
    license: doctor.license || doctor.licenseNumber || '',
    phone: doctor.phone || '',
    email: doctor.email || '',
    fee: String(doctor.fee || doctor.consultationFee || ''),
    mode: doctor.mode || doctor.consultationMode || 'Physical',
    availableDays: Array.isArray(doctor.availableDays) ? doctor.availableDays : [],
    availableTime: doctor.availableTime || '',
  } : { name:'', specialization:'', department:'', qualification:'', experience:'', hospital:'', license:'', phone:'', email:'', fee:'', mode:'Physical', availableDays:[], availableTime:'' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDay = (d) => {
    const days = form.availableDays || [];
    set('availableDays', days.includes(d) ? days.filter(x => x !== d) : [...days, d]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={isEdit ? 'Edit Doctor' : 'Add Doctor'} subtitle={isEdit ? 'Update doctor information' : 'Register a new doctor'} onBack={onBack} />

        <View style={{ padding: 24 }}>
          {/* Photo upload */}
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
            <TouchableOpacity style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed' }}>
              <Text style={{ fontSize: 32 }}>📷</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.primary, marginTop: 8, fontWeight: '600', fontSize: 13 }}>Upload Photo</Text>
          </View>

          <Input label="Full Name"          placeholder="Dr. John Smith"   value={form.name}           onChangeText={v => set('name', v)}           icon="👤" />
          <Input label="Specialization"     placeholder="e.g. Cardiologist" value={form.specialization} onChangeText={v => set('specialization', v)} icon="🩺" />
          <Input label="Department"         placeholder="e.g. Cardiology"   value={form.department}     onChangeText={v => set('department', v)}     icon="🏥" />
          <Input label="Qualification"      placeholder="MBBS, MD..."       value={form.qualification}  onChangeText={v => set('qualification', v)}  icon="🎓" />
          <Input label="Experience (years)" placeholder="e.g. 10"           value={form.experience}     onChangeText={v => set('experience', v)}     icon="📆" keyboardType="numeric" />
          <Input label="Hospital / Clinic"  placeholder="Hospital name"     value={form.hospital}       onChangeText={v => set('hospital', v)}       icon="🏨" />
          <Input label="License Number"     placeholder="SLMC-XXXXX"        value={form.license}        onChangeText={v => set('license', v)}        icon="📋" />
          <Input label="Phone"              placeholder="+94 77 000 0000"   value={form.phone}          onChangeText={v => set('phone', v)}          icon="📞" keyboardType="phone-pad" />
          <Input label="Email"              placeholder="doctor@clinic.com" value={form.email}          onChangeText={v => set('email', v)}          icon="📧" keyboardType="email-address" />
          <Input label="Consultation Fee"   placeholder="e.g. 2500"         value={form.fee}            onChangeText={v => set('fee', v)}            icon="💰" keyboardType="numeric" />
          <Input label="Available Time"     placeholder="9:00 AM – 5:00 PM" value={form.availableTime}  onChangeText={v => set('availableTime', v)}  icon="🕐" />

          {/* Mode */}
          <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Consultation Mode</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            {['Physical', 'Online', 'Both'].map(m => (
              <TouchableOpacity key={m} onPress={() => set('mode', m)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: form.mode === m ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: form.mode === m ? colors.primary : colors.border }}>
                <Text style={{ color: form.mode === m ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 13 }}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Available Days */}
          <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Available Days</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => {
              const sel = (form.availableDays || []).includes(d);
              return (
                <TouchableOpacity key={d} onPress={() => toggleDay(d)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: sel ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: sel ? colors.primary : colors.border }}>
                  <Text style={{ color: sel ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 12 }}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button title={isEdit ? 'Save Changes' : 'Add Doctor'} onPress={() => onSave(form)} icon={isEdit ? '💾' : '➕'} />
          {isEdit && <Button title="Delete Doctor" onPress={() => onSave?.(form, 'delete')} variant="danger" icon="🗑️" style={{ marginTop: 10 }} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function AddEditDoctorScreenWrapper(props) {
  return <ThemeProvider><AddEditDoctorScreen {...props} /></ThemeProvider>;
}
export { AddEditDoctorScreen };
