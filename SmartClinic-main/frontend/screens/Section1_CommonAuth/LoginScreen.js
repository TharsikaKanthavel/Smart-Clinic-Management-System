// ============================================================
//  LoginScreen.js
// ============================================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme, ThemeProvider, Button, Input } from '../Section0_SharedTheme/theme';

function LoginScreen({ onLogin, onRegister, onForgot }) {
  const { colors, mode } = useTheme();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('Doctor');

  const ROLES = [
    { key: 'Admin',   icon: '🏥' },
    { key: 'Doctor',  icon: '👨‍⚕️' },
    { key: 'Patient', icon: '🧑‍🤝‍🧑' },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />

        {/* Hero header */}
        <View style={{ height: 230, backgroundColor: colors.primary, borderBottomLeftRadius: 44, borderBottomRightRadius: 44, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Text style={{ fontSize: 38 }}>🏥</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 }}>SmartClinic</Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>Sign in to continue</Text>
        </View>

        <View style={{ padding: 24, marginTop: 8 }}>
          {/* Role selector */}
          <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 10 }}>Login As</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {ROLES.map(r => (
              <TouchableOpacity key={r.key} onPress={() => setRole(r.key)} style={{
                flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center', gap: 4,
                backgroundColor: role === r.key ? colors.primary : colors.inputBg,
                borderWidth: 1.5, borderColor: role === r.key ? colors.primary : colors.border,
              }}>
                <Text style={{ fontSize: 22 }}>{r.icon}</Text>
                <Text style={{ color: role === r.key ? '#fff' : colors.textSub, fontWeight: '700', fontSize: 12 }}>{r.key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Email Address" placeholder="you@smartclinic.com" value={email} onChangeText={setEmail} icon="📧" keyboardType="email-address" />
          <Input label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} icon="🔒" secure />

          <TouchableOpacity onPress={onForgot} style={{ alignSelf: 'flex-end', marginBottom: 22 }}>
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={() => onLogin(email, password, role)} icon="🚀" />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28 }}>
            <Text style={{ color: colors.textSub }}>Don't have an account? </Text>
            <TouchableOpacity onPress={onRegister}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function LoginScreenWrapper(props) {
  return <ThemeProvider><LoginScreen {...props} /></ThemeProvider>;
}
export { LoginScreen };
