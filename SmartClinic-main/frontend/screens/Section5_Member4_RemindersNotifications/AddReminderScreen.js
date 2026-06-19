import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Switch, Alert } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, ScreenHeader } from '../Section0_SharedTheme/theme';

const FREQUENCIES = ['Once daily','Twice daily','Three times daily','Every 6 hours','Every 8 hours','Weekly','As needed'];
const TYPES = ['Daily','Weekly','Monthly'];
const TIME_SLOTS = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','12:00 PM','2:00 PM','4:00 PM','6:00 PM','8:00 PM','9:00 PM','10:00 PM'];

function AddReminderScreen({ reminder, onBack, onSave, onDelete }) {
  const { colors } = useTheme();
  const isEdit = !!reminder;
  const [form, setForm] = useState(reminder || { medicineName: '', dosage: '', frequency: 'Once daily', reminderTime: '8:00 AM', startDate: '', endDate: '', reminderType: 'Daily', status: 'Active' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!String(form.medicineName || '').trim()) {
      Alert.alert('Validation', 'Medicine name is required.');
      return;
    }
    if (!String(form.reminderTime || '').trim()) {
      Alert.alert('Validation', 'Reminder time is required.');
      return;
    }
    onSave?.({
      ...form,
      medicineName: String(form.medicineName || '').trim(),
      dosage: String(form.dosage || '').trim(),
      frequency: form.frequency || 'Once daily',
      reminderType: form.reminderType || form.type || 'Daily',
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={isEdit ? 'Edit Reminder' : 'Add Reminder'} subtitle={isEdit ? 'Update reminder details' : 'Set up a new medicine reminder'} onBack={onBack} />

        <View style={{ padding: 24 }}>
          <Input label="Medicine Name" placeholder="e.g. Metformin" value={form.medicineName} onChangeText={(v) => set('medicineName', v)} icon="M" />
          <Input label="Dosage" placeholder="e.g. 500mg" value={form.dosage} onChangeText={(v) => set('dosage', v)} icon="D" />

          <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Frequency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity key={f} onPress={() => set('frequency', f)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: form.frequency === f ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: form.frequency === f ? colors.primary : colors.border }}>
                <Text style={{ color: form.frequency === f ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 12 }}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Reminder Type</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {TYPES.map((t) => (
              <TouchableOpacity key={t} onPress={() => set('reminderType', t)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: form.reminderType === t ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: form.reminderType === t ? colors.primary : colors.border }}>
                <Text style={{ color: form.reminderType === t ? '#fff' : colors.textSub, fontWeight: '600', fontSize: 13 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: colors.textSub, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Reminder Time</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {TIME_SLOTS.map((t) => (
              <TouchableOpacity key={t} onPress={() => set('reminderTime', t)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: form.reminderTime === t ? colors.primary : colors.inputBg, borderWidth: 1.5, borderColor: form.reminderTime === t ? colors.primary : colors.border }}>
                <Text style={{ color: form.reminderTime === t ? '#fff' : colors.text, fontWeight: '600', fontSize: 12 }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Start Date" placeholder="YYYY-MM-DD" value={form.startDate ? String(form.startDate).slice(0, 10) : ''} onChangeText={(v) => set('startDate', v)} icon="S" />
          <Input label="End Date" placeholder="YYYY-MM-DD" value={form.endDate ? String(form.endDate).slice(0, 10) : ''} onChangeText={(v) => set('endDate', v)} icon="E" />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.inputBg, borderRadius: 12, padding: 16, marginBottom: 22, borderWidth: 1, borderColor: colors.border }}>
            <View>
              <Text style={{ color: colors.text, fontWeight: '600' }}>Enable Reminder</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Receive alerts for this medicine</Text>
            </View>
            <Switch value={form.status === 'Active'} onValueChange={(v) => set('status', v ? 'Active' : 'Disabled')} trackColor={{ false: colors.border, true: colors.primary }} />
          </View>

          <Button title={isEdit ? 'Save Changes' : 'Add Reminder'} onPress={submit} icon="OK" />
          {isEdit ? <Button title="Delete Reminder" variant="danger" onPress={() => onDelete?.(form._id || form.id)} icon="DEL" style={{ marginTop: 10 }} /> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function AddReminderScreenWrapper(props) {
  return <ThemeProvider><AddReminderScreen {...props} /></ThemeProvider>;
}
export { AddReminderScreen };
