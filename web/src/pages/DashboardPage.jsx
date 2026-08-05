import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import StatsCard from '../components/dashboard/StatsCard';
import TaskCard from '../components/tasks/TaskCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { tasks, stats, loading, fetchTasks, fetchStats, updateTask } = useTasks();

  useEffect(() => {
    fetchStats();
    fetchTasks({ limit: 5, sortBy: 'dueDate', order: 'asc', completed: 'false' });
  }, [fetchStats, fetchTasks]);

  const handleToggle = async (id, completed) => {
    await updateTask(id, { completed });
    fetchStats();
    fetchTasks({ limit: 5, sortBy: 'dueDate', order: 'asc', completed: 'false' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your tasks and reminders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon="📋"
          label="Pending Tasks"
          value={stats?.pending}
          color="primary"
        />
        <StatsCard
          icon="✅"
          label="Completed"
          value={stats?.completed}
          color="emerald"
        />
        <StatsCard
          icon="⏰"
          label="Upcoming Reminders"
          value={stats?.upcomingReminders}
          color="amber"
        />
        <StatsCard
          icon="🔥"
          label="Overdue"
          value={stats?.overdue}
          color="rose"
        />
      </div>

      {/* Priority breakdown */}
      {stats?.byPriority && stats.byPriority.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Pending by Priority</h2>
          <div className="flex gap-4">
            {['high', 'medium', 'low'].map((p) => {
              const item = stats.byPriority.find((b) => b._id === p);
              const colors = { high: 'bg-rose-500', medium: 'bg-amber-500', low: 'bg-emerald-500' };
              return (
                <div key={p} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors[p]}`} />
                  <span className="text-sm text-gray-400 capitalize">{p}</span>
                  <span className="text-sm font-semibold text-gray-200">{item?.count || 0}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-200">Upcoming Tasks</h2>
          <button
            onClick={() => navigate('/tasks')}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            View all →
          </button>
        </div>

        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="All caught up!"
            description="You have no pending tasks. Create one to get started."
            action={
              <button onClick={() => navigate('/tasks')} className="btn-primary">
                Go to Tasks
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onEdit={() => navigate('/tasks')}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
