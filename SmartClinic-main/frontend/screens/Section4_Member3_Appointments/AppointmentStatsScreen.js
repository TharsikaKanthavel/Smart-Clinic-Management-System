import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Card, ScreenHeader } from '../Section0_SharedTheme/theme';
import { appointmentService } from '../../services/appointmentService';

function AppointmentStatsScreen({ onBack, stats }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(!stats);
  const [data, setData] = useState(stats || { total: 0, pending: 0, approved: 0, completed: 0 });

  useEffect(() => {
    if (stats) return;
    let active = true;
    (async () => {
      try {
        const res = await appointmentService.getStats();
        if (!active) return;
        setData(res?.stats || { total: 0, pending: 0, approved: 0, completed: 0 });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [stats]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Appointment Stats" subtitle="API-based overview" onBack={onBack} />
      <View style={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Summary</Text>
          {[
            ['Total', data.total],
            ['Pending', data.pending],
            ['Approved', data.approved],
            ['Completed', data.completed],
          ].map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSub }}>{k}</Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{v}</Text>
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}

export default function AppointmentStatsScreenWrapper(props) {
  return <ThemeProvider><AppointmentStatsScreen {...props} /></ThemeProvider>;
}

export { AppointmentStatsScreen };
