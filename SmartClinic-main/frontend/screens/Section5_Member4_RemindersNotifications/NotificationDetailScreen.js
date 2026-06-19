import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeProvider, Card, Badge, Button } from '../Section0_SharedTheme/theme';

const TYPE_COLOR = {
  Appointment: '#1A73E8',
  Medicine: '#34A853',
  System: '#64748B',
  Announcement: '#7C3AED',
  Emergency: '#C62828',
};

const TYPE_ICON = {
  Appointment: 'calendar-outline',
  Medicine: 'medical-outline',
  System: 'settings-outline',
  Announcement: 'megaphone-outline',
  Emergency: 'warning-outline',
};

function NotificationDetailScreen({ notification = null, onBack, onDelete, onMarkRead }) {
  const { colors } = useTheme();

  if (!notification) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSub, fontSize: 15, marginTop: 12 }}>No data available</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 20, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const notif = notification;
  const type = notif.notificationType || 'System';
  const nc = TYPE_COLOR[type] || '#888';
  const icon = TYPE_ICON[type] || 'notifications-outline';
  const notifId = notif._id || notif.id;
  const isUnread = (notif.status || 'Unread') === 'Unread';

  const runDelete = () => {
    if (!notifId) {
      Alert.alert('Error', 'Notification ID not found.');
      return;
    }
    onDelete?.(notifId);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: nc, paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <TouchableOpacity onPress={onBack}><Text style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 12 }}>Back</Text></TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={icon} size={26} color="#fff" />
          </View>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{notif.notificationId || notifId}</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{`${type} Notification`}</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: 20 }}>
        <Card>
          <Text style={{ color: colors.textSub, fontSize: 11, fontWeight: '600', marginBottom: 8 }}>MESSAGE</Text>
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22, fontWeight: '500' }}>{notif.message || '-'}</Text>
        </Card>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Details</Text>
          {[
            ['Recipient', notif.userId === 'ALL' ? 'All Users' : (notif.userId?.fullName || notif.userId || '-')],
            ['Delivery Method', notif.deliveryMethod || '-'],
            ['Priority', notif.priorityLevel || 'Medium'],
            ['Status', notif.status || 'Unread'],
            ['Sent At', notif.createdAt ? new Date(notif.createdAt).toLocaleString() : '-'],
            ['Updated At', notif.updatedAt ? new Date(notif.updatedAt).toLocaleString() : '-'],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSub, fontSize: 13, width: 130 }}>{label}</Text>
              <View style={{ flex: 1 }}>
                {label === 'Priority' ? (
                  <Badge label={String(val)} color={val === 'High' ? '#EA4335' : val === 'Medium' ? '#FBBC04' : '#94A3B8'} />
                ) : label === 'Status' ? (
                  <Badge label={String(val)} color={val === 'Unread' ? nc : '#94A3B8'} />
                ) : (
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{String(val)}</Text>
                )}
              </View>
            </View>
          ))}
        </Card>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {isUnread ? <Button title="Mark Read" onPress={() => onMarkRead?.(notifId)} style={{ flex: 1 }} /> : null}
          <Button title="Delete" onPress={runDelete} variant="danger" style={{ flex: 1 }} />
        </View>
      </View>
    </ScrollView>
  );
}

export default function NotificationDetailScreenWrapper(props) {
  return <ThemeProvider><NotificationDetailScreen {...props} /></ThemeProvider>;
}

export { NotificationDetailScreen };
