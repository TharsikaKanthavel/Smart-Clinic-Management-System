import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { reminderService } from '../../services/otherServices';

const TAKEN_COLOR = { Taken: '#34A853', Pending: '#FBBC04', Missed: '#EA4335', Snoozed: '#94A3B8' };

function ReminderListScreen({ onAdd, onSelect, onBack, role = 'Admin', user = null }) {
  const { colors } = useTheme();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState(null);
  const FILTERS = ['All', 'Pending', 'Taken', 'Missed', 'Snoozed'];

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await reminderService.getAll('');
      const all = res.reminders || [];
      if (role === 'Patient') {
        const currentUserId = String(user?.id || user?._id || '');
        const mine = all.filter((r) => String(r?.userId?._id || r?.userId || '') === currentUserId);
        setReminders(mine);
      } else {
        setReminders(all);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role, user?.id, user?._id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const markTaken = async (id) => {
    try {
      await reminderService.markTaken(id);
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const snooze = async (id) => {
    try {
      await reminderService.snooze(id);
      load();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const deleteReminder = (id) => Alert.alert('Delete Reminder', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          await reminderService.delete(id);
          load();
        } catch (e) {
          Alert.alert('Error', e.message);
        }
      },
    },
  ]);

  const askDelete = (id) => {
    const runDelete = async () => {
      try {
        await reminderService.delete(id);
        load();
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    };
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const ok = window.confirm('Delete this reminder?');
      if (ok) runDelete();
      return;
    }
    deleteReminder(id);
  };

  const filteredReminders = useMemo(() => {
    if (filter === 'All') return reminders;
    return reminders.filter((r) => String(r?.takenStatus || 'Pending') === filter);
  }, [reminders, filter]);

  const taken = reminders.filter((r) => r.takenStatus === 'Taken').length;
  const pending = reminders.filter((r) => r.takenStatus === 'Pending').length;
  const missed = reminders.filter((r) => r.takenStatus === 'Missed').length;

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSub, marginTop: 12 }}>Loading reminders...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Medicine Reminders" subtitle="Today's medication schedule" onBack={onBack} />

      <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 14 }}>
        {[
          { label: 'Taken', val: taken, color: '#34A853' },
          { label: 'Pending', val: pending, color: '#FBBC04' },
          { label: 'Missed', val: missed, color: '#EA4335' },
        ].map((s) => (
          <View key={s.label} style={{ flex: 1, alignItems: 'center', backgroundColor: s.color + '15', borderRadius: 12, paddingVertical: 10, borderWidth: 1.5, borderColor: s.color + '44' }}>
            <Text style={{ color: s.color, fontWeight: '900', fontSize: 22 }}>{s.val}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: filter === f ? colors.primary : colors.inputBg, marginRight: 8, borderWidth: 1.5, borderColor: filter === f ? colors.primary : colors.border }}>
              <Text style={{ color: filter === f ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 13 }}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Text style={{ fontSize: 40 }}>!</Text>
          <Text style={{ color: '#EA4335', fontSize: 14, marginTop: 8, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 16, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredReminders}
          keyExtractor={(r) => r._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          renderItem={({ item: r }) => {
            const tc = TAKEN_COLOR[r.takenStatus] || '#888';
            return (
              <TouchableOpacity onPress={() => onSelect?.(r)}>
                <Card style={{ borderLeftWidth: 4, borderLeftColor: tc }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{r.medicineName}</Text>
                      <Text style={{ color: colors.textSub, fontSize: 13 }}>{`${r.dosage || '-'} | ${r.frequency || '-'}`}</Text>
                      <Text style={{ color: colors.textSub, fontSize: 12 }}>{`Time: ${r.reminderTime || '-'} | ${r.reminderType || '-'}`}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{`${r.startDate ? new Date(r.startDate).toLocaleDateString() : '-'} -> ${r.endDate ? new Date(r.endDate).toLocaleDateString() : '-'}`}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Badge label={r.takenStatus || 'Pending'} color={tc} />
                      <Badge label={r.status || 'Active'} color={r.status === 'Active' ? '#34A853' : '#94A3B8'} />
                    </View>
                  </View>
                  {r.takenStatus === 'Pending' ? (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                      <TouchableOpacity onPress={() => markTaken(r._id)} style={{ flex: 1, backgroundColor: '#34A85320', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#34A853' }}>
                        <Text style={{ color: '#34A853', fontWeight: '700', fontSize: 13 }}>Mark Taken</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => snooze(r._id)} style={{ flex: 1, backgroundColor: '#94A3B820', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#94A3B8' }}>
                        <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 13 }}>Snooze</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => askDelete(r._id)} style={{ backgroundColor: '#EA433520', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#EA4335' }}>
                        <Text style={{ color: '#EA4335', fontSize: 13 }}>Del</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </Card>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Text style={{ color: colors.textSub, marginTop: 12 }}>No reminders found</Text></View>}
        />
      )}
      <TouchableOpacity onPress={onAdd} style={{ position: 'absolute', bottom: 30, right: 24, backgroundColor: colors.primary, borderRadius: 28, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', elevation: 6 }}>
        <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ReminderListScreenWrapper(p) {
  return <ThemeProvider><ReminderListScreen {...p} /></ThemeProvider>;
}
export { ReminderListScreen };
