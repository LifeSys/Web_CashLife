'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCategories } from '@/hooks/useCategories';
import { useScheduledPaymentSplits } from '@/hooks/useFinancial';
import { scheduledPaymentService } from '@/services/financial.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { SplitRowsEditor, type SplitRow } from '@/components/common/SplitRowsEditor';
import { toast } from 'sonner';
import type { ScheduledPayment, ScheduledPaymentFrequency } from '@/types';

interface ScheduledPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  payment?: ScheduledPayment | null;
}

const FREQUENCIES: { value: ScheduledPaymentFrequency; label: string }[] = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'yearly', label: 'Anual' },
];

export function ScheduledPaymentModal({ isOpen, onClose, onSuccess, payment }: ScheduledPaymentModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const { creditCards } = useCreditCards();
  const { categorias } = useCategories();
  const { splits: existingSplits } = useScheduledPaymentSplits(payment?.id);
  const { invalidateAfterScheduledPayment } = useSWRInvalidation();
  const isEditing = !!payment;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [frequency, setFrequency] = useState<ScheduledPaymentFrequency>('monthly');
  const [suggestedAccountId, setSuggestedAccountId] = useState('');
  const [autoPay, setAutoPay] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [splitRows, setSplitRows] = useState<SplitRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // `existingSplits` es un array nuevo en cada render mientras no hay datos
  // (useSWR devuelve `data ?? []`), así que no puede ir directo en las
  // dependencias del effect — provocaría un loop infinito de renders. Se usa
  // en su lugar una "firma" en texto que solo cambia cuando el contenido
  // realmente cambia.
  const existingSplitsSignature = existingSplits.map((s) => `${s.personId}:${s.amount}`).join('|');

  useEffect(() => {
    if (!isOpen) return;
    setName(payment?.name ?? '');
    setAmount(payment ? String(payment.amount) : '');
    setCategory(payment?.category === 'Otros' ? '' : payment?.category ?? '');
    setDueDay(payment ? String(payment.dueDay) : '1');
    setFrequency(payment?.frequency ?? 'monthly');
    setSuggestedAccountId(payment?.suggestedAccountId ?? '');
    setAutoPay(payment?.autoPay ?? false);
    if (payment) {
      const rows = existingSplits.map((s) => ({ personId: s.personId, amount: String(s.amount) }));
      setShowSplit(rows.length > 0);
      setSplitRows(rows.length > 0 ? rows : [{ personId: '', amount: '' }]);
    } else {
      setShowSplit(false);
      setSplitRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, payment, existingSplitsSignature]);

  if (!isOpen) return null;

  const accountOptions = cuentas.filter((c) => c.tipo !== 'credit_card');
  const expenseCategories = categorias.filter((c) => c.tipo === 'expense');

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
    if (autoPay && !suggestedAccountId) {
      toast.error('Elige de qué cuenta o tarjeta se hace el cargo automático');
      return;
    }

    const validSplits = splitRows
      .filter((r) => r.personId && Number(r.amount) > 0)
      .map((r) => ({ personId: r.personId, amount: Number(r.amount) }));

    setIsSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        category: category || 'Otros',
        amount: parsedAmount,
        dueDay: parsedDay,
        frequency,
        suggestedAccountId: suggestedAccountId || undefined,
        autoPay,
      };

      if (isEditing) {
        await scheduledPaymentService.update(user.uid, payment.id, data);
        await scheduledPaymentService.setSplits(user.uid, payment.id, showSplit ? validSplits : []);
        toast.success('Pago programado actualizado');
      } else {
        const created = await scheduledPaymentService.create(user.uid, { ...data, active: true, reminders: [] });
        if (validSplits.length > 0) {
          await scheduledPaymentService.setSplits(user.uid, created.id, validSplits);
        }
        toast.success('Pago programado creado');
      }
      invalidateAfterScheduledPayment(user.uid);
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el pago programado');
      console.error('[CashLife] ScheduledPaymentModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Pago Programado' : 'Nuevo Pago Programado'}</h2>
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
              <label className="text-sm font-medium">{showSplit ? 'Costo real *' : 'Monto *'}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
              {showSplit && (
                <p className="text-xs text-muted-foreground mt-1">Lo que a ti te cobran — no lo que cobras a los demás.</p>
              )}
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
            <label className="text-sm font-medium">{autoPay ? 'Cuenta o tarjeta de cargo automático *' : 'Cuenta o tarjeta sugerida'}</label>
            <select
              value={suggestedAccountId}
              onChange={(e) => setSuggestedAccountId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="">{autoPay ? 'Elige una cuenta o tarjeta' : 'Sin sugerencia (elegir al pagar)'}</option>
              <optgroup label="Cuentas">
                {accountOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </optgroup>
              <optgroup label="Tarjetas de crédito">
                {creditCards.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} •••• {c.lastDigits}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="border-t border-border pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPay}
                onChange={(e) => setAutoPay(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">¿Se cobra solo (cargo/débito automático)?</span>
            </label>
            {autoPay && (
              <p className="text-xs text-muted-foreground mt-2">
                No tendrás que marcarlo como pagado: en cuanto llegue el día de cobro, CashLife lo registra solo con la cuenta o tarjeta que elijas arriba.
              </p>
            )}
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
                  Cuando marques un mes como pagado, se creará automáticamente una cuenta por cobrar a cada persona con lo que le toca —
                  puedes poner más de lo que te cuesta a ti (ej. por gastos extra de gestionarlo) y esa diferencia queda como tu margen.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
