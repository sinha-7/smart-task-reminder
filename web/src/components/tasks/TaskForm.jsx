import { useState, useEffect } from 'react';

export default function TaskForm({ task, onSubmit, onCancel, onAiSuggest }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'General',
    reminderAt: '',
  });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const categories = ['General', 'Work', 'Personal', 'Study', 'Health', 'Finance', 'Shopping', 'Travel'];

  const toLocalDatetimeLocal = (utcString) => {
    if (!utcString) return '';
    const date = new Date(utcString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        dueDate: toLocalDatetimeLocal(task.dueDate),
        priority: task.priority || 'medium',
        category: task.category || 'General',
        reminderAt: toLocalDatetimeLocal(task.reminderAt),
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAiSuggest = async () => {
    if (!form.title || !onAiSuggest) return;
    setAiLoading(true);
    try {
      const suggestion = await onAiSuggest({ title: form.title, description: form.description });
      if (suggestion) {
        setAiSuggestion(suggestion);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setForm((prev) => ({
        ...prev,
        priority: aiSuggestion.priority,
        category: aiSuggestion.category,
      }));
      setAiSuggestion(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (data.dueDate) data.dueDate = new Date(data.dueDate).toISOString();
    else delete data.dueDate;
    if (data.reminderAt) data.reminderAt = new Date(data.reminderAt).toISOString();
    else delete data.reminderAt;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="label" htmlFor="task-title">Title *</label>
        <input
          id="task-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="input-field"
          placeholder="What needs to be done?"
          required
        />
      </div>

      {/* AI Suggest Button */}
      {onAiSuggest && (
        <div>
          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={!form.title || aiLoading}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>✨</span>
            {aiLoading ? 'Getting AI suggestion...' : 'Get AI suggestion for priority & category'}
          </button>

          {aiSuggestion && (
            <div className="mt-2 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 animate-slide-down">
              <p className="text-sm text-primary-300 mb-2">
                🤖 AI suggests: <strong className="capitalize">{aiSuggestion.priority}</strong> priority,
                category: <strong>{aiSuggestion.category}</strong>
              </p>
              {aiSuggestion.reasoning && (
                <p className="text-xs text-gray-400 mb-2">{aiSuggestion.reasoning}</p>
              )}
              <button
                type="button"
                onClick={applyAiSuggestion}
                className="text-xs btn-primary py-1 px-3"
              >
                Apply suggestion
              </button>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div>
        <label className="label" htmlFor="task-desc">Description</label>
        <textarea
          id="task-desc"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input-field resize-none h-24"
          placeholder="Add details..."
        />
      </div>

      {/* Priority & Category row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="input-field"
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="task-category">Category</label>
          <select
            id="task-category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input-field"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Due date & Reminder row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="task-due">Due Date</label>
          <input
            id="task-due"
            type="datetime-local"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div>
          <label className="label" htmlFor="task-reminder">Reminder</label>
          <input
            id="task-reminder"
            type="datetime-local"
            name="reminderAt"
            value={form.reminderAt}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" id="task-submit-btn">
          {task ? 'Update Task' : 'Create Task'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" id="task-cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  );
}
