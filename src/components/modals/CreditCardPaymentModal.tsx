'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { financialEngine } from '@/services/financial-engine.service';
import { toast } from 'sonner';

interface CreditCardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditCardId: string;
  usedAmount: number;
  creditCardName: string;
  onSuccess?: () => void;
}

export function CreditCardPaymentModal({
  isOpen,
  onClose,
  creditCardId,
  usedAmount,
  creditCardName,
  onSuccess,
}: CreditCardPaymentModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const [amount, setAmount] = useState(String(usedAmount));
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !amount || !accountId) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const parsedAmount = Number(amount);
    if (parsedAmount <= 0 || parsedAmount > usedAmount) {
      toast.error(`El monto debe ser entre 0 y ${usedAmount}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await financialEngine.payCreditCard(user.uid, {
        creditCardId,
        monto: parsedAmount,
        cuenta: accountId,
        descripcion: `Pago de tarjeta: ${creditCardName}`,
        fecha: new Date(date),
        notas: notes,
      });
      toast.success('Pago registrado correctamente');
      setAmount(String(usedAmount));
      setAccountId('');
      setDate(new Date().toISOString().split('T')[0]);
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

  const accountOptions = cuentas.filter((c) => c.tipo !== 'credit_card');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Pago de Tarjeta</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">Tarjeta</p>
            <p className="font-bold">{creditCardName}</p>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">Saldo Utilizado</p>
            <p className="text-2xl font-bold">{usedAmount.toFixed(2)}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Monto a Pagar *</label>
            <input
              type="number"
              step="0.01"
              max={usedAmount}
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">Máximo: {usedAmount.toFixed(2)}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Cuenta de Pago *</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="">Selecciona una cuenta</option>
              {accountOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} - Saldo: {(c.saldo || c.balance || 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

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
            <label className="text-sm font-medium">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
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
              {isSubmitting ? 'Guardando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
