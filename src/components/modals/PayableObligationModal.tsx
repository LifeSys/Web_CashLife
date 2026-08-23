'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { usePeople } from '@/hooks/usePeople';
import { useSettings } from '@/hooks/useSettings';
import { financialEngine } from '@/services/financial-engine.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';
import { parseLocalDate, formatDateInput } from '@/lib/date';

interface PayableObligationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prefilledContactId?: string;
}

export function PayableObligationModal({ isOpen, onClose, onSuccess, prefilledContactId }: PayableObligationModalProps) {
  const { user } = useAuth();
  const { contacts } = usePeople();
  const { settings } = useSettings();
  const { invalidateAfterPayable } = useSWRInvalidation();
  const [creditorName, setCreditorName] = useState('');
  const [creditorType, setCreditorType] = useState<'person' | 'bank' | 'company' | 'sunat' | 'other'>('person');
  const [contactId, setContactId] = useState(prefilledContactId || '');
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
    if (!user?.uid || !creditorName || !description || !amount) {
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
        creditorName,
        creditorType,
        contactId,
        personId: contactId,
        description,
        date: parseLocalDate(date),
        dueDate: dueDate ? parseLocalDate(dueDate) : parseLocalDate(date),
        amount: parsedAmount,
        notes,
        moneda,
        tipoCambio: parsedRate,
      });
      toast.success('Obligación registrada');
      invalidateAfterPayable(user.uid);
      setCreditorName('');
      setCreditorType('person');
      setContactId('');
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
      toast.error('Error al registrar la obligación');
      console.error('[v0] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between sticky top-0 bg-card">
          <h2 className="text-xl font-bold">Nueva Obligación</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Tipo de Acreedor *</label>
            <select
              value={creditorType}
              onChange={(e) => setCreditorType(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="person">Persona</option>
              <option value="bank">Banco</option>
              <option value="company">Empresa</option>
              <option value="sunat">SUNAT</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Nombre del Acreedor *</label>
            <input
              type="text"
              value={creditorName}
              onChange={(e) => setCreditorName(e.target.value)}
              placeholder="Ej: Banco BCP"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contacto Asociado</label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              disabled={!!prefilledContactId}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 disabled:opacity-60"
            >
              <option value="">Ninguno (opcional)</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Descripción *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de préstamo"
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
                placeholder="0.00"
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
                placeholder="3.75"
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se guarda con esta obligación — si el dólar sube o baja después, este monto en soles no cambia.
              </p>
            </div>
          )}

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
            <label className="text-sm font-medium">Fecha de Vencimiento</label>
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
              placeholder="Notas adicionales..."
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4 sticky bottom-0 bg-card">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Obligación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
