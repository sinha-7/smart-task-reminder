import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/axios';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/tasks', { params: { limit: 5, sortBy: 'dueDate', order: 'asc', completed: 'false' } }),
      ]);
      setStats(statsRes.data.data);
      setTasks(tasksRes.data.data.tasks);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const statCards = [
    { icon: '📋', label: 'Pending', value: stats?.pending, color: '#6366f1' },
    { icon: '✅', label: 'Completed', value: stats?.completed, color: '#10b981' },
    { icon: '⏰', label: 'Reminders', value: stats?.upcomingReminders, color: '#f59e0b' },
    { icon: '🔥', label: 'Overdue', value: stats?.overdue, color: '#ef4444' },
  ];

  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
    >
      <Text style={s.heading}>Dashboard</Text>
      <Text style={s.subheading}>Overview of your tasks</Text>

      <View style={s.grid}>
        {statCards.map((card) => (
          <View key={card.label} style={[s.card, { borderColor: card.color + '33' }]}>
            <Text style={{ fontSize: 24 }}>{card.icon}</Text>
            <Text style={s.cardValue}>{card.value ?? '—'}</Text>
            <Text style={s.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Upcoming Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
            <Text style={s.viewAll}>View all →</Text>
          </TouchableOpacity>
        </View>

        {tasks.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40 }}>🎉</Text>
            <Text style={s.emptyText}>All caught up!</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TouchableOpacity
              key={task._id}
              style={s.taskItem}
              onPress={() => navigation.navigate('Tasks', { screen: 'TaskDetail', params: { task } })}
            >
              <View style={[s.priorityDot, { backgroundColor: priorityColors[task.priority] }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.taskTitle} numberOfLines={1}>{task.title}</Text>
                <Text style={s.taskMeta}>
                  {task.category} • {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 20 },
  heading: { fontSize: 28, fontWeight: '700', color: '#f1f5f9' },
  subheading: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 16,
    padding: 16, gap: 4,
  },
  cardValue: { fontSize: 28, fontWeight: '700', color: '#f1f5f9' },
  cardLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  section: { marginTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#e2e8f0' },
  viewAll: { fontSize: 13, color: '#818cf8', fontWeight: '600' },
  taskItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  taskTitle: { fontSize: 15, fontWeight: '500', color: '#e2e8f0' },
  taskMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#64748b', marginTop: 8 },
});
