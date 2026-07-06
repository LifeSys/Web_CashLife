interface StatusBadgeProps {
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'active' | 'inactive';
  label?: string;
}

const statusConfig = {
  pending: { bg: 'bg-amber-500/20', text: 'text-amber-600', label: 'Pendiente' },
  partial: { bg: 'bg-blue-500/20', text: 'text-blue-600', label: 'Parcial' },
  paid: { bg: 'bg-green-500/20', text: 'text-green-600', label: 'Pagado' },
  overdue: { bg: 'bg-red-500/20', text: 'text-red-600', label: 'Vencido' },
  active: { bg: 'bg-green-500/20', text: 'text-green-600', label: 'Activo' },
  inactive: { bg: 'bg-gray-500/20', text: 'text-gray-600', label: 'Inactivo' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {label || config.label}
    </span>
  );
}
