export default function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    default: 'bg-white/10 text-gray-300 border-white/10',
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
