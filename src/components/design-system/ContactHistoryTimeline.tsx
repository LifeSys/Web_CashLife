'use client';

import { ReceivableDebt, PayableObligation } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'receivable' | 'payable';
  description: string;
  amount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  pendingBalance: number;
  originalAmount: number;
  concept?: string;
}

interface ContactHistoryTimelineProps {
  debts: ReceivableDebt[];
  obligations: PayableObligation[];
  isLoading?: boolean;
  onViewDetails?: (event: TimelineEvent) => void;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  partial: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  paid: 'bg-green-500/10 text-green-300 border-green-500/30',
  overdue: 'bg-red-500/10 text-red-300 border-red-500/30',
} as const;

const STATUS_LABELS = {
  pending: 'Pendiente',
  partial: 'Parcial',
  paid: 'Pagado',
  overdue: 'Vencido',
} as const;

const TYPE_ICONS = {
  receivable: '🟢',
  payable: '🔴',
} as const;

const TYPE_LABELS = {
  receivable: 'Me debe',
  payable: 'Le debo',
} as const;

export function ContactHistoryTimeline({
  debts,
  obligations,
  isLoading,
  onViewDetails,
}: ContactHistoryTimelineProps) {
  // Combine and sort events chronologically (newest first)
  const events: TimelineEvent[] = [
    ...debts.map(d => ({
      id: d.id,
      date: d.date || (d.createdAt as any),
      type: 'receivable' as const,
      description: d.description,
      amount: d.originalAmount,
      status: d.status,
      pendingBalance: d.pendingBalance || 0,
      originalAmount: d.originalAmount,
      concept: d.description,
    })),
    ...obligations.map(o => ({
      id: o.id,
      date: o.dueDate || (o.createdAt as any),
      type: 'payable' as const,
      description: o.description,
      amount: o.originalAmount,
      status: o.status,
      pendingBalance: o.pendingBalance || 0,
      originalAmount: o.originalAmount,
      concept: o.description,
    })),
  ]
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-border border-dashed bg-card/50 p-12 text-center">
        <p className="text-muted-foreground">No hay operaciones registradas con este contacto</p>
        <p className="text-xs text-muted-foreground mt-2">
          Los cobros y pagos aparecerán aquí de forma cronológica
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, index) => {
        const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
        const isOverdue = event.status === 'overdue';
        const isPaid = event.status === 'paid';
        const statusColor = STATUS_COLORS[event.status];

        return (
          <div
            key={event.id}
            className={`rounded-lg border transition-all ${
              onViewDetails ? 'cursor-pointer hover:border-primary/50' : ''
            } ${
              isOverdue
                ? 'border-red-500/30 bg-red-500/5'
                : isPaid
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-border bg-card'
            }`}
            onClick={() => onViewDetails?.(event)}
          >
            <div className="p-4 flex items-start justify-between gap-4">
              {/* Left: Timeline and basic info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-xl flex-shrink-0">{TYPE_ICONS[event.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-base line-clamp-2">{event.description}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                        event.type === 'receivable' 
                          ? 'bg-green-500/15 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {TYPE_LABELS[event.type]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(eventDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Amount and status */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      event.type === 'receivable' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {event.type === 'receivable' ? '+' : '-'}{formatCurrency(event.amount)}
                  </p>
                  {event.pendingBalance > 0 && (
                    <p className="text-xs text-amber-400 mt-1">
                      Pendiente: {formatCurrency(event.pendingBalance)}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${statusColor}`}
                >
                  {event.status === 'paid' && '✓'}
                  {event.status === 'pending' && '⏳'}
                  {event.status === 'partial' && '◐'}
                  {event.status === 'overdue' && '⚠'}
                  {STATUS_LABELS[event.status]}
                </span>
              </div>
            </div>

            {/* Show pending balance progress if partial or pending */}
            {(event.status === 'partial' || event.status === 'pending') && event.pendingBalance > 0 && (
              <div className="px-4 pb-3 flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${
                      isOverdue ? 'bg-red-500/60' : 'bg-amber-500/60'
                    }`}
                    style={{
                      width: `${((event.originalAmount - event.pendingBalance) / event.originalAmount) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                  {Math.round(((event.originalAmount - event.pendingBalance) / event.originalAmount) * 100)}%
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
