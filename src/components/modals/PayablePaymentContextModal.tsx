'use client';

import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { usePayableObligations } from '@/hooks/useFinancial';
import { financialEngine } from '@/services/financial-engine.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';
import { parseLocalDate, formatDateInput } from '@/lib/date';

interface PayablePaymentContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
  onSuccess?: () => void;
}

/**
 * Abono parcial contra una obligación existente (lo que YO le debo a un
 * contacto). Análogo a ReceivablePaymentContextModal pero del lado "Le
 * Debo": permite pagar solo una parte (ej. debo 150, pago 100 a cuenta) sin
 * cerrar la obligación completa.
 */
export function PayablePaymentContextModal({
  isOpen,
  onClose,
  contactId,
  contactName,
  onSuccess,
}: PayablePaymentContextModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const { obligations } = usePayableObligations();
  const { invalidateAfterPayable } = useSWRInvalidation();

  const [selectedObligationId, setSelectedObligationId] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactObligations = useMemo(
    () => obligations.filter((o) => (o.contactId ?? o.personId) === contactId && o.status !== 'paid'),
    [obligations, contactId]
  );

  const selectedObligation = useMemo(
    () => contactObligations.find((o) => o.id === selectedObligationId),
    [contactObligations, selectedObligationId]
  );

  const accountOptions = useMemo(
    () => cuentas.filter((c) => c.tipo !== 'credit_card'),
    [cuentas]
  );

  const handleObligationChange = (obligationId: string) => {
    setSelectedObligationId(obligationId);
    const obligation = contactObligations.find((o) => o.id === obligationId);
    if (obligation) {
      setAmount(obligation.pendingBalance.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid || !selectedObligationId || !amount || !accountId) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!selectedObligation) {
      toast.error('Obligación no encontrada');
      return;
    }

    const parsedAmount = Number(amount);
    if (parsedAmount <= 0 || parsedAmount > selectedObligation.pendingBalance) {
      toast.error(`El monto debe ser entre 0 y ${selectedObligation.pendingBalance.toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await financialEngine.payObligation(user.uid, {
        obligationId: selectedObligationId,
        personId: contactId,
        contactId: contactId,
        amount: parsedAmount,
        accountId,
        date: parseLocalDate(date),
        observations: notes,
      });

      toast.success('Pago registrado correctamente');

      invalidateAfterPayable(user.uid);

      setSelectedObligationId('');
      setAmount('');
      setAccountId('');
      setDate(formatDateInput(new Date()));
      setNotes('');

      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Error al registrar el pago');
      console.error('[CashLife] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Registrar Pago Realizado</h2>
            <p className="text-sm text-muted-foreground mt-1">A {contactName} (Abono a lo que le debo)</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {contactObligations.length === 0 ? (
            <div className="rounded-lg bg-muted/50 border border-border p-4 text-center">
              <p className="text-sm text-muted-foreground">No hay obligaciones pendientes con este contacto</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Selecciona Obligación *</label>
                <select
                  value={selectedObligationId}
                  onChange={(e) => handleObligationChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Elige una obligación pendiente</option>
                  {contactObligations.map((obligation) => (
                    <option key={obligation.id} value={obligation.id}>
                      {obligation.description} - Pendiente: S/{obligation.pendingBalance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monto a Pagar *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">S/</span>
                  <input
                    type="number"
                    step="0.01"
                    max={selectedObligation?.pendingBalance}
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                {selectedObligation && (
                  <p className="mt-1 text-xs text-muted-foreground">Pendiente: S/{selectedObligation.pendingBalance.toFixed(2)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cuenta de Origen *</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Selecciona la cuenta desde donde pagas</option>
                  {accountOptions.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fecha del Pago</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

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
                  disabled={isSubmitting || !selectedObligationId}
                  className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Registrar Pago'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
