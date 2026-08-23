'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSettings } from '@/hooks/useSettings';
import { financialEngine } from '@/services/financial-engine.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';
import { parseLocalDate, formatDateInput } from '@/lib/date';

interface PayableObligationContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
  onSuccess?: () => void;
}

export function PayableObligationContextModal({
  isOpen,
  onClose,
  contactId,
  contactName,
  onSuccess,
}: PayableObligationContextModalProps) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { invalidateAfterPayable } = useSWRInvalidation();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [tipoCambio, setTipoCambio] = useState('');
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid || !description || !amount || !dueDate) {
      toast.error('Por favor completa los campos requeridos');
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
      await financialEngine.createPayableObligation(user.uid, {
        creditorName: contactName,
        creditorType: 'person',
        contactId: contactId,
        personId: contactId,
        description,
        date: parseLocalDate(date),
        dueDate: parseLocalDate(dueDate),
        amount: parsedAmount,
        notes,
        moneda,
        tipoCambio: parsedRate,
      });

      toast.success('Cobro registrado correctamente');

      // Invalidate relevant SWR caches (includes person/people data)
      invalidateAfterPayable(user.uid);

      // Reset form
      setDescription('');
      setAmount('');
      setMoneda('PEN');
      setTipoCambio('');
      setDate(formatDateInput(new Date()));
      setDueDate('');
      setNotes('');
      
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Error al registrar el cobro');
      console.error('[v0] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Registrar Obligación</h2>
            <p className="text-sm text-muted-foreground mt-1">Al {contactName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Descripción *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Servicio de consultoría"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Amount */}
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Monto *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{moneda === 'USD' ? '$' : 'S/'}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Moneda</label>
              <select
                value={moneda}
                onChange={(e) => {
                  const value = e.target.value as 'PEN' | 'USD';
                  setMoneda(value);
                  if (value === 'USD' && !tipoCambio && settings?.tipoCambioUsdPen) {
                    setTipoCambio(String(settings.tipoCambioUsdPen));
                  }
                }}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {moneda === 'USD' && (
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de cambio (S/ por USD) *</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={tipoCambio}
                onChange={(e) => setTipoCambio(e.target.value)}
                placeholder="3.75"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Fecha del Cobro</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Fecha de Vencimiento *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notas (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade detalles sobre el cobro..."
              rows={3}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-muted text-foreground font-semibold py-2 rounded-lg hover:bg-muted/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Obligación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
