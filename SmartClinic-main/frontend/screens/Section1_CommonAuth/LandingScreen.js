import React from 'react';
import { View, Text, ScrollView, Animated, StatusBar, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useTheme, ThemeProvider, Button } from '../Section0_SharedTheme/theme';

const { width } = Dimensions.get('window');

function LandingScreen({ onLogin, onRegister }) {
  const { colors } = useTheme();
  
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} bounces={false} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Section */}
      <View style={{ 
        backgroundColor: colors.primary, 
        paddingTop: 80, 
        paddingBottom: 60, 
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        alignItems: 'center'
      }}>
        <View style={{
          width: 90, height: 90, borderRadius: 24,
          backgroundColor: 'rgba(255,255,255,0.15)',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
        }}>
          <Text style={{ fontSize: 44 }}>🏥</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 38, fontWeight: '900', textAlign: 'center', letterSpacing: -1 }}>
          SmartClinic
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 10, textAlign: 'center', maxWidth: 300, lineHeight: 22 }}>
          Experience the future of healthcare. Seamless appointments, digital labs, and instant prescriptions.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={{ padding: 24, marginTop: -30 }}>
        <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' }}>
            Get Started
          </Text>
          <Button 
            title="Log In" 
            onPress={onLogin} 
            icon="🔑" 
            style={{ marginBottom: 12 }} 
          />
          <Button 
            title="Create an Account" 
            onPress={onRegister} 
            variant="outline" 
            icon="📝" 
          />
        </View>
      </View>

      {/* Features Section */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 20 }}>
          Why choose SmartClinic?
        </Text>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {[
            { icon: '📅', title: 'Easy Booking', desc: 'Schedule appointments in seconds.' },
            { icon: '📄', title: 'Digital Records', desc: 'Secure access to your medical history.' },
            { icon: '🧪', title: 'Lab Results', desc: 'Get test results directly on your phone.' },
            { icon: '💊', title: 'E-Prescriptions', desc: 'Instant medication updates and reminders.' }
          ].map((feat, idx) => (
            <View key={idx} style={{ 
              width: '48%', 
              backgroundColor: colors.surfaceAlt, 
              padding: 16, 
              borderRadius: 20, 
              marginBottom: 16 
            }}>
              <View style={{ width: 40, height: 40, backgroundColor: '#fff', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 20 }}>{feat.icon}</Text>
              </View>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 6 }}>{feat.title}</Text>
              <Text style={{ color: colors.textSub, fontSize: 12, lineHeight: 18 }}>{feat.desc}</Text>
            </View>
          ))}
        </View>
      </View>
      
    </ScrollView>
  );
}

export default function LandingScreenWrapper(props) {
  return <ThemeProvider><LandingScreen {...props} /></ThemeProvider>;
}
export { LandingScreen };
