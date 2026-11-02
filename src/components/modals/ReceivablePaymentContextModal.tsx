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
import { allocateReceivablePayment, getAllocatableDebts } from '@/lib/receivable-allocation';

// Valor especial del selector: repartir el monto entre todas las deudas.
const BULK = '__abono_general__';

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
  const [accountId, setAccountId] = useState('');
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

  const isBulk = selectedDebtId === BULK;
  const bulkDebts = useMemo(() => getAllocatableDebts(debts, contactId), [debts, contactId]);
  const bulkTotal = useMemo(() => Math.round(bulkDebts.reduce((s, d) => s + d.pendingBalance, 0) * 100) / 100, [bulkDebts]);
  const bulkPreview = useMemo(
    () => (isBulk && Number(amount) > 0 ? allocateReceivablePayment(bulkDebts, Math.min(Number(amount), bulkTotal)) : []),
    [isBulk, amount, bulkDebts, bulkTotal]
  );
  const maxAmount = isBulk ? bulkTotal : selectedDebt?.pendingBalance;

  // Auto-fill amount when debt is selected
  const handleDebtChange = (debtId: string) => {
    setSelectedDebtId(debtId);
    if (debtId === BULK) {
      setAmount('');
      return;
    }
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
    
    if (!user?.uid || !selectedDebtId || !amount || !accountId) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!isBulk && !selectedDebt) {
      toast.error('Deuda no encontrada');
      return;
    }

    const parsedAmount = Number(amount);
    if (parsedAmount <= 0 || parsedAmount > (maxAmount ?? 0) + 0.001) {
      toast.error(`El monto debe ser entre 0 y ${(maxAmount ?? 0).toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isBulk) {
        const result = await financialEngine.collectReceivableBulk(user.uid, {
          contactId,
          amount: parsedAmount,
          accountId,
          date: parseLocalDate(date),
          observations: notes,
        });
        toast.success(`Abono de S/${parsedAmount.toFixed(2)} repartido en ${result.count} deuda(s) · ${result.fullyPaid} cancelada(s)`);
      } else {
        await financialEngine.collectReceivable(user.uid, {
          debtId: selectedDebtId,
          personId: contactId,
          contactId: contactId,
          amount: parsedAmount,
          accountId,
          date: parseLocalDate(date),
          observations: notes,
        });
        toast.success('Pago registrado correctamente');
      }

      // Invalidate relevant SWR caches (includes person/people data)
      invalidateAfterReceivable(user.uid);

      // Reset form
      setSelectedDebtId('');
      setAmount('');
      setAccountId('');
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
                  {bulkDebts.length > 1 && (
                    <option value={BULK}>
                      Abono general — repartir entre {bulkDebts.length} deudas (S/{bulkTotal.toFixed(2)})
                    </option>
                  )}
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
                    max={maxAmount}
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
                {isBulk && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Total pendiente en soles: S/{bulkTotal.toFixed(2)}. Se aplica de la deuda más antigua a la más reciente.
                  </p>
                )}
              </div>

              {/* Vista previa del reparto */}
              {isBulk && bulkPreview.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs space-y-1">
                  <p className="font-medium text-sm">
                    {bulkPreview.filter((a) => a.remaining < 0.01).length} deuda(s) quedan canceladas
                    {bulkPreview.some((a) => a.remaining >= 0.01) && ', 1 con abono parcial'}
                  </p>
                  <ul className="max-h-40 overflow-y-auto space-y-0.5 text-muted-foreground">
                    {bulkPreview.map((a) => (
                      <li key={a.debt.id} className="flex justify-between gap-2">
                        <span className="truncate">{a.debt.description}</span>
                        <span className="shrink-0">
                          S/{a.amount.toFixed(2)}
                          {a.remaining >= 0.01 ? ` · quedan S/${a.remaining.toFixed(2)}` : ' ✓'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Account */}
              <div>
                <label className="block text-sm font-medium mb-2">Cuenta de Destino *</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Selecciona en qué cuenta entra el dinero</option>
                  {accountOptions.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.nombre}
                    </option>
                  ))}
                </select>
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
                  disabled={isSubmitting || !selectedDebtId || !accountId}
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
