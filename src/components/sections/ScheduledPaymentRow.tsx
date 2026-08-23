'use client';

import { useEffect, useState } from 'react';
import { Repeat, Users } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useScheduledPaymentPeriods, useScheduledPaymentSplits } from '@/hooks/useFinancial';
import { usePeople } from '@/hooks/usePeople';
import { scheduledPaymentService } from '@/services/financial.service';
import { PaymentCard } from '@/components/design-system/cards/PaymentCard';
import type { ScheduledPayment, ScheduledPaymentPeriodStatus } from '@/types';

interface ScheduledPaymentRowProps {
  payment: ScheduledPayment;
  period: string;
  onPay: (payment: ScheduledPayment) => void;
  onManageSplit: (payment: ScheduledPayment) => void;
}

const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0);

const STATUS_MAP: Record<ScheduledPaymentPeriodStatus, 'pending' | 'overdue' | 'paid' | 'cancelled'> = {
  pending: 'pending',
  overdue: 'overdue',
  paid: 'paid',
  skipped: 'cancelled',
};

export function ScheduledPaymentRow({ payment, period, onPay, onManageSplit }: ScheduledPaymentRowProps) {
  const { user } = useAuth();
  const { periods, isLoading, mutate } = useScheduledPaymentPeriods(payment.id);
  const { splits } = useScheduledPaymentSplits(payment.id);
  const { contacts } = usePeople();
  const [ensuring, setEnsuring] = useState(false);

  const currentPeriod = periods.find((p) => p.period === period);

  // La fila de este periodo no existe hasta que alguien la mira: la creamos
  // (con estado pending/overdue calculado según la fecha) la primera vez.
  useEffect(() => {
    if (!user?.uid || isLoading || currentPeriod || ensuring) return;
    setEnsuring(true);
    scheduledPaymentService
      .ensurePeriod(user.uid, payment.id, period)
      .then(() => mutate())
      .catch((err) => console.error('[CashLife] Error asegurando periodo:', err))
      .finally(() => setEnsuring(false));
  }, [user?.uid, payment.id, period, isLoading, currentPeriod, ensuring, mutate]);

  if (isLoading || (!currentPeriod && ensuring)) {
    return <div className="rounded-lg border border-border/50 bg-card p-6 h-[132px] animate-pulse" />;
  }

  const status = STATUS_MAP[currentPeriod?.status ?? 'pending'];
  const splitNames = splits
    .map((s) => contacts.find((c) => c.id === s.personId)?.nombre ?? '?')
    .filter(Boolean);

  return (
    <div className="space-y-2">
      <PaymentCard
        description={payment.name}
        amount={money(payment.amount)}
        dueDate={`Día ${payment.dueDay} · ${payment.category}`}
        status={status}
        icon={<Repeat className="w-5 h-5 text-muted-foreground" />}
        action={
          status === 'pending' || status === 'overdue'
            ? { label: 'Marcar como pagado', onClick: () => onPay(payment) }
            : undefined
        }
      />
      <button
        onClick={() => onManageSplit(payment)}
        className="w-full flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-1 transition-colors"
      >
        <Users className="w-3.5 h-3.5" />
        {splitNames.length > 0 ? `Se divide con: ${splitNames.join(', ')}` : 'Dividir con otras personas'}
      </button>
    </div>
  );
}
