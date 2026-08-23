'use client';

import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { useReceivableDebts } from '@/hooks/useFinancial';
import { financialEngine } from '@/services/financial-engine.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';
import { parseLocalDate, formatDateInput } from '@/lib/date';

interface ReceivablePaymentContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
  onSuccess?: () => void;
}

export function ReceivablePaymentContextModal({
  isOpen,
  onClose,
  contactId,
  contactName,
  onSuccess,
}: ReceivablePaymentContextModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const { debts } = useReceivableDebts();
  const { invalidateAfterReceivable } = useSWRInvalidation();
  
  const [selectedDebtId, setSelectedDebtId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter debts for this contact
  const contactDebts = useMemo(
    () => debts.filter((d) => (d.contactId ?? d.personId) === contactId && d.status !== 'paid'),
    [debts, contactId]
  );

  // Get selected debt details
  const selectedDebt = useMemo(
    () => contactDebts.find((d) => d.id === selectedDebtId),
    [contactDebts, selectedDebtId]
  );

  // Auto-fill amount when debt is selected
  const handleDebtChange = (debtId: string) => {
    setSelectedDebtId(debtId);
    const debt = contactDebts.find((d) => d.id === debtId);
    if (debt) {
      setAmount(debt.pendingBalance.toString());
    }
  };

  const accountOptions = useMemo(
    () => cuentas.filter((c) => c.tipo !== 'credit_card'),
    [cuentas]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid || !selectedDebtId || !amount) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!selectedDebt) {
      toast.error('Deuda no encontrada');
      return;
    }

    const parsedAmount = Number(amount);
    if (parsedAmount <= 0 || parsedAmount > selectedDebt.pendingBalance) {
      toast.error(`El monto debe ser entre 0 y ${selectedDebt.pendingBalance.toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await financialEngine.collectReceivable(user.uid, {
        debtId: selectedDebtId,
        personId: contactId,
        contactId: contactId,
        amount: parsedAmount,
        accountId: accountOptions[0]?.id || '', // Usar primera cuenta disponible
        date: parseLocalDate(date),
        observations: notes,
      });
      
      toast.success('Pago registrado correctamente');
      
      // Invalidate relevant SWR caches (includes person/people data)
      invalidateAfterReceivable(user.uid);
      
      // Reset form
      setSelectedDebtId('');
      setAmount('');
      setDate(formatDateInput(new Date()));
      setNotes('');
      
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Error al registrar el pago');
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
            <h2 className="text-xl md:text-2xl font-bold">Registrar Pago Recibido</h2>
            <p className="text-sm text-muted-foreground mt-1">De {contactName} (Cobro)</p>
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
          {/* Pending Debts Info */}
          {contactDebts.length === 0 ? (
            <div className="rounded-lg bg-muted/50 border border-border p-4 text-center">
              <p className="text-sm text-muted-foreground">No hay deudas pendientes para este contacto</p>
            </div>
          ) : (
            <>
              {/* Deuda Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Selecciona Deuda *</label>
                <select
                  value={selectedDebtId}
                  onChange={(e) => handleDebtChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Elige una deuda pendiente</option>
                  {contactDebts.map((debt) => (
                    <option key={debt.id} value={debt.id}>
                      {debt.description} - Pendiente: S/{debt.pendingBalance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">Monto a Cobrar *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">S/</span>
                  <input
                    type="number"
                    step="0.01"
                    max={selectedDebt?.pendingBalance}
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                {selectedDebt && (
                  <p className="mt-1 text-xs text-muted-foreground">Pendiente: S/{selectedDebt.pendingBalance.toFixed(2)}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Fecha del Pago</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Notas (Opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade detalles sobre el pago..."
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
                  disabled={isSubmitting || !selectedDebtId}
                  className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Registrar Cobro'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
