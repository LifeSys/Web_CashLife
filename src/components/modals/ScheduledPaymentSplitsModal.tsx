'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useScheduledPaymentSplits } from '@/hooks/useFinancial';
import { scheduledPaymentService } from '@/services/financial.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { SplitRowsEditor, type SplitRow } from '@/components/common/SplitRowsEditor';
import { toast } from 'sonner';
import type { ScheduledPayment } from '@/types';

interface ScheduledPaymentSplitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: ScheduledPayment | null;
  onSuccess?: () => void;
}

export function ScheduledPaymentSplitsModal({ isOpen, onClose, payment, onSuccess }: ScheduledPaymentSplitsModalProps) {
  const { user } = useAuth();
  const { invalidateAfterScheduledPayment } = useSWRInvalidation();
  const { splits, mutate: mutateSplits } = useScheduledPaymentSplits(payment?.id);
  const [rows, setRows] = useState<SplitRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && splits) {
      setRows(splits.length > 0 ? splits.map((s) => ({ personId: s.personId, amount: String(s.amount) })) : [{ personId: '', amount: '' }]);
    }
  }, [isOpen, splits]);

  if (!isOpen || !payment) return null;

  const handleSave = async () => {
    if (!user?.uid) return;
    const validRows = rows.filter((r) => r.personId && Number(r.amount) > 0);
    setIsSubmitting(true);
    try {
      await scheduledPaymentService.setSplits(
        user.uid,
        payment.id,
        validRows.map((r) => ({ personId: r.personId, amount: Number(r.amount) }))
      );
      toast.success('División actualizada');
      invalidateAfterScheduledPayment(user.uid);
      mutateSplits();
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar la división');
      console.error('[CashLife] ScheduledPaymentSplitsModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Dividir "{payment.name}"</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <SplitRowsEditor rows={rows} onChange={setRows} totalAmount={payment.amount} />
        <p className="text-xs text-muted-foreground mt-2">
          Solo aplica desde el próximo mes que marques como pagado — no afecta periodos ya pagados.
        </p>

        <div className="flex gap-2 pt-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
            {isSubmitting ? 'Guardando...' : 'Guardar división'}
          </button>
        </div>
      </div>
    </div>
  );
}
