import { useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/tasks', { params });
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch stats');
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    const res = await api.post('/tasks', taskData);
    toast.success('Task created!');
    return res.data.data.task;
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    const res = await api.put(`/tasks/${id}`, taskData);
    toast.success('Task updated!');
    return res.data.data.task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    toast.success('Task deleted!');
  }, []);

  const suggestPriority = useCallback(async ({ title, description }) => {
    try {
      const res = await api.post('/ai/suggest-priority', { title, description });
      return res.data.data;
    } catch {
      return null;
    }
  }, []);

  return {
    tasks,
    pagination,
    stats,
    loading,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    deleteTask,
    suggestPriority,
  };
}
