import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import api from '../api/axios';
import { scheduleTaskReminder, requestPermissions } from '../utils/notifications';

const categories = ['General', 'Work', 'Personal', 'Study', 'Health', 'Finance', 'Shopping', 'Travel'];
const priorities = ['low', 'medium', 'high'];

export default function CreateTaskScreen({ route, navigation }) {
  const editTask = route.params?.task;
  const isEdit = !!editTask;

  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', category: 'General',
    dueDate: '', reminderAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || '',
        description: editTask.description || '',
        priority: editTask.priority || 'medium',
        category: editTask.category || 'General',
        dueDate: editTask.dueDate || '',
        reminderAt: editTask.reminderAt || '',
      });
    }
  }, [editTask]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleAiSuggest = async () => {
    if (!form.title) return;
    try {
      const res = await api.post('/ai/suggest-priority', { title: form.title, description: form.description });
      setAiSuggestion(res.data.data);
    } catch { /* silent fail */ }
  };

  const handleSubmit = async () => {
    if (!form.title) { Alert.alert('Error', 'Title is required'); return; }
    setLoading(true);
    try {
      const data = { ...form };
      if (!data.dueDate) delete data.dueDate;
      if (!data.reminderAt) delete data.reminderAt;

      if (isEdit) {
        await api.put(`/tasks/${editTask._id}`, data);
      } else {
        await api.post('/tasks', data);
      }

      // Schedule local notification if reminder is set
      if (data.reminderAt) {
        const granted = await requestPermissions();
        if (granted) {
          await scheduleTaskReminder({
            title: data.title,
            body: data.description || 'Task reminder',
            triggerDate: new Date(data.reminderAt),
          });
        }
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.label}>Title *</Text>
      <TextInput style={s.input} value={form.title} onChangeText={(v) => update('title', v)} placeholder="What needs to be done?" placeholderTextColor="#64748b" />

      {/* AI Suggest */}
      <TouchableOpacity onPress={handleAiSuggest} disabled={!form.title}>
        <Text style={[s.aiBtn, !form.title && { opacity: 0.4 }]}>✨ Get AI suggestion</Text>
      </TouchableOpacity>
      {aiSuggestion && (
        <View style={s.aiCard}>
          <Text style={s.aiText}>
            🤖 AI suggests: <Text style={{ fontWeight: '700' }}>{aiSuggestion.priority}</Text> priority, category: <Text style={{ fontWeight: '700' }}>{aiSuggestion.category}</Text>
          </Text>
          <TouchableOpacity onPress={() => { update('priority', aiSuggestion.priority); update('category', aiSuggestion.category); setAiSuggestion(null); }}>
            <Text style={s.applyBtn}>Apply</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={s.label}>Description</Text>
      <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={form.description} onChangeText={(v) => update('description', v)} placeholder="Add details..." placeholderTextColor="#64748b" multiline />

      <Text style={s.label}>Priority</Text>
      <View style={s.pillRow}>
        {priorities.map((p) => (
          <TouchableOpacity key={p} style={[s.pill, form.priority === p && { backgroundColor: priorityColors[p] + '22', borderColor: priorityColors[p] }]} onPress={() => update('priority', p)}>
            <Text style={[s.pillText, form.priority === p && { color: priorityColors[p] }]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Category</Text>
      <View style={s.pillRow}>
        {categories.map((c) => (
          <TouchableOpacity key={c} style={[s.pill, form.category === c && { backgroundColor: '#6366f122', borderColor: '#6366f1' }]} onPress={() => update('category', c)}>
            <Text style={[s.pillText, form.category === c && { color: '#818cf8' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        <Text style={s.submitText}>{loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#f1f5f9', fontSize: 15 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  pillText: { fontSize: 13, fontWeight: '500', color: '#94a3b8', textTransform: 'capitalize' },
  aiBtn: { color: '#818cf8', fontWeight: '600', fontSize: 14, marginTop: 8 },
  aiCard: { backgroundColor: '#6366f111', borderWidth: 1, borderColor: '#6366f133', borderRadius: 12, padding: 12, marginTop: 8, gap: 8 },
  aiText: { fontSize: 13, color: '#a5b4fc' },
  applyBtn: { color: '#818cf8', fontWeight: '700', fontSize: 13 },
  submitBtn: { backgroundColor: '#6366f1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
