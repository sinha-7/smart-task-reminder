export default function FilterBar({ filters, onChange }) {
  const categories = ['All', 'General', 'Work', 'Personal', 'Study', 'Health', 'Finance', 'Shopping', 'Travel'];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Category filter */}
      <select
        value={filters.category || ''}
        onChange={(e) => onChange({ ...filters, category: e.target.value || undefined, page: 1 })}
        className="input-field w-auto text-sm py-2"
        id="filter-category"
      >
        {categories.map((c) => (
          <option key={c} value={c === 'All' ? '' : c}>
            {c}
          </option>
        ))}
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority || ''}
        onChange={(e) => onChange({ ...filters, priority: e.target.value || undefined, page: 1 })}
        className="input-field w-auto text-sm py-2"
        id="filter-priority"
      >
        <option value="">All Priorities</option>
        <option value="low">🟢 Low</option>
        <option value="medium">🟡 Medium</option>
        <option value="high">🔴 High</option>
      </select>

      {/* Status filter */}
      <select
        value={filters.completed ?? ''}
        onChange={(e) => onChange({ ...filters, completed: e.target.value || undefined, page: 1 })}
        className="input-field w-auto text-sm py-2"
        id="filter-status"
      >
        <option value="">All Status</option>
        <option value="false">Pending</option>
        <option value="true">Completed</option>
      </select>

      {/* Sort */}
      <select
        value={`${filters.sortBy || 'createdAt'}-${filters.order || 'desc'}`}
        onChange={(e) => {
          const [sortBy, order] = e.target.value.split('-');
          onChange({ ...filters, sortBy, order, page: 1 });
        }}
        className="input-field w-auto text-sm py-2"
        id="filter-sort"
      >
        <option value="createdAt-desc">Newest first</option>
        <option value="createdAt-asc">Oldest first</option>
        <option value="dueDate-asc">Due date ↑</option>
        <option value="dueDate-desc">Due date ↓</option>
        <option value="priority-desc">Priority ↓</option>
        <option value="priority-asc">Priority ↑</option>
      </select>
    </div>
  );
}
