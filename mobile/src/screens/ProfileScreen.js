import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={s.container}>
      <View style={s.avatarContainer}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
      </View>

      <View style={s.section}>
        <View style={s.card}>
          <Text style={s.cardLabel}>Account</Text>
          <Text style={s.cardValue}>{user?.email}</Text>
        </View>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>🚪 Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 20 },
  avatarContainer: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#6366f1',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: '#f1f5f9' },
  email: { fontSize: 14, color: '#64748b', marginTop: 4 },
  section: { marginBottom: 24 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, padding: 16,
  },
  cardLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', marginBottom: 4 },
  cardValue: { fontSize: 15, color: '#e2e8f0' },
  logoutBtn: {
    backgroundColor: '#ef444411', borderWidth: 1, borderColor: '#ef444433',
    borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
});
