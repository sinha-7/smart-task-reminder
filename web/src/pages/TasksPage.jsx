import { useState, useEffect, useCallback } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useDebounce } from '../hooks/useDebounce';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import FilterBar from '../components/tasks/FilterBar';
import SearchBar from '../components/tasks/SearchBar';
import Pagination from '../components/tasks/Pagination';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const {
    tasks,
    pagination,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    suggestPriority,
    parseTaskFromText,
  } = useTasks();

  const [magicText, setMagicText] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [filters, setFilters] = useState({
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 10,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const loadTasks = useCallback(() => {
    const params = { ...filters };
    if (debouncedSearch) params.search = debouncedSearch;
    fetchTasks(params);
  }, [filters, debouncedSearch, fetchTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = async (data) => {
    try {
      await createTask(data);
      setModalOpen(false);
      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateTask(editingTask._id, data);
      setEditingTask(null);
      setModalOpen(false);
      loadTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleToggle = async (id, completed) => {
    try {
      await updateTask(id, { completed });
      loadTasks();
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      loadTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleMagicCreate = async (e) => {
    e.preventDefault();
    if (!magicText.trim()) return;
    
    setIsMagicLoading(true);
    const parsed = await parseTaskFromText(magicText);
    setIsMagicLoading(false);
    
    if (parsed) {
      try {
        await createTask(parsed);
        setMagicText('');
        loadTasks();
        toast.success('Magic task created!');
      } catch (err) {
        toast.error('Failed to create magic task');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Tasks</h1>
          <p className="text-gray-500 mt-1">
            {pagination.total} task{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <form onSubmit={handleMagicCreate} className="flex flex-1 sm:flex-none relative group">
            <input
              type="text"
              placeholder="Magic create... (e.g. 'buy milk tomorrow')"
              value={magicText}
              onChange={(e) => setMagicText(e.target.value)}
              className="input-field py-2 pr-10 bg-primary-950/20 text-sm focus:w-64 w-full sm:w-48 transition-all duration-300"
              disabled={isMagicLoading}
            />
            <button
              type="submit"
              disabled={!magicText.trim() || isMagicLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary-400 hover:text-primary-300 disabled:opacity-50"
              title="Parse with AI"
            >
              ✨
            </button>
          </form>
          <button onClick={openCreate} className="btn-primary whitespace-nowrap" id="create-task-btn">
            + New Task
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Task list */}
      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No tasks found"
          description={search || filters.category || filters.priority
            ? 'Try adjusting your search or filters.'
            : 'Create your first task to get started!'}
          action={
            !search && !filters.category && !filters.priority && (
              <button onClick={openCreate} className="btn-primary">
                Create Task
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={() => { setModalOpen(false); setEditingTask(null); }}
          onAiSuggest={suggestPriority}
        />
      </Modal>
    </div>
  );
}
