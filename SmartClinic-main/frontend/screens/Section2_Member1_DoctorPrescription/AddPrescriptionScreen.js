import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Switch, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Button, Input, Card, ScreenHeader } from '../Section0_SharedTheme/theme';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';

const normalizeMedicines = (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    return [{ name: '', dosage: '', instructions: '', duration: '', quantity: '' }];
  }
  return list.map((m) => ({
    name: m.name || m.medicineName || '',
    dosage: m.dosage || '',
    instructions: m.instructions || m.freq || '',
    duration: m.duration || '',
    quantity: String(m.quantity ?? m.qty ?? ''),
  }));
};

function AddPrescriptionScreen({ prescription, onBack, onSave, role, user }) {
  const { colors } = useTheme();
  const isEdit = !!prescription;

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  const [form, setForm] = useState({
    patientId: typeof prescription?.patientId === 'object' ? prescription?.patientId?._id : (prescription?.patientId || ''),
    doctorId: typeof prescription?.doctorId === 'object' ? prescription?.doctorId?._id : (prescription?.doctorId || ''),
    diagnosis: prescription?.diagnosis || '',
    notes: prescription?.notes || '',
    followUp: prescription?.followUpDate ? String(prescription.followUpDate).slice(0, 10) : (prescription?.followUp || ''),
    refill: !!prescription?.refillAllowed,
    medicines: normalizeMedicines(prescription?.medicines),
  });

  useEffect(() => {
    let active = true;
    const loadRefs = async () => {
      try {
        setLoadingRefs(true);
        const [patientRes, doctorRes] = await Promise.all([
          patientService.getAll(''),
          doctorService.getAll(''),
        ]);
        if (!active) return;
        setPatients(patientRes?.patients || []);
        
        let allDrs = doctorRes?.doctors || [];
        if (role === 'Doctor') {
           const loggedEmail = String(user?.email || '').toLowerCase();
           const loggedName = String(user?.fullName || user?.name || '').toLowerCase();
           const found = allDrs.find(d => {
              const dEmail = String(d.email || '').toLowerCase();
              const dName = String(d.doctorName || d.name || '').toLowerCase();
              return (loggedEmail && dEmail === loggedEmail) || (loggedName && dName === loggedName);
           });
           if (found) {
              allDrs = [found];
              if (!form.doctorId && !isEdit) {
                 setForm(f => ({ ...f, doctorId: found._id }));
              }
           }
        }
        setDoctors(allDrs);
      } catch {
        if (!active) return;
        setPatients([]);
        setDoctors([]);
      } finally {
        if (active) setLoadingRefs(false);
      }
    };

    loadRefs();
    return () => { active = false; };
  }, [role, user?.email, user?.name, user?.fullName, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addMed = () => setForm((f) => ({ ...f, medicines: [...f.medicines, { name: '', dosage: '', instructions: '', duration: '', quantity: '' }] }));
  const removeMed = (i) => setForm((f) => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
  const updMed = (i, k, v) => setForm((f) => {
    const m = [...f.medicines];
    m[i] = { ...m[i], [k]: v };
    return { ...f, medicines: m };
  });

  const renderSelectionChips = (items, currentId, onChoose, getLabel) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      {items.map((item) => {
        const id = item?._id;
        const selected = currentId === id;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => onChoose(id)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: selected ? colors.primary : colors.inputBg,
              borderWidth: 1,
              borderColor: selected ? colors.primary : colors.border,
            }}
          >
            <Text style={{ color: selected ? '#fff' : colors.textSub, fontSize: 12, fontWeight: '600' }}>{getLabel(item)}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const submit = () => {
    const medicines = form.medicines
      .map((m) => ({
        medicineName: (m.name || '').trim(),
        dosage: (m.dosage || '').trim(),
        instructions: (m.instructions || '').trim(),
        duration: (m.duration || '').trim(),
        quantity: Number(m.quantity || 0),
      }))
      .filter((m) => m.medicineName);

    onSave?.({
      patientId: form.patientId,
      doctorId: form.doctorId,
      diagnosis: form.diagnosis,
      notes: form.notes,
      followUp: form.followUp,
      refill: form.refill,
      medicines,
    });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={isEdit ? 'Edit Prescription' : 'New Prescription'} subtitle="Fill prescription details" onBack={onBack} />

        <View style={{ padding: 24 }}>
          {loadingRefs ? (
            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.textSub, marginTop: 6 }}>Loading doctors and patients...</Text>
            </View>
          ) : null}

          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 6 }}>Select Patient</Text>
          {renderSelectionChips(patients, form.patientId, (id) => set('patientId', id), (p) => `${p.patientName || p.name || 'Patient'} (${p.patientId || 'No ID'})`)}

          {role === 'Admin' && (
            <>
              <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 6 }}>Select Doctor</Text>
              {renderSelectionChips(doctors, form.doctorId, (id) => set('doctorId', id), (d) => `${d.doctorName || d.name || 'Doctor'} (${d.specialization || 'General'})`)}
              <Input label="Doctor ID (Mongo)" placeholder="Doctor object ID" value={form.doctorId} onChangeText={(v) => set('doctorId', v)} />
            </>
          )}
          <Input label="Patient ID (Mongo)" placeholder="Patient object ID" value={form.patientId} onChangeText={(v) => set('patientId', v)} />

          <Input label="Diagnosis" placeholder="Enter diagnosis" value={form.diagnosis} onChangeText={(v) => set('diagnosis', v)} />

          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Medicines</Text>
          {form.medicines.map((m, i) => (
            <Card key={i} style={{ borderLeftWidth: 3, borderLeftColor: colors.primary }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{`Medicine #${i + 1}`}</Text>
                {form.medicines.length > 1 && (
                  <TouchableOpacity onPress={() => removeMed(i)}>
                    <Text style={{ color: colors.danger, fontSize: 14, fontWeight: '700' }}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Input placeholder="Medicine name" value={m.name} onChangeText={(v) => updMed(i, 'name', v)} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}><Input placeholder="Dosage" value={m.dosage} onChangeText={(v) => updMed(i, 'dosage', v)} /></View>
                <View style={{ flex: 1 }}><Input placeholder="Quantity" value={m.quantity} onChangeText={(v) => updMed(i, 'quantity', v)} keyboardType="numeric" /></View>
              </View>
              <Input placeholder="Instructions" value={m.instructions} onChangeText={(v) => updMed(i, 'instructions', v)} />
              <Input placeholder="Duration (e.g. 14 days)" value={m.duration} onChangeText={(v) => updMed(i, 'duration', v)} />
            </Card>
          ))}

          <Button title="+ Add Another Medicine" onPress={addMed} variant="outline" style={{ marginBottom: 18 }} />

          <Input label="Notes / Instructions" placeholder="Additional instructions for patient" value={form.notes} onChangeText={(v) => set('notes', v)} />
          <Input label="Follow-up Date" placeholder="YYYY-MM-DD" value={form.followUp} onChangeText={(v) => set('followUp', v)} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.inputBg, borderRadius: 12, padding: 16, marginBottom: 22, borderWidth: 1, borderColor: colors.border }}>
            <View>
              <Text style={{ color: colors.text, fontWeight: '600' }}>Allow Prescription Refill</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Patient can request a refill</Text>
            </View>
            <Switch value={form.refill} onValueChange={(v) => set('refill', v)} trackColor={{ false: colors.border, true: colors.primary }} />
          </View>

          <Button title={isEdit ? 'Save Changes' : 'Save Prescription'} onPress={submit} icon="💾" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function AddPrescriptionScreenWrapper(props) {
  return <ThemeProvider><AddPrescriptionScreen {...props} /></ThemeProvider>;
}

export { AddPrescriptionScreen };
