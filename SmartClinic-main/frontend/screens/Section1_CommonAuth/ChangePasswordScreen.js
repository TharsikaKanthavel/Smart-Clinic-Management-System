import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, Card, ScreenHeader } from '../Section0_SharedTheme/theme';

function ChangePasswordScreen({ onBack, onSave }) {
  const { colors } = useTheme();
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const rules = [
    { label: 'At least 8 characters', pass: form.newPw.length >= 8 },
    { label: 'Contains lowercase letter', pass: /[a-z]/.test(form.newPw) },
    { label: 'Contains uppercase letter', pass: /[A-Z]/.test(form.newPw) },
    { label: 'Contains a number', pass: /\d/.test(form.newPw) },
    { label: 'Passwords match', pass: form.newPw.length > 0 && form.newPw === form.confirm },
  ];

  const allPassed = rules.every((r) => r.pass);
  const canSubmit = Boolean(form.current) && allPassed;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Change Password" subtitle="Keep your account secure" onBack={onBack} />

        <View style={{ padding: 24 }}>
          <Input label="Current Password" placeholder="Enter current password" value={form.current} onChangeText={(v) => set('current', v)} icon="🔒" secure />
          <Input label="New Password" placeholder="Enter new password" value={form.newPw} onChangeText={(v) => set('newPw', v)} icon="🔑" secure />
          <Input label="Confirm New Password" placeholder="Re-enter new password" value={form.confirm} onChangeText={(v) => set('confirm', v)} icon="🔐" secure />

          <Card>
            <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 12 }}>Password Requirements</Text>
            {rules.map((r) => (
              <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 16 }}>{r.pass ? '✅' : '⭕'}</Text>
                <Text style={{ color: r.pass ? colors.success : colors.textSub, fontSize: 13 }}>{r.label}</Text>
              </View>
            ))}
          </Card>

          <Button
            title="Update Password"
            onPress={() => {
              if (!canSubmit) return;
              onSave({ currentPassword: form.current, newPassword: form.newPw });
            }}
            icon="🛡️"
            style={{ opacity: canSubmit ? 1 : 0.45 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ChangePasswordScreenWrapper(props) {
  return <ThemeProvider><ChangePasswordScreen {...props} /></ThemeProvider>;
}

export { ChangePasswordScreen };
