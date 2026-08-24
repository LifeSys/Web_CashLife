'use client';

import { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { scheduledPaymentService } from '@/services/financial.service';
import { toast } from 'sonner';
import type { ScheduledPayment } from '@/types';

interface AutoPayQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: ScheduledPayment | null;
  onSuccess?: () => void;
}

/**
 * Modal chico que solo se usa cuando activas "Cobro automático" desde el
 * ícono de la tarjeta y el pago todavía no tiene una cuenta/tarjeta sugerida
 * guardada — pide elegir una y prende autoPay en un solo paso, sin abrir el
 * formulario completo de edición.
 */
export function AutoPayQuickModal({ isOpen, onClose, payment, onSuccess }: AutoPayQuickModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const { creditCards } = useCreditCards();
  const [destination, setDestination] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !payment) return null;

  const accountOptions = cuentas.filter((c) => c.tipo !== 'credit_card');

  const handleConfirm = async () => {
    if (!user?.uid || !destination) {
      toast.error('Elige una cuenta o tarjeta');
      return;
    }
    setIsSubmitting(true);
    try {
      await scheduledPaymentService.update(user.uid, payment.id, {
        autoPay: true,
        suggestedAccountId: destination,
      });
      toast.success('Cobro automático activado');
      setDestination('');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al activar el cobro automático');
      console.error('[CashLife] AutoPayQuickModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-500" />
            </span>
            <h2 className="text-lg font-bold">Activar cobro automático</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {payment.name} — elige de dónde se va a cargar cada mes.
        </p>

        <label className="block text-sm font-medium mb-2">Cuenta o tarjeta *</label>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full rounded-lg border border-border bg-muted px-3 py-2"
        >
          <option value="">Elige una cuenta o tarjeta</option>
          <optgroup label="Cuentas">
            {accountOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </optgroup>
          <optgroup label="Tarjetas de crédito">
            {creditCards.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} •••• {c.lastDigits}</option>
            ))}
          </optgroup>
        </select>

        <div className="flex gap-2 pt-5">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Activando...' : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  );
}
