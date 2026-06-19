import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, ScreenHeader } from '../Section0_SharedTheme/theme';

function RegisterScreen({ onBack, onSubmit }) {
  const { colors } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'Patient' });
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const ROLES = ['Doctor', 'Patient'];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const strengthScore = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore];
  const strengthColors = ['', '#EA4335', '#FBBC04', '#1A73E8', '#34A853'];

  const errors = {
    name: !form.name.trim() ? 'Full name is required' : '',
    email: !form.email.trim() ? 'Email is required' : (!emailRegex.test(form.email.trim()) ? 'Enter a valid email address' : ''),
    phone: !form.phone.trim() ? 'Phone number is required' : (!phoneRegex.test(form.phone.trim().replace(/\s+/g, '')) ? 'Enter a valid phone number (10-15 digits)' : ''),
    password: !form.password ? 'Password is required' : (!passRegex.test(form.password) ? 'Min 8 chars with upper, lower and number' : ''),
    confirm: !form.confirm ? 'Confirm password is required' : (form.password !== form.confirm ? 'Passwords do not match' : ''),
    role: !ROLES.includes(form.role) ? 'Select a valid role' : '',
  };

  const isFormValid = Object.values(errors).every((e) => !e);

  const submit = () => {
    setSubmitted(true);
    if (!isFormValid) return;
    onSubmit({
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim().replace(/\s+/g, ''),
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Create Account" subtitle="Register to SmartClinic" onBack={onBack} />

        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
            <TouchableOpacity style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed' }}>
              <Text style={{ fontSize: 32 }}>{'\u{1F4F7}'}</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.primary, marginTop: 8, fontWeight: '600', fontSize: 13 }}>Upload Photo</Text>
          </View>

          <Input label="Full Name" placeholder="John Doe" value={form.name} onChangeText={(v) => set('name', v)} icon={'\u{1F464}'} error={submitted ? errors.name : ''} />
          <Input label="Email" placeholder="you@clinic.com" value={form.email} onChangeText={(v) => set('email', v)} icon={'\u{1F4E7}'} keyboardType="email-address" error={submitted ? errors.email : ''} />
          <Input label="Phone Number" placeholder="+94 77 000 0000" value={form.phone} onChangeText={(v) => set('phone', v)} icon={'\u{1F4F1}'} keyboardType="phone-pad" error={submitted ? errors.phone : ''} />
          <Input label="Password" placeholder="Min. 8 characters" value={form.password} onChangeText={(v) => set('password', v)} icon={'\u{1F512}'} secure error={submitted ? errors.password : ''} />
          <Input label="Confirm Password" placeholder="Re-enter password" value={form.confirm} onChangeText={(v) => set('confirm', v)} icon={'\u{1F510}'} secure error={submitted ? errors.confirm : ''} />

          {form.password.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: strengthScore >= i ? strengthColors[strengthScore] : colors.border }} />
                ))}
              </View>
              <Text style={{ color: strengthColors[strengthScore], fontSize: 12, fontWeight: '600' }}>Strength: {strengthLabel}</Text>
            </View>
          )}

          <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Select Role</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            {ROLES.map((r) => (
              <TouchableOpacity key={r} onPress={() => set('role', r)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: form.role === r ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: form.role === r ? colors.primary : colors.border }}>
                <Text style={{ color: form.role === r ? '#fff' : colors.textSub, fontWeight: '700', fontSize: 13 }}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {submitted && !!errors.role && <Text style={{ color: colors.danger, fontSize: 12, marginTop: -16, marginBottom: 12 }}>{errors.role}</Text>}

          <Button title="Create Account" onPress={submit} icon={'\u2705'} style={{ opacity: isFormValid ? 1 : 0.65 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function RegisterScreenWrapper(props) {
  return <ThemeProvider><RegisterScreen {...props} /></ThemeProvider>;
}

export { RegisterScreen };
