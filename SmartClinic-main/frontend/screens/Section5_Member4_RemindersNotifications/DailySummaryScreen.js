import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, Button, ScreenHeader } from '../Section0_SharedTheme/theme';
import { reminderService } from '../../services/otherServices';

const SCHEDULE = [
  { time: '8:00 AM', meds: ['Amlodipine 5mg', 'Metformin 500mg'] },
  { time: '9:00 PM', meds: ['Aspirin 75mg'] },
  { time: '10:00 PM', meds: ['Cetirizine 10mg'] },
];

const WEEKLY_ADHERENCE = [80, 100, 60, 100, 75, 50, 90];

function DailySummaryScreen({ onBack, role = 'Admin', user = null }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await reminderService.getAll('');
        const all = res.reminders || [];
        if (role === 'Patient') {
          const currentUserId = String(user?.id || user?._id || '');
          const mine = all.filter((r) => String(r?.userId?._id || r?.userId || '') === currentUserId);
          if (mounted) setReminders(mine);
        } else if (mounted) {
          setReminders(all);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [role, user?.id, user?._id]);

  const stats = useMemo(() => {
    const taken = reminders.filter((r) => r.takenStatus === 'Taken').length;
    const missed = reminders.filter((r) => r.takenStatus === 'Missed').length;
    const total = reminders.length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { taken, missed, total, adherence };
  }, [reminders]);

  const ringColor = stats.adherence >= 80 ? '#34A853' : stats.adherence >= 50 ? '#FBBC04' : '#EA4335';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSub, marginTop: 12 }}>Loading summary...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Daily Summary" subtitle={new Date().toDateString()} onBack={onBack} />

      <View style={{ padding: 20 }}>
        <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View style={{ width: 110, height: 110, borderRadius: 55, borderWidth: 10, borderColor: ringColor, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 28 }}>{stats.adherence}%</Text>
          </View>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18 }}>Adherence Rate</Text>
          <Text style={{ color: colors.textSub, fontSize: 13, marginTop: 4 }}>
            {stats.taken} of {stats.total} medicines taken today
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Badge label={`${stats.taken} Taken`} color="#34A853" />
            <Badge label={`${stats.missed} Missed`} color="#EA4335" />
            <Badge label={`${Math.max(stats.total - stats.taken - stats.missed, 0)} Pending`} color="#FBBC04" />
          </View>
        </Card>

        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 17, marginBottom: 12 }}>Today's Schedule</Text>
        {SCHEDULE.map((slot, i) => (
          <Card key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
            <View style={{ backgroundColor: colors.primaryLight, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', minWidth: 56 }}>
              <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 14 }}>{slot.time.split(' ')[0]}</Text>
              <Text style={{ color: colors.primary, fontSize: 10 }}>{slot.time.split(' ')[1]}</Text>
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              {slot.meds.map((m, j) => (
                <View key={j} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>-</Text>
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{m}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 16 }}>Weekly Adherence</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 90 }}>
            {WEEKLY_ADHERENCE.map((pct, i) => {
              const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
              const barColor = pct >= 80 ? '#34A853' : pct >= 50 ? '#FBBC04' : '#EA4335';
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 9 }}>{pct}%</Text>
                  <View style={{ width: '100%', height: (pct / 100) * 60, backgroundColor: barColor, borderRadius: 4 }} />
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>{days[i]}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Button title="Export Summary Report" onPress={() => {}} variant="outline" />
      </View>
    </ScrollView>
  );
}

export default function DailySummaryScreenWrapper(props) {
  return <ThemeProvider><DailySummaryScreen {...props} /></ThemeProvider>;
}
export { DailySummaryScreen };
