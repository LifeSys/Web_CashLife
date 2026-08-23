'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { scheduledPaymentService } from '@/services/financial.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { SplitRowsEditor, type SplitRow } from '@/components/common/SplitRowsEditor';
import { toast } from 'sonner';
import type { ScheduledPaymentFrequency } from '@/types';

interface ScheduledPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FREQUENCIES: { value: ScheduledPaymentFrequency; label: string }[] = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'yearly', label: 'Anual' },
];

export function ScheduledPaymentModal({ isOpen, onClose, onSuccess }: ScheduledPaymentModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const { categorias } = useCategories();
  const { invalidateAfterScheduledPayment } = useSWRInvalidation();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [frequency, setFrequency] = useState<ScheduledPaymentFrequency>('monthly');
  const [suggestedAccountId, setSuggestedAccountId] = useState('');
  const [showSplit, setShowSplit] = useState(false);
  const [splitRows, setSplitRows] = useState<SplitRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const accountOptions = cuentas.filter((c) => c.tipo !== 'credit_card');
  const expenseCategories = categorias.filter((c) => c.tipo === 'expense');

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategory('');
    setDueDay('1');
    setFrequency('monthly');
    setSuggestedAccountId('');
    setShowSplit(false);
    setSplitRows([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!name.trim() || !amount) {
      toast.error('Completa el nombre y el monto');
      return;
    }
    const parsedAmount = Number(amount);
    if (parsedAmount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    const parsedDay = Number(dueDay);
    if (!parsedDay || parsedDay < 1 || parsedDay > 31) {
      toast.error('El día debe estar entre 1 y 31');
      return;
    }

    const validSplits = splitRows
      .filter((r) => r.personId && Number(r.amount) > 0)
      .map((r) => ({ personId: r.personId, amount: Number(r.amount) }));

    setIsSubmitting(true);
    try {
      const created = await scheduledPaymentService.create(user.uid, {
        name: name.trim(),
        category: category || 'Otros',
        amount: parsedAmount,
        dueDay: parsedDay,
        frequency,
        active: true,
        reminders: [],
        suggestedAccountId: suggestedAccountId || undefined,
      });
      if (validSplits.length > 0) {
        await scheduledPaymentService.setSplits(user.uid, created.id, validSplits);
      }
      toast.success('Pago programado creado');
      invalidateAfterScheduledPayment(user.uid);
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear el pago programado');
      console.error('[CashLife] ScheduledPaymentModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Nuevo Pago Programado</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Movistar, Netflix, Alquiler..."
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="text-sm font-medium">Día de pago *</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Frecuencia</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as ScheduledPaymentFrequency)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="">Otros</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Cuenta sugerida</label>
            <select
              value={suggestedAccountId}
              onChange={(e) => setSuggestedAccountId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="">Sin sugerencia (elegir al pagar)</option>
              {accountOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-border pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSplit}
                onChange={(e) => {
                  setShowSplit(e.target.checked);
                  if (e.target.checked && splitRows.length === 0) setSplitRows([{ personId: '', amount: '' }]);
                }}
                className="rounded"
              />
              <span className="text-sm font-medium">¿Se divide con otras personas?</span>
            </label>
            {showSplit && (
              <div className="mt-3">
                <SplitRowsEditor rows={splitRows} onChange={setSplitRows} totalAmount={Number(amount) || undefined} />
                <p className="text-xs text-muted-foreground mt-2">
                  Cuando marques un mes como pagado, se creará automáticamente una cuenta por cobrar a cada persona con lo que le toca.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
