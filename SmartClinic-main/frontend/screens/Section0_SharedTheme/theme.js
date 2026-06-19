// ============================================================
//  SmartClinic — Shared Theme + Reusable Components
//  Import this in every screen
// ============================================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, useColorScheme, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Palettes ─────────────────────────────────────────────────
export const PALETTES = {
  blue:   { primary: '#1A73E8', primaryDark: '#1557B0', primaryLight: '#D2E3FC', accent: '#00BCD4', success: '#34A853', warning: '#FBBC04', danger: '#EA4335' },
  teal:   { primary: '#00897B', primaryDark: '#00695C', primaryLight: '#B2DFDB', accent: '#26C6DA', success: '#43A047', warning: '#FFA726', danger: '#EF5350' },
  purple: { primary: '#7C3AED', primaryDark: '#5B21B6', primaryLight: '#EDE9FE', accent: '#EC4899', success: '#10B981', warning: '#F59E0B', danger: '#EF4444' },
};

export const LIGHT = {
  background: '#F8FAFF', surface: '#FFFFFF', surfaceAlt: '#F0F4FF',
  border: '#E2E8F0', text: '#0F172A', textSub: '#64748B', textMuted: '#94A3B8',
  card: '#FFFFFF', inputBg: '#F1F5F9', navBar: '#FFFFFF', statusBar: 'dark-content',
};

export const DARK = {
  background: '#0A0F1E', surface: '#131929', surfaceAlt: '#1A2235',
  border: '#1E2D45', text: '#F1F5F9', textSub: '#94A3B8', textMuted: '#475569',
  card: '#131929', inputBg: '#1A2235', navBar: '#131929', statusBar: 'light-content',
};

// ── Context ───────────────────────────────────────────────────
export const ThemeContext = createContext(null);
const THEME_MODE_KEY = 'smartclinic_theme_mode';
const THEME_PALETTE_KEY = 'smartclinic_theme_palette';

export function ThemeProvider({ children }) {
  const parentTheme = useContext(ThemeContext);
  if (parentTheme) return children;

  const system = useColorScheme();
  const [mode, setMode]       = useState(system || 'light');
  const [palette, setPalette] = useState('blue');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [savedMode, savedPalette] = await Promise.all([
          AsyncStorage.getItem(THEME_MODE_KEY),
          AsyncStorage.getItem(THEME_PALETTE_KEY),
        ]);
        if (!active) return;
        if (savedMode === 'light' || savedMode === 'dark') setMode(savedMode);
        if (savedPalette && PALETTES[savedPalette]) setPalette(savedPalette);
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(THEME_MODE_KEY, mode).catch(() => {});
  }, [mode]);

  useEffect(() => {
    AsyncStorage.setItem(THEME_PALETTE_KEY, palette).catch(() => {});
  }, [palette]);

  const colors = { ...(mode === 'dark' ? DARK : LIGHT), ...PALETTES[palette] };
  return (
    <ThemeContext.Provider value={{ mode, setMode, palette, setPalette, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// ── Reusable Components ───────────────────────────────────────

export function Button({ title, onPress, variant = 'primary', icon, style }) {
  const { colors } = useTheme();
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : variant === 'outline' ? 'transparent' : colors.surfaceAlt;
  const tc = variant === 'outline' ? colors.primary : '#fff';
  const bc = variant === 'outline' ? colors.primary : 'transparent';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={[{ backgroundColor: bg, borderWidth: 1.5, borderColor: bc, borderRadius: 14, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }, style]}>
      {icon && <Text style={{ fontSize: 18 }}>{icon}</Text>}
      <Text style={{ color: tc, fontWeight: '700', fontSize: 15, letterSpacing: 0.3 }}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Input({ label, placeholder, value, onChangeText, secure, icon, error, keyboardType }) {
  const { colors } = useTheme();
  const [show, setShow] = React.useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>{label}</Text>}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: 12, borderWidth: 1.5, borderColor: error ? colors.danger : colors.border, paddingHorizontal: 14 }}>
        {icon && <Text style={{ fontSize: 18, marginRight: 8 }}>{icon}</Text>}
        <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} secureTextEntry={secure && !show} keyboardType={keyboardType || 'default'} style={{ flex: 1, color: colors.text, paddingVertical: 13, fontSize: 15 }} />
        {secure && <TouchableOpacity onPress={() => setShow(p => !p)}><Text style={{ fontSize: 16 }}>{show ? '🙈' : '👁️'}</Text></TouchableOpacity>}
      </View>
      {error && <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

export function Card({ children, style }) {
  const { colors } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.card, borderRadius: 18, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function Badge({ label, color }) {
  const { colors } = useTheme();
  return (
    <View style={{ backgroundColor: color ? color + '22' : colors.primaryLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' }}>
      <Text style={{ color: color || colors.primary, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export function ScreenHeader({ title, subtitle, onBack }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 12 }}>
      {onBack && <TouchableOpacity onPress={onBack} style={{ marginBottom: 10 }}><Text style={{ color: colors.primary, fontSize: 16 }}>{'<'} Back</Text></TouchableOpacity>}
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>{title}</Text>
      {subtitle && <Text style={{ color: colors.textSub, fontSize: 14, marginTop: 4 }}>{subtitle}</Text>}
    </View>
  );
}
