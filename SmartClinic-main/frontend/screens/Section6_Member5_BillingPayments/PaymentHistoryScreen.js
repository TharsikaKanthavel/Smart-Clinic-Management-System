import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';

function PaymentHistoryScreen({ onBack, payments = [] }) {
  const { colors } = useTheme();
  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Payment History" subtitle={`${payments.length} transactions`} onBack={onBack} />
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Total Collected</Text>
          <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 20 }}>Rs.{total.toLocaleString()}</Text>
        </Card>
      </View>

      <FlatList
        data={payments}
        keyExtractor={(p, i) => String(p.id || p._id || i)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        renderItem={({ item: p }) => (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{p.patientName || p.patient || 'Patient'}</Text>
              <Text style={{ color: colors.textSub, fontSize: 12 }}>{p.method || p.paymentMethod || 'N/A'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#34A853', fontWeight: '800', fontSize: 16 }}>Rs.{(p.amount || 0).toLocaleString()}</Text>
              <Badge label={p.status || 'Confirmed'} color="#34A853" />
            </View>
          </Card>
        )}
        ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Text style={{ fontSize: 48 }}>{'\u{1F539}'}</Text><Text style={{ color: colors.textSub, marginTop: 12 }}>No payments found</Text></View>}
      />
    </View>
  );
}

export default function PaymentHistoryScreenWrapper(props) {
  return <ThemeProvider><PaymentHistoryScreen {...props} /></ThemeProvider>;
}

export { PaymentHistoryScreen };

