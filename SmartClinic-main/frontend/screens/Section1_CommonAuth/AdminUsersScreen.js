import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme, ThemeProvider, Card, ScreenHeader, Input, Badge } from '../Section0_SharedTheme/theme';
import { authService } from '../../services/authService';

function AdminUsersScreen({ onBack, onAdd, onEdit }) {
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authService.getAllUsers();
      setUsers(Array.isArray(res?.users) ? res.users : []);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const askDelete = (user) => {
    const id = user?._id || user?.id;
    if (!id) {
      Alert.alert('Error', 'User ID not found.');
      return;
    }

    const runDelete = async () => {
      try {
        await authService.deleteUser(id);
        await loadUsers();
      } catch (e) {
        Alert.alert('Error', e?.message || 'Delete failed');
      }
    };

    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const ok = window.confirm(`Delete ${user?.fullName || user?.name || 'this user'}?`);
      if (ok) runDelete();
      return;
    }

    Alert.alert('Delete User', `Delete ${user?.fullName || user?.name || 'this user'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: runDelete },
    ]);
  };

  const q = query.trim().toLowerCase();
  const filtered = users.filter((u) => {
    if (!q) return true;
    const text = `${u?.fullName || ''} ${u?.name || ''} ${u?.email || ''} ${u?.role || ''}`.toLowerCase();
    return text.includes(q);
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Admin Users" subtitle="Add, edit and delete users" onBack={onBack} />

      <View style={{ paddingHorizontal: 20 }}>
        <Card>
          <Input label="Search" placeholder="Search by name, email, role" value={query} onChangeText={setQuery} />
          <TouchableOpacity onPress={onAdd} style={{ marginTop: 8, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>+ Add User</Text>
          </TouchableOpacity>
        </Card>

        {loading ? (
          <Card><Text style={{ color: colors.textSub }}>Loading users...</Text></Card>
        ) : filtered.length === 0 ? (
          <Card><Text style={{ color: colors.textSub }}>No users found</Text></Card>
        ) : (
          filtered.map((u) => (
            <Card key={u._id || u.id}>
              <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{u.fullName || u.name || 'User'}</Text>
              <Text style={{ color: colors.textSub, marginTop: 2 }}>{u.email || 'No email'}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Badge label={u.role || 'User'} color={colors.primary} />
                <Badge label={u.accountStatus || 'Active'} color={(u.accountStatus || 'Active') === 'Active' ? '#34A853' : '#EA4335'} />
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity onPress={() => onEdit?.(u)} style={{ flex: 1, borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => askDelete(u)} style={{ flex: 1, backgroundColor: '#EA4335', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

export default function AdminUsersScreenWrapper(props) {
  return <ThemeProvider><AdminUsersScreen {...props} /></ThemeProvider>;
}

export { AdminUsersScreen };
