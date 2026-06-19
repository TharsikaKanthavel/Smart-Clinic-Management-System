import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, ScreenHeader } from '../Section0_SharedTheme/theme';

function AddEditPatientScreen({ patient, onBack, onSave, onDelete }) {
  const { colors } = useTheme();
  const isEdit = !!patient;

  const [form, setForm] = useState(patient ? {
    name: patient.name || patient.patientName || '',
    age: String(patient.age || ''),
    gender: patient.gender || 'Male',
    dob: patient.dob || (patient.dateOfBirth ? String(patient.dateOfBirth).slice(0, 10) : ''),
    phone: patient.phone || '',
    email: patient.email || '',
    address: patient.address || '',
    bloodGroup: patient.bloodGroup || 'O+',
    allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || ''),
    chronicDiseases: Array.isArray(patient.chronicDiseases) ? patient.chronicDiseases.join(', ') : (patient.chronicDiseases || ''),
    insurance: patient.insurance || patient.insuranceProvider || '',
    insuranceNo: patient.insuranceNo || patient.insuranceNumber || '',
    emergencyContact: patient.emergencyContact || patient.emergencyContactName || '',
    emergencyPhone: patient.emergencyPhone || patient.emergencyContactNumber || '',
  } : {
    name: '', age: '', gender: 'Male', dob: '', phone: '', email: '', address: '', bloodGroup: 'O+', allergies: '', chronicDiseases: '', insurance: '', insuranceNo: '', emergencyContact: '', emergencyPhone: ''
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={isEdit ? 'Edit Patient' : 'Register Patient'} subtitle={isEdit ? 'Update patient record' : 'Add new patient to system'} onBack={onBack} />

        <View style={{ padding: 24 }}>
          <Input label="Full Name" placeholder="Patient full name" value={form.name} onChangeText={(v) => set('name', v)} icon="👤" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Input label="Age" placeholder="e.g. 35" value={form.age} onChangeText={(v) => set('age', v)} icon="🎂" keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><Input label="DOB" placeholder="YYYY-MM-DD" value={form.dob} onChangeText={(v) => set('dob', v)} icon="📅" /></View>
          </View>

          <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Gender</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity key={g} onPress={() => set('gender', g)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: form.gender === g ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: form.gender === g ? colors.primary : colors.border }}>
                <Text style={{ color: form.gender === g ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 12 }}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Blood Group</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
              <TouchableOpacity key={bg} onPress={() => set('bloodGroup', bg)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8, backgroundColor: form.bloodGroup === bg ? colors.danger : colors.inputBg, borderWidth: 1.5, borderColor: form.bloodGroup === bg ? colors.danger : colors.border }}>
                <Text style={{ color: form.bloodGroup === bg ? '#fff' : colors.textSub, fontWeight: '700' }}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input label="Phone" placeholder="+94 77 000 0000" value={form.phone} onChangeText={(v) => set('phone', v)} icon="📞" keyboardType="phone-pad" />
          <Input label="Email" placeholder="patient@gmail.com" value={form.email} onChangeText={(v) => set('email', v)} icon="📧" keyboardType="email-address" />
          <Input label="Address" placeholder="Street, City" value={form.address} onChangeText={(v) => set('address', v)} icon="📍" />
          <Input label="Allergies" placeholder="Penicillin, Aspirin..." value={form.allergies} onChangeText={(v) => set('allergies', v)} icon="⚠️" />
          <Input label="Chronic Diseases" placeholder="Diabetes, Hypertension..." value={form.chronicDiseases} onChangeText={(v) => set('chronicDiseases', v)} icon="🩺" />

          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginVertical: 12 }}>Insurance</Text>
          <Input label="Insurance Provider" placeholder="e.g. AIA Sri Lanka" value={form.insurance} onChangeText={(v) => set('insurance', v)} icon="🛡️" />
          <Input label="Insurance Number" placeholder="Policy number" value={form.insuranceNo} onChangeText={(v) => set('insuranceNo', v)} icon="📋" />

          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginVertical: 12 }}>Emergency Contact</Text>
          <Input label="Contact Name" placeholder="Full name" value={form.emergencyContact} onChangeText={(v) => set('emergencyContact', v)} icon="🆘" />
          <Input label="Contact Phone" placeholder="+94 77 000 0000" value={form.emergencyPhone} onChangeText={(v) => set('emergencyPhone', v)} icon="📞" keyboardType="phone-pad" />

          <Button title={isEdit ? 'Save Changes' : 'Register Patient'} onPress={() => onSave(form)} icon={isEdit ? '💾' : '➕'} />
          {isEdit && <Button title="Delete Patient" variant="danger" onPress={onDelete} icon="🗑️" style={{ marginTop: 10 }} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function AddEditPatientScreenWrapper(props) {
  return <ThemeProvider><AddEditPatientScreen {...props} /></ThemeProvider>;
}

export { AddEditPatientScreen };
