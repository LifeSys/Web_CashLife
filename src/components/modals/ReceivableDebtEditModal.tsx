'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSettings } from '@/hooks/useSettings';
import { receivableService } from '@/services/financial.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';
import { parseLocalDate, formatDateInput } from '@/lib/date';
import type { ReceivableDebt } from '@/types';

interface ReceivableDebtEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: ReceivableDebt | null;
  personName?: string;
  onSuccess?: () => void;
}

export function ReceivableDebtEditModal({ isOpen, onClose, debt, personName, onSuccess }: ReceivableDebtEditModalProps) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { invalidateAfterReceivable } = useSWRInvalidation();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [tipoCambio, setTipoCambio] = useState('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && debt) {
      setDescription(debt.description ?? '');
      setAmount(String(debt.originalAmount ?? ''));
      setMoneda((debt.moneda as 'PEN' | 'USD') || 'PEN');
      setTipoCambio(debt.tipoCambio ? String(debt.tipoCambio) : '');
      setDate(formatDateInput(debt.date));
      setDueDate(formatDateInput(debt.dueDate));
      setNotes(debt.notes ?? '');
    }
  }, [isOpen, debt]);

  if (!isOpen || !debt) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !description.trim() || !amount) {
      toast.error('Completa la descripción y el monto');
      return;
    }
    const parsedAmount = Number(amount);
    if (parsedAmount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    const parsedRate = moneda === 'USD' ? Number(tipoCambio) : 1;
    if (moneda === 'USD' && (!parsedRate || parsedRate <= 0)) {
      toast.error('Ingresa el tipo de cambio del día');
      return;
    }

    setIsSubmitting(true);
    try {
      await receivableService.updateDebt(user.uid, debt.id, {
        description: description.trim(),
        originalAmount: parsedAmount,
        date: parseLocalDate(date),
        dueDate: dueDate ? parseLocalDate(dueDate) : undefined,
        notes: notes || undefined,
        moneda,
        tipoCambio: parsedRate,
      });
      toast.success('Deuda actualizada');
      invalidateAfterReceivable(user.uid);
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la deuda');
      console.error('[CashLife] ReceivableDebtEditModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Editar Deuda</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {personName && <p className="text-sm text-muted-foreground -mt-2 mb-4">De {personName}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Descripción *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-[1fr_110px] gap-3">
            <div>
              <label className="text-sm font-medium">Monto Original *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Moneda</label>
              <select
                value={moneda}
                onChange={(e) => {
                  const value = e.target.value as 'PEN' | 'USD';
                  setMoneda(value);
                  if (value === 'USD' && !tipoCambio && settings?.tipoCambioUsdPen) {
                    setTipoCambio(String(settings.tipoCambioUsdPen));
                  }
                }}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              >
                <option value="PEN">S/ PEN</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
          </div>

          {moneda === 'USD' && (
            <div>
              <label className="text-sm font-medium">Tipo de cambio (S/ por USD) *</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={tipoCambio}
                onChange={(e) => setTipoCambio(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground -mt-1">
            Ya cobrado: {new Intl.NumberFormat('es-PE', { style: 'currency', currency: debt.moneda || 'PEN' }).format(Math.max((debt.originalAmount || 0) - (debt.pendingBalance || 0), 0))} — eso no se toca, solo se recalcula lo pendiente.
          </p>

          <div>
            <label className="text-sm font-medium">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Fecha Vencimiento</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
