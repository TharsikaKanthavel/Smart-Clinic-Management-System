import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, ThemeProvider, Card, Input, ScreenHeader } from '../Section0_SharedTheme/theme';

function ChoicePill({ active, label, onPress, activeColor, borderColor, textColor }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: active ? activeColor : borderColor,
        backgroundColor: active ? activeColor : 'transparent',
      }}
    >
      <Text style={{ color: active ? '#fff' : textColor, fontWeight: '700', fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function AdminUserFormScreen({ user, onBack, onSave }) {
  const { colors } = useTheme();
  const isEdit = Boolean(user);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'Patient',
    accountStatus: 'Active',
    password: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || user?.phone || '',
      role: user?.role || 'Patient',
      accountStatus: user?.accountStatus || 'Active',
      password: '',
    });
  }, [user]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={isEdit ? 'Edit User' : 'Add User'} subtitle="Admin user management" onBack={onBack} />
      <View style={{ paddingHorizontal: 20 }}>
        <Card>
          <Input label="Full Name" value={form.fullName} onChangeText={(v) => set('fullName', v)} placeholder="Enter full name" />
          <Input label="Email" value={form.email} onChangeText={(v) => set('email', v)} placeholder="Enter email" keyboardType="email-address" />
          <Input label="Phone Number" value={form.phoneNumber} onChangeText={(v) => set('phoneNumber', v)} placeholder="Enter phone" keyboardType="phone-pad" />
          <Input label={isEdit ? 'Password (optional)' : 'Password'} value={form.password} onChangeText={(v) => set('password', v)} placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter strong password'} secure />

          <Text style={{ color: colors.text, fontWeight: '700', marginTop: 8, marginBottom: 8 }}>Role</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {['Admin', 'Doctor', 'Patient'].map((role) => (
              <ChoicePill
                key={role}
                label={role}
                active={form.role === role}
                onPress={() => set('role', role)}
                activeColor={colors.primary}
                borderColor={colors.border}
                textColor={colors.textSub}
              />
            ))}
          </View>

          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['Active', 'Suspended', 'Pending'].map((status) => (
              <ChoicePill
                key={status}
                label={status}
                active={form.accountStatus === status}
                onPress={() => set('accountStatus', status)}
                activeColor={colors.primary}
                borderColor={colors.border}
                textColor={colors.textSub}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={() => onSave?.(form, user)}
            style={{ marginTop: 16, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{isEdit ? 'Update User' : 'Create User'}</Text>
          </TouchableOpacity>
        </Card>
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

export default function AdminUserFormScreenWrapper(props) {
  return <ThemeProvider><AdminUserFormScreen {...props} /></ThemeProvider>;
}

export { AdminUserFormScreen };
