import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeProvider, Card, Badge, ScreenHeader } from '../Section0_SharedTheme/theme';
import { notificationService } from '../../services/otherServices';

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

function NotificationListScreen({ onBack, onSelect, role = 'Admin', user = null }) {
  const { colors } = useTheme();
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const FILTERS = ['All', 'Appointment', 'Medicine', 'System', 'Announcement', 'Emergency'];

  const load = useCallback(async () => {
    try {
      setError(null);
      const [nRes, uRes] = await Promise.all([
        notificationService.getAll(''),
        notificationService.getUnreadCount(),
      ]);
      setAllNotifications(nRes.notifications || []);
      setUnreadCount(uRes.unreadCount ?? uRes.count ?? 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const scopedNotifications = useMemo(() => {
    if (role === 'Admin') return allNotifications;
    
    const loggedUserId = String(user?.id || user?._id || '');
    const isPatient = role === 'Patient';
    const isDoctor = role === 'Doctor';

    const myAudiences = new Set(['', 'all users']);
    if (isPatient) myAudiences.add('patients only');
    if (isDoctor) myAudiences.add('doctors only');

    return allNotifications.filter((n) => {
      const nUserId = String(n?.userId?._id || n?.userId || '');
      const audience = String(n?.audience || '').toLowerCase();
      
      const isTargetedToMe = loggedUserId && nUserId === loggedUserId;
      const isMyAudience = myAudiences.has(audience);
      const isBroadcastToMe = !nUserId && isMyAudience;

      return isTargetedToMe || isBroadcastToMe;
    });
  }, [allNotifications, role, user?.id, user?._id]);

  const notifications = useMemo(() => {
    const base = scopedNotifications;
    if (filter === 'All') return base;
    return base.filter((n) => (n.notificationType || '').toLowerCase() === filter.toLowerCase());
  }, [scopedNotifications, filter]);

  useEffect(() => {
    const count = scopedNotifications.filter((n) => (n.status || 'Unread') === 'Unread').length;
    setUnreadCount(count);
  }, [scopedNotifications]);

  const markAllRead = async () => {
    try {
      const payload = (role === 'Patient' || role === 'Doctor')
        ? { userId: user?.id || user?._id }
        : {};
      await notificationService.markAllRead(payload);
      await load();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const deleteNotif = (id) => {
    const runDelete = async () => {
      try {
        await notificationService.delete(id);
        await load();
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    };

    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Delete this notification?')) runDelete();
      return;
    }

    Alert.alert('Delete', 'Delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: runDelete },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSub, marginTop: 12 }}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.primary, paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        {onBack ? <TouchableOpacity onPress={onBack}><Text style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 10 }}>Back</Text></TouchableOpacity> : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Notifications</Text>
            {unreadCount > 0 ? <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{`${unreadCount} unread`}</Text> : null}
          </View>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Mark All Read</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 14, marginBottom: 4 }}>
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
          <Text style={{ color: '#EA4335', fontSize: 14, marginTop: 8, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 16, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => String(n._id || n.id || n.notificationId)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 }}
          renderItem={({ item: n }) => {
            const type = n.notificationType || 'System';
            const tc = TYPE_COLOR[type] || '#888';
            const ti = TYPE_ICON[type] || 'notifications-outline';
            const isUnread = (n.status || 'Unread') === 'Unread';
            return (
              <TouchableOpacity onPress={() => onSelect?.(n)}>
                <Card style={{ borderLeftWidth: 4, borderLeftColor: tc, backgroundColor: isUnread ? `${tc}10` : colors.card }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${tc}20`, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={ti} size={20} color={tc} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ color: colors.text, fontWeight: isUnread ? '700' : '600', fontSize: 14, flex: 1 }}>{n.title || 'Notification'}</Text>
                        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                          <Badge label={n.priorityLevel || 'Medium'} color={n.priorityLevel === 'High' ? '#C62828' : n.priorityLevel === 'Low' ? '#94A3B8' : '#FBBC04'} />
                          {role === 'Admin' && (
                            <TouchableOpacity onPress={() => deleteNotif(n._id)}>
                              <Ionicons name="trash-outline" size={18} color="#EA4335" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <Text style={{ color: colors.textSub, fontSize: 13, marginTop: 2 }}>{n.message}</Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' }}>
                        <Badge label={type} color={tc} />
                        {isUnread ? <Badge label="Unread" color={colors.primary} /> : null}
                        <Text style={{ color: colors.textMuted, fontSize: 11, marginLeft: 'auto' }}>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingTop: 60 }}><Text style={{ color: colors.textSub, marginTop: 12 }}>No notifications</Text></View>}
        />
      )}
    </View>
  );
}

export default function NotificationListScreenWrapper(p) {
  return <ThemeProvider><NotificationListScreen {...p} /></ThemeProvider>;
}

export { NotificationListScreen };
