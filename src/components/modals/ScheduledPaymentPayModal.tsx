'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { financialEngine } from '@/services/financial-engine.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';
import type { ScheduledPayment } from '@/types';

interface ScheduledPaymentPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: ScheduledPayment | null;
  period: string;
  onSuccess?: () => void;
}

const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0);

export function ScheduledPaymentPayModal({ isOpen, onClose, payment, period, onSuccess }: ScheduledPaymentPayModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const { invalidateAfterScheduledPayment } = useSWRInvalidation();
  const [accountId, setAccountId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !payment) return null;

  const accountOptions = cuentas.filter((c) => c.tipo !== 'credit_card');
  const selectedAccountId = accountId || payment.suggestedAccountId || accountOptions[0]?.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!selectedAccountId) {
      toast.error('Selecciona una cuenta');
      return;
    }

    setIsSubmitting(true);
    try {
      await financialEngine.payScheduledPayment(user.uid, {
        paymentId: payment.id,
        period,
        accountId: selectedAccountId,
      });
      toast.success(`${payment.name} marcado como pagado`);
      invalidateAfterScheduledPayment(user.uid);
      setAccountId('');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrar el pago');
      console.error('[CashLife] ScheduledPaymentPayModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Marcar como pagado</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {payment.name} · {money(payment.amount)} · periodo {period}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">¿Desde qué cuenta pagaste?</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="">Selecciona una cuenta</option>
              {accountOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Confirmar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
