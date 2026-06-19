import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme, ThemeProvider, Card, ScreenHeader } from '../Section0_SharedTheme/theme';
import { labTestService } from '../../services/otherServices';

function LabAnalyticsScreen({ onBack, analytics }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(analytics || { total: 0, completed: 0, pending: 0 });

  const loadAnalytics = useCallback(async () => {
    if (analytics) {
      setData(analytics);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await labTestService.getAnalytics();
      setData(res?.analytics || { total: 0, completed: 0, pending: 0 });
    } catch (e) {
      setError(e?.message || 'Failed to load lab analytics');
    } finally {
      setLoading(false);
    }
  }, [analytics]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const total = Number(data?.total || 0);
  const completed = Number(data?.completed || 0);
  const pending = Number(data?.pending || 0);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Lab Analytics" subtitle="API-based overview" onBack={onBack} />
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
          <>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total', value: total, icon: '🧪', color: colors.primary },
                { label: 'Pending', value: pending, icon: '⏳', color: '#FBBC04' },
              ].map(s => (
                <Card key={s.label} style={{ flex: 1, margin: 0, padding: 14 }}>
                  <Text style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</Text>
                  <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '700' }}>{s.label.toUpperCase()}</Text>
                  <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18, marginTop: 2 }}>{s.value}</Text>
                </Card>
              ))}
            </View>

            <Card>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Completion Efficiency</Text>
              <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                <View style={{ width: `${completionRate}%`, backgroundColor: '#34A853', height: '100%' }} />
              </View>
              <Text style={{ color: colors.textSub, fontSize: 12 }}>{`${completionRate}% of ordered tests are completed`}</Text>
            </Card>

            {/* Monthly Volumes */}
            <Card>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 18 }}>Monthly Test Volume</Text>
              <View style={{ height: 140, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: 20 }}>
                {Object.entries(data.monthly || {}).sort().slice(-6).map(([m, v]) => {
                  const h = total > 0 ? (v / Math.max(...Object.values(data.monthly), 1)) * 100 : 0;
                  return (
                    <View key={m} style={{ alignItems: 'center', width: 40 }}>
                       <View style={{ width: 14, height: `${h}%`, backgroundColor: '#00897B', borderRadius: 4 }} />
                       <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 6, transform: [{ rotate: '-45deg' }] }}>{m.split('-')[1]}</Text>
                    </View>
                  );
                })}
              </View>
              {(!data.monthly || Object.keys(data.monthly).length === 0) && <Text style={{ textAlign: 'center', color: colors.textMuted }}>No history yet</Text>}
            </Card>

            {/* Category Breakdown */}
            <Card>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 14 }}>Test Distribution</Text>
              {Object.entries(data.categories || {}).sort((a,b) => b[1]-a[1]).map(([c, v], i) => {
                const pct = total > 0 ? (v / total) * 100 : 0;
                return (
                  <View key={c} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{c}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{v} tests ({pct.toFixed(0)}%)</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
                       <View style={{ height: '100%', width: `${pct}%`, backgroundColor: ['#1A73E8','#00897B','#C62828','#FBBC04'][i % 4], borderRadius: 3 }} />
                    </View>
                  </View>
                );
              })}
            </Card>
          </>
        )}
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

export default function LabAnalyticsScreenWrapper(props) {
  return <ThemeProvider><LabAnalyticsScreen {...props} /></ThemeProvider>;
}

export { LabAnalyticsScreen };
