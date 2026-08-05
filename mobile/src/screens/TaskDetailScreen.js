import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import api from '../api/axios';

const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function TaskDetailScreen({ route, navigation }) {
  const { task } = route.params;

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await api.delete(`/tasks/${task._id}`); navigation.goBack(); }
          catch { Alert.alert('Error', 'Failed to delete'); }
        },
      },
    ]);
  };

  const handleToggle = async () => {
    try {
      await api.put(`/tasks/${task._id}`, { completed: !task.completed });
      navigation.goBack();
    } catch { Alert.alert('Error', 'Failed to update'); }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.title}>{task.title}</Text>
        <View style={s.badges}>
          <View style={[s.badge, { backgroundColor: priorityColors[task.priority] + '22', borderColor: priorityColors[task.priority] + '44' }]}>
            <Text style={[s.badgeText, { color: priorityColors[task.priority] }]}>{task.priority}</Text>
          </View>
          <View style={s.categoryBadge}>
            <Text style={s.categoryText}>{task.category}</Text>
          </View>
          {task.completed && (
            <View style={[s.badge, { backgroundColor: '#10b98122', borderColor: '#10b98144' }]}>
              <Text style={[s.badgeText, { color: '#10b981' }]}>✓ Done</Text>
            </View>
          )}
        </View>
      </View>

      {task.description ? (
        <View style={s.section}>
          <Text style={s.sectionLabel}>Description</Text>
          <Text style={s.description}>{task.description}</Text>
        </View>
      ) : null}

      <View style={s.detailsCard}>
        <DetailRow label="📅 Due Date" value={task.dueDate ? new Date(task.dueDate).toLocaleString() : 'Not set'} />
        <DetailRow label="⏰ Reminder" value={task.reminderAt ? new Date(task.reminderAt).toLocaleString() : 'Not set'} />
        <DetailRow label="📂 Category" value={task.category} />
        <DetailRow label="📋 Created" value={new Date(task.createdAt).toLocaleDateString()} />
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.actionBtn} onPress={handleToggle}>
          <Text style={s.actionText}>{task.completed ? '↩️ Mark Pending' : '✅ Mark Complete'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('EditTask', { task })}>
          <Text style={s.actionText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, s.deleteBtn]} onPress={handleDelete}>
          <Text style={[s.actionText, { color: '#ef4444' }]}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#f1f5f9', marginBottom: 12 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  description: { fontSize: 15, color: '#cbd5e1', lineHeight: 22 },
  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 16, gap: 14,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 14, color: '#64748b' },
  detailValue: { fontSize: 14, color: '#e2e8f0', fontWeight: '500' },
  actions: { marginTop: 24, gap: 10 },
  actionBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  actionText: { fontSize: 15, fontWeight: '600', color: '#e2e8f0' },
  deleteBtn: { borderColor: '#ef444433', backgroundColor: '#ef444411' },
});
