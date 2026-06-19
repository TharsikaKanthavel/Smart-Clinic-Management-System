// ============================================================
//  SplashScreen.js
// ============================================================
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StatusBar } from 'react-native';
import { useTheme, ThemeProvider } from '../Section0_SharedTheme/theme';

function SplashScreen({ onDone }) {
  const { colors } = useTheme();
  const scale   = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const bar     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 55 }),
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
    Animated.timing(bar, { toValue: 1, duration: 2200, useNativeDriver: false }).start();
    const t = setTimeout(() => onDone?.(), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity }}>
        {/* Logo circle */}
        <View style={{
          width: 110, height: 110, borderRadius: 32,
          backgroundColor: 'rgba(255,255,255,0.18)',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
        }}>
          <Text style={{ fontSize: 52 }}>🏥</Text>
        </View>

        <Text style={{ color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: -1 }}>
          SmartClinic
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 6, letterSpacing: 2 }}>
          HEALTHCARE MANAGEMENT
        </Text>
      </Animated.View>

      {/* Loading bar */}
      <View style={{ position: 'absolute', bottom: 70, width: 160 }}>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)' }}>
          <Animated.View style={{
            height: '100%', borderRadius: 2, backgroundColor: '#fff',
            width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }} />
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
          Loading…
        </Text>
      </View>
    </View>
  );
}

export default function SplashScreenWrapper(props) {
  return <ThemeProvider><SplashScreen {...props} /></ThemeProvider>;
}
export { SplashScreen };
