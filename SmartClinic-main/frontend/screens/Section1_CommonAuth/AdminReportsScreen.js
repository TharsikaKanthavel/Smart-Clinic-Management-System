import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Card, ScreenHeader } from '../Section0_SharedTheme/theme';
import { appointmentService } from '../../services/appointmentService';
import { billingService, labTestService } from '../../services/otherServices';
import { prescriptionService } from '../../services/prescriptionService';

function AdminReportsScreen({ onBack, onOpenAppointments, onOpenBilling, onOpenLab, onOpenPrescription }) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    appointments: { total: 0, pending: 0, approved: 0, completed: 0 },
    billing: { count: 0, revenue: 0, outstanding: 0 },
    labs: { total: 0, completed: 0, pending: 0 },
    prescriptions: { total: 0, refillAllowed: 0 },
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [a, b, l, p] = await Promise.all([
          appointmentService.getStats(),
          billingService.getAnalytics(),
          labTestService.getAnalytics(),
          prescriptionService.getAnalytics(),
        ]);
        if (!active) return;
        setData({
          appointments: a?.stats || { total: 0, pending: 0, approved: 0, completed: 0 },
          billing: b?.analytics || { count: 0, revenue: 0, outstanding: 0 },
          labs: l?.analytics || { total: 0, completed: 0, pending: 0 },
          prescriptions: p?.analytics || { total: 0, refillAllowed: 0 },
        });
      } catch {
        if (!active) return;
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Admin Reports" subtitle="Live analytics overview" onBack={onBack} />
      <View style={{ paddingHorizontal: 20 }}>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Appointments</Text>
          <Text style={{ color: colors.textSub }}>{`Total: ${data.appointments.total} | Pending: ${data.appointments.pending} | Approved: ${data.appointments.approved} | Completed: ${data.appointments.completed}`}</Text>
          <TouchableOpacity onPress={onOpenAppointments} style={{ marginTop: 12, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Open Appointment Report</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Billing</Text>
          <Text style={{ color: colors.textSub }}>{`Bills: ${data.billing.count} | Revenue: Rs.${Number(data.billing.revenue || 0).toLocaleString()} | Outstanding: Rs.${Number(data.billing.outstanding || 0).toLocaleString()}`}</Text>
          <TouchableOpacity onPress={onOpenBilling} style={{ marginTop: 12, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Open Billing Report</Text>
          </TouchableOpacity>
        </Card>
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

export default function AdminReportsScreenWrapper(props) {
  return <ThemeProvider><AdminReportsScreen {...props} /></ThemeProvider>;
}

export { AdminReportsScreen };
