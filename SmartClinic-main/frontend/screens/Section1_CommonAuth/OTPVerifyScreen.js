// ============================================================
//  OTPVerifyScreen.js
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, ThemeProvider, Button, ScreenHeader } from '../Section0_SharedTheme/theme';

function OTPVerifyScreen({ onBack, onVerify, onResend, email = 'user@smartclinic.com' }) {
  const { colors } = useTheme();
  const [otp,     setOtp]     = useState(['', '', '', '', '', '']);
  const [timer,   setTimer]   = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = Array(6).fill(null).map(() => useRef(null));

  useEffect(() => {
    if (timer === 0) { setCanResend(true); return; }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleChange = (v, i) => {
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) inputs[i + 1].current?.focus();
  };

  const handleBackspace = (v, i) => {
    if (!v && i > 0) inputs[i - 1].current?.focus();
  };

  const resend = async () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    await onResend?.();
  };

  const filled = otp.every(d => d !== '');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Verify Email" subtitle={`Enter the 6-digit code sent to ${email}`} onBack={onBack} />

      <View style={{ padding: 24, alignItems: 'center' }}>
        {/* Icon */}
        <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 28, marginTop: 10 }}>
          <Text style={{ fontSize: 42 }}>📩</Text>
        </View>

        {/* OTP boxes */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32 }}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={inputs[i]}
              value={digit}
              onChangeText={v => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => nativeEvent.key === 'Backspace' && handleBackspace(digit, i)}
              maxLength={1}
              keyboardType="number-pad"
              style={{
                width: 46, height: 58, borderRadius: 14,
                backgroundColor: colors.inputBg,
                textAlign: 'center', fontSize: 24, fontWeight: '800',
                color: colors.text,
                borderWidth: 2,
                borderColor: digit ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        <Button title="Verify OTP" onPress={() => onVerify(otp.join(''))} icon="✅" style={{ width: '100%', opacity: filled ? 1 : 0.5 }} />

        {/* Resend */}
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 22, alignItems: 'center' }}>
          <Text style={{ color: colors.textSub, fontSize: 14 }}>Didn't receive the code?</Text>
          {canResend ? (
            <TouchableOpacity onPress={resend}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Resend</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>Resend in {timer}s</Text>
          )}
        </View>

        {/* Info note */}
        <View style={{ marginTop: 28, backgroundColor: colors.inputBg, borderRadius: 14, padding: 14, width: '100%' }}>
          <Text style={{ color: colors.textSub, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
            Check your spam folder if you don't see the email.{'\n'}Code expires in 10 minutes.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function OTPVerifyScreenWrapper(props) {
  return <ThemeProvider><OTPVerifyScreen {...props} /></ThemeProvider>;
}
export { OTPVerifyScreen };
