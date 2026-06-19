// ============================================================
//  ThemeSettingsScreen.js
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';

function ThemeSettingsScreen({ onBack }) {
  const { colors, mode, setMode, palette, setPalette } = useTheme();

  const PALETTES = [
    { key: 'blue',   label: 'Ocean Blue',   hex: '#1A73E8', desc: 'Classic medical blue' },
    { key: 'teal',   label: 'Clinic Teal',  hex: '#00897B', desc: 'Fresh health green'   },
    { key: 'purple', label: 'Royal Purple', hex: '#7C3AED', desc: 'Premium modern look'  },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Appearance" subtitle="Customise your theme" onBack={onBack} />

      <View style={{ padding: 24 }}>
        {/* Light / Dark */}
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 16 }}>Display Mode</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {['light', 'dark'].map(m => (
              <TouchableOpacity key={m} onPress={() => setMode(m)} style={{ flex: 1, paddingVertical: 18, borderRadius: 16, backgroundColor: mode === m ? colors.primary : colors.inputBg, alignItems: 'center', borderWidth: 1.5, borderColor: mode === m ? colors.primary : colors.border, gap: 6 }}>
                <Text style={{ fontSize: 32 }}>{m === 'light' ? '☀️' : '🌙'}</Text>
                <Text style={{ color: mode === m ? '#fff' : colors.textSub, fontWeight: '700', fontSize: 14, textTransform: 'capitalize' }}>{m} Mode</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Accent color */}
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 16 }}>Accent Colour</Text>
          {PALETTES.map(p => (
            <TouchableOpacity key={p.key} onPress={() => setPalette(p.key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, marginBottom: 8, backgroundColor: palette === p.key ? colors.primaryLight : colors.inputBg, borderWidth: 1.5, borderColor: palette === p.key ? colors.primary : colors.border }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: p.hex, shadowColor: p.hex, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 4 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{p.label}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{p.desc}</Text>
              </View>
              {palette === p.key && <Text style={{ fontSize: 20 }}>✅</Text>}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Live preview */}
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 14 }}>Live Preview</Text>
          <View style={{ backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Primary Button</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Badge label="Pending"   color={colors.warning} />
            <Badge label="Approved"  color={colors.success} />
            <Badge label="Cancelled" color={colors.danger}  />
            <Badge label="Online"    color={colors.accent}  />
          </View>
          <View style={{ marginTop: 14, height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' }}>
            <View style={{ width: '65%', height: '100%', backgroundColor: colors.primary, borderRadius: 4 }} />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>Progress bar (65%)</Text>
        </Card>
      </View>
    </ScrollView>
  );
}

export default function ThemeSettingsScreenWrapper(props) {
  return <ThemeProvider><ThemeSettingsScreen {...props} /></ThemeProvider>;
}
export { ThemeSettingsScreen };
