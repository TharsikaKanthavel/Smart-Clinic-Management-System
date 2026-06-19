import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, Button } from '../Section0_SharedTheme/theme';

const TAKEN_CONFIG = {
  Taken: { color: '#34A853', label: 'Taken' },
  Pending: { color: '#FBBC04', label: 'Pending' },
  Missed: { color: '#EA4335', label: 'Missed' },
  Snoozed: { color: '#94A3B8', label: 'Snoozed' },
};

function ReminderDetailScreen({ reminder, onBack, onEdit, onDelete, onMarkTaken, onSnooze, onToggleStatus }) {
  const { colors } = useTheme();

  if (!reminder) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSub, fontSize: 15, marginTop: 12 }}>No reminder selected</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tc = TAKEN_CONFIG[reminder.takenStatus] || TAKEN_CONFIG.Pending;
  const reminderId = reminder._id || reminder.id;

  const confirmDelete = () => {
    const runDelete = () => onDelete?.(reminderId);
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const ok = window.confirm('Delete this reminder?');
      if (ok) runDelete();
      return;
    }
    Alert.alert('Delete Reminder', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: runDelete },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.primary, paddingTop: 56, paddingBottom: 28, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <TouchableOpacity onPress={onBack} style={{ position: 'absolute', top: 56, left: 24 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{reminder.medicineName || 'Medicine'}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>{reminder.dosage || '-'}</Text>
        <Badge label={tc.label} color="#fff" />
      </View>

      <View style={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Reminder Info</Text>
          {[
            ['Frequency', reminder.frequency],
            ['Time', reminder.reminderTime],
            ['Start Date', reminder.startDate ? new Date(reminder.startDate).toLocaleDateString() : '-'],
            ['End Date', reminder.endDate ? new Date(reminder.endDate).toLocaleDateString() : '-'],
            ['Type', reminder.reminderType || reminder.type || '-'],
            ['Status', reminder.status || 'Active'],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSub, fontSize: 13, width: 100 }}>{label}</Text>
              <Text style={{ flex: 1, color: colors.text, fontWeight: '600', fontSize: 13 }}>{val || 'N/A'}</Text>
            </View>
          ))}
        </Card>

        <View style={{ gap: 10 }}>
          {reminder.takenStatus === 'Pending' ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Mark Taken" onPress={() => onMarkTaken?.(reminderId)} style={{ flex: 1 }} />
              <Button title="Snooze" onPress={() => onSnooze?.(reminderId)} variant="outline" style={{ flex: 1 }} />
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Edit Reminder" onPress={onEdit} style={{ flex: 1 }} />
            <Button title={reminder.status === 'Active' ? 'Disable' : 'Enable'} onPress={() => onToggleStatus?.(reminderId)} variant="outline" style={{ flex: 1 }} />
          </View>

          <Button title="Delete Reminder" onPress={confirmDelete} variant="danger" />
        </View>
      </View>
    </ScrollView>
  );
}

export default function ReminderDetailScreenWrapper(props) {
  return <ThemeProvider><ReminderDetailScreen {...props} /></ThemeProvider>;
}

export { ReminderDetailScreen };
