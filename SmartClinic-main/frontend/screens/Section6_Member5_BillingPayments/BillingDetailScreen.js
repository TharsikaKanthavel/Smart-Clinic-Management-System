import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Linking } from 'react-native';
import { useTheme, ThemeProvider, Card, Button, Badge } from '../Section0_SharedTheme/theme';
import { FILE_URL } from '../../services/api';
function BillingDetailScreen({ bill = null, onBack, onEdit, onDelete, onRecordPayment, userRole = 'Patient', onUploadEvidence, onApproveEvidence }) {
  const { colors } = useTheme();

  const STATUS_COLOR = { 
    Paid: colors.success, 
    Partial: colors.warning, 
    Unpaid: colors.danger, 
    Overdue: '#C62828',
    Cancelled: colors.textMuted
  };

  if (!bill) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ fontSize: 40 }}>{'\u{1F539}'}</Text>
        <Text style={{ color: colors.textSub, fontSize: 15, marginTop: 12 }}>No data available</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const b = bill;
  const sc = STATUS_COLOR[b.paymentStatus] || colors.textSub;
  const totalAmount = Number(b.totalAmount) || 0;
  const paidAmount = Number(b.paidAmount) || 0;
  const discount = Number(b.discount) || 0;
  const balanceDue = Number(b.balanceDue ?? (totalAmount - paidAmount)) || 0;
  const paidPct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
  const items = Array.isArray(b.items) ? b.items : [];
  
  const isManagement = userRole === 'Admin' || userRole === 'Staff' || userRole === 'Doctor';
  const isPendingEvidence = b.evidenceStatus === 'Pending';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: sc, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 12 }}>← Back</Text></TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Invoice ID</Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{b.billId || b.id || b._id}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{b.invoiceDate ? new Date(b.invoiceDate).toLocaleDateString() : 'N/A'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#fff', fontSize: 30 }}>💰</Text>
            <Badge label={`${b.paymentStatus}`} color="rgba(255,255,255,0.4)" />
          </View>
        </View>
      </View>

      <View style={{ padding: 20 }}>
        {/* Evidence Status Card */}
        {b.paymentEvidence ? (
          <Card style={{ padding: 12, backgroundColor: b.evidenceStatus === 'Approved' ? '#E8F5E9' : b.evidenceStatus === 'Rejected' ? '#FFEBEE' : '#FFF8E1' }}>
             <Text style={{ fontWeight: '800', fontSize: 13, marginBottom: 8, color: '#333' }}>🛡️ PAYMENT EVIDENCE</Text>
             <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => Linking.openURL(`${FILE_URL}${b.paymentEvidence}`)} style={{ width: 80, height: 80, backgroundColor: '#ddd', borderRadius: 8, overflow: 'hidden' }}>
                   <Image source={{ uri: `${FILE_URL}${b.paymentEvidence}` }} style={{ width: '100%', height: '100%' }} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                   <Text style={{ fontWeight: '700', color: b.evidenceStatus === 'Approved' ? '#2E7D32' : b.evidenceStatus === 'Rejected' ? '#C62828' : '#F57F17' }}>
                      Status: {b.evidenceStatus}
                   </Text>
                   <Text style={{ fontSize: 11, color: '#666' }}>Uploaded on {new Date(b.updatedAt).toLocaleDateString()}</Text>
                </View>
                {isManagement && b.evidenceStatus === 'Pending' && (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                     <TouchableOpacity onPress={() => onApproveEvidence(b._id, 'Approved')} style={{ backgroundColor: '#4CAF50', padding: 8, borderRadius: 8 }}><Text style={{ color: '#fff' }}>✅</Text></TouchableOpacity>
                     <TouchableOpacity onPress={() => onApproveEvidence(b._id, 'Rejected')} style={{ backgroundColor: '#F44336', padding: 8, borderRadius: 8 }}><Text style={{ color: '#fff' }}>❌</Text></TouchableOpacity>
                  </View>
                )}
             </View>
          </Card>
        ) : (
          !isManagement && !['Paid', 'Cancelled'].includes(b.paymentStatus) && (
            <Card style={{ borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', padding: 20 }}>
               <Text style={{ fontSize: 32, marginBottom: 10 }}>📸</Text>
               <Text style={{ fontWeight: '700', color: colors.primary }}>Paid offline?</Text>
               <Text style={{ fontSize: 12, color: colors.textSub, textAlign: 'center', marginTop: 4 }}>Upload your receipt or payment confirmation here for admin approval.</Text>
               <Button title="Upload Evidence" onPress={onUploadEvidence} style={{ marginTop: 14, height: 40 }} />
            </Card>
          )
        )}

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14, marginTop: 14 }}>
          <Card style={{ flex: 1, margin: 0 }}>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>PATIENT</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{b.patientId?.patientName || b.patientId?.name || 'Patient'}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>{b.patientId?.patientId || 'N/A'}</Text>
          </Card>
          <Card style={{ flex: 1, margin: 0 }}>
            <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 4 }}>DOCTOR</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>{b.doctorId?.name || 'Doctor'}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>{b.doctorId?.specialization || 'N/A'}</Text>
          </Card>
        </View>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 14 }}>Payment Summary</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: colors.textSub, fontSize: 13 }}>Total Amount</Text>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>Rs.{totalAmount.toLocaleString()}</Text>
          </View>
          {discount > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: colors.textSub, fontSize: 13 }}>Discount Applied</Text>
              <Text style={{ color: '#00897B', fontWeight: '700', fontSize: 14 }}>- Rs.{discount.toLocaleString()}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: colors.textSub, fontSize: 13 }}>Amount Paid</Text>
            <Text style={{ color: '#34A853', fontWeight: '700', fontSize: 14 }}>Rs.{paidAmount.toLocaleString()}</Text>
          </View>
          <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5, marginBottom: 6 }}>
            <View style={{ height: '100%', width: `${Math.max(0, Math.min(100, paidPct))}%`, backgroundColor: '#34A853', borderRadius: 5 }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{paidPct}% paid</Text>
            {balanceDue > 0 && <Text style={{ color: sc.color, fontWeight: '700', fontSize: 13 }}>Balance Due: Rs.{balanceDue.toLocaleString()}</Text>}
          </View>
        </Card>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Invoice Items</Text>
          {items.length === 0 && <Text style={{ color: colors.textMuted, fontSize: 13 }}>No items</Text>}
          {items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: i < items.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>{item.description || 'Item'}</Text>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>Rs.{(Number(item.amount) || 0).toLocaleString()}</Text>
            </View>
          ))}
        </Card>

        {isManagement && b.paymentStatus !== 'Paid' && (
          <Button title="💳 Record Manual Payment" onPress={onRecordPayment} icon="➕" style={{ marginBottom: 10 }} />
        )}
        <Button title="🖨️ Print Invoice" onPress={() => typeof window !== 'undefined' && window.print && window.print()} variant="outline" style={{ marginBottom: 10 }} />
        {isManagement && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="🗑️ Delete" onPress={onDelete} variant="danger" style={{ flex: 1 }} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default BillingDetailScreen;
export { BillingDetailScreen };




