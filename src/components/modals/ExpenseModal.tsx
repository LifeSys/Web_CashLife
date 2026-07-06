'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { financialEngine } from '@/services/financial-engine.service';
import { toast } from 'sonner';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const { categorias } = useCategories();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !description || !amount || !accountId) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    const parsedAmount = Number(amount);
    if (parsedAmount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await financialEngine.createExpense(user.uid, {
        monto: parsedAmount,
        descripcion: description,
        fecha: new Date(date),
        cuenta: accountId,
        categoria: categoryId || undefined,
        notas: notes,
      });
      toast.success('Gasto registrado correctamente');
      setDescription('');
      setAmount('');
      setAccountId('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Error al registrar el gasto');
      console.error('[v0] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const accountOptions = cuentas.filter((c) => c.tipo !== 'credit_card');
  const expenseCategories = categorias.filter((c) => c.tipo === 'expense' || c.tipo === 'gasto' || c.tipo === 'both');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Nuevo Gasto</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Descripción *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Comida, transporte..."
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
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
            <label className="text-sm font-medium">Cuenta *</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
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
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="">Sin categoría</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
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
              {isSubmitting ? 'Guardando...' : 'Registrar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
