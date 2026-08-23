'use client';

import { ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { PremiumCard } from './PremiumCard';

type PaymentStatus = 'scheduled' | 'pending' | 'overdue' | 'paid' | 'cancelled';

interface PaymentCardProps {
  amount: string;
  description: string;
  dueDate: string;
  status: PaymentStatus;
  icon?: ReactNode;
  recipient?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const statusConfig = {
  scheduled: {
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    label: 'Programado',
    icon: '📅',
  },
  pending: {
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    label: 'Pendiente',
    icon: '⏱️',
  },
  overdue: {
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    label: 'Vencido',
    icon: '⚠️',
  },
  paid: {
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    label: 'Pagado',
    icon: '✓',
  },
  cancelled: {
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    label: 'Cancelado',
    icon: '✕',
  },
};

export function PaymentCard({
  amount,
  description,
  dueDate,
  status,
  icon,
  recipient,
  onClick,
  onEdit,
  onDelete,
  action,
}: PaymentCardProps) {
  const config = statusConfig[status];
  const isOverdue = status === 'overdue';

  return (
    <PremiumCard
      onClick={onClick}
      interactive={!!onClick}
      variant={isOverdue ? 'outlined' : 'elevated'}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {description}
            </p>
            {recipient && (
              <p className="text-xs text-muted-foreground mt-1">{recipient}</p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Editar"
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Eliminar"
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {icon && <div className="text-2xl">{icon}</div>}
          </div>
        </div>

        {/* Amount and Status */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">{amount}</p>
            <p className="text-xs text-muted-foreground mt-1">{dueDate}</p>
          </div>
          <div
            className={`px-3 py-2 rounded-lg border text-xs font-semibold whitespace-nowrap ${config.color} transition-all duration-200 ${
              isOverdue ? 'animate-pulse-subtle' : ''
            }`}
          >
            {config.label}
          </div>
        </div>

        {/* Action Button */}
        {action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className={`
              w-full px-4 py-3 rounded-lg font-semibold text-sm
              transition-all duration-200 active:scale-98
              ${
                status === 'paid' || status === 'cancelled'
                  ? 'bg-muted text-muted-foreground cursor-default'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }
            `}
          >
            {action.label}
          </button>
        )}
      </div>
    </PremiumCard>
  );
}
