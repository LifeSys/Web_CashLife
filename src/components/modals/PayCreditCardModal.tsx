'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { CreditCard, Account } from '@/types';
import { creditCardService } from '@/services/credit-card.service';
import { financialEngine } from '@/services/financial-engine.service';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

interface PayCreditCardModalProps {
  card: CreditCard;
  userAccounts: Account[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

export function PayCreditCardModal({
  card,
  userAccounts,
  isOpen,
  onClose,
  onSuccess,
}: PayCreditCardModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState(String(card.montoUtilizado || 0));
  const [selectedAccountId, setSelectedAccountId] = useState(card.linkedAccountId || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedAccount = userAccounts.find(a => a.id === selectedAccountId);
  const paymentAmount = parseFloat(amount) || 0;
  const debtAmount = card.montoUtilizado || 0;
  const insufficientFunds = selectedAccount && paymentAmount > (selectedAccount.saldo || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !selectedAccountId) return;

    if (paymentAmount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    if (!selectedAccount || paymentAmount > (selectedAccount.saldo || 0)) {
      toast.error('Saldo insuficiente en la cuenta seleccionada');
      return;
    }

    setIsSubmitting(true);
    try {
      // Record the payment transaction
      await financialEngine.payCreditCard(user.uid, {
        monto: paymentAmount,
        descripcion: `Pago de ${card.nombre}`,
        fecha: new Date(),
        cuenta: selectedAccountId,
        cuentaId: selectedAccountId,
        creditCardId: card.id,
        notas: notes.trim() || undefined,
      });

      toast.success(`Pago de ${formatCurrency(paymentAmount)} registrado`);
      setAmount(String(debtAmount));
      setNotes('');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrar pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="border-b border-border p-4 md:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Pagar {card.nombre}</h2>
            <p className="text-sm text-muted-foreground mt-1">Deuda actual: {formatCurrency(debtAmount)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Monto a pagar *</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">S/</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-border bg-muted px-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Deuda: {formatCurrency(debtAmount)} | Disponible para pagar: {formatCurrency(debtAmount)}
            </p>
          </div>

          {/* Quick payment buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAmount(String(debtAmount))}
              className="flex-1 text-xs bg-muted hover:bg-muted/80 rounded px-2 py-1.5 transition-colors"
            >
              Pagar todo
            </button>
            <button
              type="button"
              onClick={() => setAmount(String(card.minimumPayment || 0))}
              className="flex-1 text-xs bg-muted hover:bg-muted/80 rounded px-2 py-1.5 transition-colors"
            >
              Pago mínimo
            </button>
            <button
              type="button"
              onClick={() => setAmount(String(debtAmount * 0.5))}
              className="flex-1 text-xs bg-muted hover:bg-muted/80 rounded px-2 py-1.5 transition-colors"
            >
              50%
            </button>
          </div>

          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Cuenta para pagar *</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona una cuenta</option>
              {userAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.nombre} - {formatCurrency(acc.saldo || 0)}
                </option>
              ))}
            </select>
          </div>

          {/* Account Info */}
          {selectedAccount && (
            <div className="bg-muted rounded-lg p-3 space-y-1">
              <p className="text-sm">
                <span className="text-muted-foreground">Cuenta:</span> <span className="font-semibold">{selectedAccount.nombre}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Saldo disponible:</span> <span className="font-semibold">{formatCurrency(selectedAccount.saldo || 0)}</span>
              </p>
              {insufficientFunds && (
                <p className="text-sm text-red-500">⚠️ Saldo insuficiente</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Referencia del pago, concepto, etc."
              rows={3}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Payment Summary */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-2">
            <p className="font-semibold text-sm">Resumen del pago</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Monto:</span>
                <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Desde:</span>
                <span className="font-semibold">{selectedAccount?.nombre || '--'}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span>Nueva deuda:</span>
                <span className={`font-bold ${Math.max(0, debtAmount - paymentAmount) === 0 ? 'text-green-500' : 'text-foreground'}`}>
                  {formatCurrency(Math.max(0, debtAmount - paymentAmount))}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-muted text-foreground font-semibold py-2 rounded-lg hover:bg-muted/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || insufficientFunds || paymentAmount <= 0}
              className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
