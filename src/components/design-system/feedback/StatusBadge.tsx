'use client';

type BadgeStatus =
  | 'pending'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'active'
  | 'inactive'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  showPulse?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outlined' | 'soft';
  testId?: string;
}

const statusConfig = {
  pending: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-600',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
    label: 'Pendiente',
  },
  partial: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-600',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
    label: 'Parcial',
  },
  paid: {
    bg: 'bg-green-500/20',
    text: 'text-green-600',
    border: 'border-green-500/30',
    dot: 'bg-green-500',
    label: 'Pagado',
  },
  overdue: {
    bg: 'bg-red-500/20',
    text: 'text-red-600',
    border: 'border-red-500/30',
    dot: 'bg-red-500',
    label: 'Vencido',
  },
  active: {
    bg: 'bg-green-500/20',
    text: 'text-green-600',
    border: 'border-green-500/30',
    dot: 'bg-green-500',
    label: 'Activo',
  },
  inactive: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-600',
    border: 'border-gray-500/30',
    dot: 'bg-gray-500',
    label: 'Inactivo',
  },
  success: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-600',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
    label: 'Éxito',
  },
  warning: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-600',
    border: 'border-orange-500/30',
    dot: 'bg-orange-500',
    label: 'Advertencia',
  },
  danger: {
    bg: 'bg-red-500/20',
    text: 'text-red-600',
    border: 'border-red-500/30',
    dot: 'bg-red-500',
    label: 'Error',
  },
  info: {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-600',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-500',
    label: 'Información',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function StatusBadge({
  status,
  label,
  showPulse = status === 'active',
  icon,
  size = 'md',
  variant = 'soft',
  testId,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  const variantClasses =
    variant === 'outlined'
      ? `${config.text} bg-transparent border ${config.border}`
      : variant === 'solid'
        ? `${config.text} ${config.bg} border ${config.border}`
        : `${config.text} ${config.bg}`;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-semibold
        transition-all duration-200 whitespace-nowrap
        ${sizeClasses[size]}
        ${variantClasses}
      `}
      data-testid={testId}
    >
      {showPulse && (
        <div className="flex-shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse-subtle`} />
        </div>
      )}
      {icon && <div className="flex-shrink-0">{icon}</div>}
      {label || config.label}
    </span>
  );
}
