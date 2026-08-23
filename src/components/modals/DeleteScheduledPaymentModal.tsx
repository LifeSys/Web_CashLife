'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { scheduledPaymentService } from '@/services/financial.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';
import type { ScheduledPayment } from '@/types';

interface DeleteScheduledPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: ScheduledPayment | null;
  onSuccess?: () => void;
}

export function DeleteScheduledPaymentModal({ isOpen, onClose, payment, onSuccess }: DeleteScheduledPaymentModalProps) {
  const { user } = useAuth();
  const { invalidateAfterScheduledPayment } = useSWRInvalidation();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !payment) return null;

  const handleDelete = async () => {
    if (!user?.uid) return;
    setIsDeleting(true);
    try {
      await scheduledPaymentService.delete(user.uid, payment.id);
      toast.success('Pago programado eliminado');
      invalidateAfterScheduledPayment(user.uid);
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el pago programado');
      console.error('[CashLife] DeleteScheduledPaymentModal error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </span>
            <h2 className="text-lg font-bold">¿Eliminar este pago programado?</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <p>
            Vas a eliminar <span className="font-semibold">{payment.name}</span> por completo, junto con:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Todo su historial de meses (pagados y pendientes)</li>
            <li>Su configuración de división con otras personas</li>
          </ul>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
            <p className="font-medium">Esto no se puede deshacer.</p>
            <p className="mt-1 text-xs">
              Eso sí: los pagos que ya registraste (el dinero que ya salió de tu cuenta) y las cuentas por cobrar que ya se generaron
              <b> no se borran ni se revierten</b> — siguen tal cual en Movimientos y en Por Cobrar.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-5">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-destructive px-4 py-2 font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
