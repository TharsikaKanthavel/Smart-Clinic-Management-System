import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme, ThemeProvider, Card, ScreenHeader } from '../Section0_SharedTheme/theme';
import { prescriptionService } from '../../services/prescriptionService';

function PrescriptionAnalyticsScreen({ onBack, analytics }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(analytics || { total: 0, refillAllowed: 0 });

  const loadAnalytics = useCallback(async () => {
    if (analytics) {
      setData(analytics);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await prescriptionService.getAnalytics();
      setData(res?.analytics || { total: 0, refillAllowed: 0 });
    } catch (e) {
      setError(e?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [analytics]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Prescription Analytics" subtitle="API-based overview" onBack={onBack} />
      <View style={{ paddingHorizontal: 20 }}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSub, marginTop: 10 }}>Loading analytics...</Text>
          </View>
        ) : error ? (
          <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ color: '#EA4335', textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity onPress={loadAnalytics} style={{ marginTop: 12, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <Card>
            {[
              ['Total Prescriptions', data.total || 0],
              ['Refill Allowed', data.refillAllowed || 0],
              ['No Refill', Math.max(0, (data.total || 0) - (data.refillAllowed || 0))],
            ].map(([k, v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.textSub }}>{k}</Text>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{v}</Text>
              </View>
            ))}
          </Card>
        )}
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

export default function PrescriptionAnalyticsScreenWrapper(props) {
  return <ThemeProvider><PrescriptionAnalyticsScreen {...props} /></ThemeProvider>;
}

export { PrescriptionAnalyticsScreen };
