import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Card, ScreenHeader } from '../Section0_SharedTheme/theme';
import { billingService } from '../../services/otherServices';

function BillingAnalyticsScreen({ onBack, analytics }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(!analytics);
  const [data, setData] = useState(analytics || { revenue: 0, outstanding: 0, count: 0 });

  useEffect(() => {
    if (analytics) return;
    let active = true;
    (async () => {
      try {
        const res = await billingService.getAnalytics();
        if (!active) return;
        setData(res?.analytics || { revenue: 0, outstanding: 0, count: 0 });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [analytics]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const monthlyArr = Object.entries(data.monthly || {}).sort((a,b) => a[0].localeCompare(b[0])).slice(-6); // Last 6 months
  const maxMonthly = Math.max(...monthlyArr.map(m => m[1]), 1);

  const methodArr = Object.entries(data.methods || {}).sort((a,b) => b[1] - a[1]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Billing Analytics" subtitle="Financial Performance Overview" onBack={onBack} />
      
      <View style={{ padding: 20 }}>
        {/* Core Stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Revenue', value: `Rs.${(data.revenue || 0).toLocaleString()}`, icon: '💰', color: '#34A853' },
            { label: 'Pending', value: `Rs.${(data.outstanding || 0).toLocaleString()}`, icon: '⏳', color: '#FBBC04' },
          ].map(s => (
            <Card key={s.label} style={{ flex: 1, margin: 0, padding: 14 }}>
              <Text style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</Text>
              <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '700' }}>{s.label.toUpperCase()}</Text>
              <Text style={{ color: s.color, fontWeight: '800', fontSize: 14, marginTop: 2 }}>{s.value}</Text>
            </Card>
          ))}
        </View>

        {/* Monthly Revenue Bar Chart (Mock) */}
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 18 }}>Monthly Revenue Trends</Text>
          <View style={{ height: 160, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: 20 }}>
            {monthlyArr.map(([m, v]) => {
              const h = (v / maxMonthly) * 100;
              return (
                <View key={m} style={{ alignItems: 'center', width: 40 }}>
                   <View style={{ width: 14, height: `${h}%`, backgroundColor: colors.primary, borderRadius: 4 }} />
                   <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 6, transform: [{ rotate: '-45deg' }] }}>{m.split('-')[1]}</Text>
                </View>
              );
            })}
          </View>
          {monthlyArr.length === 0 && <Text style={{ textAlign: 'center', color: colors.textMuted }}>No history yet</Text>}
        </Card>

        {/* Payment Methods Breakdown */}
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 14 }}>Payment Methods</Text>
          {methodArr.map(([m, v], i) => {
            const pct = data.revenue > 0 ? (v / data.revenue) * 100 : 0;
            return (
              <View key={m} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{m}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{pct.toFixed(1)}%</Text>
                </View>
                <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4 }}>
                   <View style={{ height: '100%', width: `${pct}%`, backgroundColor: ['#1A73E8','#34A853','#FBBC04','#EA4335'][i % 4], borderRadius: 4 }} />
                </View>
              </View>
            );
          })}
        </Card>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Summary</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.textSub, fontSize: 13 }}>Total Invoices</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{data.count || 0}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
            <Text style={{ color: colors.textSub, fontSize: 13 }}>Avg. Bill Value</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>Rs.{(data.count > 0 ? data.revenue / data.count : 0).toLocaleString()}</Text>
          </View>
        </Card>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default function BillingAnalyticsScreenWrapper(props) {
  return <ThemeProvider><BillingAnalyticsScreen {...props} /></ThemeProvider>;
}

export { BillingAnalyticsScreen };
