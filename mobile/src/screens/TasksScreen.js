import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import api from '../api/axios';

const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadTasks = async (p = 1, searchQuery = search) => {
    if (loading) return;
    setLoading(true);
    try {
      const params = { page: p, limit: 15, sortBy: 'createdAt', order: 'desc' };
      if (searchQuery) params.search = searchQuery;
      const res = await api.get('/tasks', { params });
      const newTasks = res.data.data.tasks;
      if (p === 1) setTasks(newTasks);
      else setTasks((prev) => [...prev, ...newTasks]);
      setHasMore(res.data.data.pagination.page < res.data.data.pagination.pages);
      setPage(p);
    } catch (err) {
      console.error('Load tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadTasks(1); }, []));

  const onRefresh = async () => { setRefreshing(true); await loadTasks(1); setRefreshing(false); };
  const onEndReached = () => { if (hasMore && !loading) loadTasks(page + 1); };

  const handleDelete = (id) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await api.delete(`/tasks/${id}`); loadTasks(1); }
          catch (err) { Alert.alert('Error', 'Failed to delete task'); }
        },
      },
    ]);
  };

  const handleToggle = async (task) => {
    try {
      await api.put(`/tasks/${task._id}`, { completed: !task.completed });
      loadTasks(1);
    } catch (err) {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity style={s.deleteAction} onPress={() => handleDelete(id)}>
      <Text style={s.deleteText}>🗑️</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item._id)}>
      <TouchableOpacity
        style={s.taskCard}
        onPress={() => navigation.navigate('TaskDetail', { task: item })}
      >
        <TouchableOpacity onPress={() => handleToggle(item)} style={s.checkboxArea}>
          <View style={[s.checkbox, item.completed && s.checkboxChecked]}>
            {item.completed && <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>}
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={s.titleRow}>
            <Text style={[s.taskTitle, item.completed && s.taskTitleDone]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={[s.priorityBadge, { backgroundColor: priorityColors[item.priority] + '22', borderColor: priorityColors[item.priority] + '44' }]}>
              <Text style={[s.priorityText, { color: priorityColors[item.priority] }]}>{item.priority}</Text>
            </View>
          </View>
          <Text style={s.taskMeta}>
            {item.category} {item.dueDate ? `• ${new Date(item.dueDate).toLocaleDateString()}` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={s.container}>
      {/* Search */}
      <View style={s.searchContainer}>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={(text) => { setSearch(text); loadTasks(1, text); }}
          placeholder="🔍 Search tasks..."
          placeholderTextColor="#64748b"
        />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 48 }}>📝</Text>
            <Text style={s.emptyText}>No tasks found</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#f1f5f9', fontSize: 15,
  },
  list: { padding: 16, paddingBottom: 80 },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, padding: 14, marginBottom: 8,
  },
  checkboxArea: { padding: 4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#475569',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  taskTitle: { fontSize: 15, fontWeight: '500', color: '#e2e8f0', flex: 1 },
  taskTitleDone: { color: '#475569', textDecorationLine: 'line-through' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  priorityText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  taskMeta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  deleteAction: {
    backgroundColor: '#ef444433', borderRadius: 14, justifyContent: 'center',
    alignItems: 'center', width: 70, marginBottom: 8, marginLeft: 8,
  },
  deleteText: { fontSize: 22 },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#6366f1', alignItems: 'center',
    justifyContent: 'center', elevation: 8, shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabText: { fontSize: 28, color: '#fff', fontWeight: '300', marginTop: -2 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#64748b', marginTop: 8 },
});
