'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { financialEngine } from '@/services/financial-engine.service';
import { toast } from 'sonner';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransferModal({ isOpen, onClose, onSuccess }: TransferModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !fromAccountId || !toAccountId || !amount) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (fromAccountId === toAccountId) {
      toast.error('No puedes transferir a la misma cuenta');
      return;
    }

    const parsedAmount = Number(amount);
    if (parsedAmount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await financialEngine.createTransfer(user.uid, {
        monto: parsedAmount,
        descripcion: description || 'Transferencia entre cuentas',
        fecha: new Date(date),
        cuenta: fromAccountId,
        destinationAccountId: toAccountId,
      });
      toast.success('Transferencia realizada correctamente');
      setFromAccountId('');
      setToAccountId('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Error al realizar la transferencia');
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
          <h2 className="text-xl font-bold">Transferencia</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">De (Cuenta Origen) *</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
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
            <label className="text-sm font-medium">Para (Cuenta Destino) *</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="">Selecciona una cuenta</option>
              {accountOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Monto *</label>
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
            <label className="text-sm font-medium">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de servicios"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
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
              {isSubmitting ? 'Procesando...' : 'Transferir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
