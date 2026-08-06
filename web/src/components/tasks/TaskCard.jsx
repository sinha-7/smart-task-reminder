import Badge from '../ui/Badge';

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && !task.completed && dueDate < new Date();

  return (
    <div className="glass-card-hover p-4 group animate-slide-up">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task._id, !task.completed)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 transition-all duration-200
            ${
              task.completed
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'border-gray-600 hover:border-primary-400'
            }`}
          id={`task-toggle-${task._id}`}
        >
          {task.completed && (
            <svg className="w-full h-full p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-medium text-sm ${
                task.completed ? 'text-gray-500 line-through' : 'text-gray-200'
              }`}
            >
              {task.title}
            </h3>
            <Badge variant={task.priority}>{task.priority}</Badge>
            <Badge>{task.category}</Badge>
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {dueDate && (
              <span className={isOverdue ? 'text-rose-400' : ''}>
                📅 {dueDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {task.reminderAt && !task.reminderSent && (
              <span className="text-primary-400/80">
                ⏰ {new Date(task.reminderAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all"
            id={`task-edit-${task._id}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
            id={`task-delete-${task._id}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
