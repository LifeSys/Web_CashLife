'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Banknote, ChevronDown, HandCoins, Landmark, X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { financialEngine } from '@/services/financial-engine.service';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';
import { parseLocalDate, formatDateInput } from '@/lib/date';

interface ReceivablePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: string;
  maxAmount: number;
  personId: string;
  /** Nombre de quien paga, solo para mostrarlo en el encabezado. */
  personName?: string;
  currency?: string;
  onSuccess?: () => void;
}

const formatCurrency = (value: number, currency = 'PEN') =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(value);

/**
 * Registrar un cobro —total o "a cuenta"— en un par de toques: el monto
 * viene enfocado, Efectivo preseleccionado (lo más común cuando te dan una
 * parte en mano) y fecha/nota quedan plegadas para no estorbar.
 */
export function ReceivablePaymentModal({
  isOpen,
  onClose,
  debtId,
  maxAmount,
  personId,
  personName,
  currency = 'PEN',
  onSuccess,
}: ReceivablePaymentModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const { invalidateAfterReceivable } = useSWRInvalidation();
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [notes, setNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accountOptions = useMemo(() => {
    const money = cuentas.filter((c) => c.tipo !== 'credit_card');
    const efectivo = money.filter((c) => c.nombre === 'Efectivo');
    return [...efectivo, ...money.filter((c) => c.nombre !== 'Efectivo')];
  }, [cuentas]);

  useEffect(() => {
    if (!isOpen) return;
    setAmount('');
    setAccountId('');
    setDate(formatDateInput(new Date()));
    setNotes('');
    setShowDetails(false);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [isOpen, debtId]);

  // Efectivo por defecto en cuanto las cuentas estén cargadas.
  useEffect(() => {
    if (isOpen && !accountId && accountOptions.length > 0) setAccountId(accountOptions[0].id);
  }, [isOpen, accountId, accountOptions]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amount.replace(',', '.'));
  const isValidFormat = /^\d+([.,]\d{1,2})?$/.test(amount.trim()) && Number.isFinite(parsedAmount);
  const exceeds = isValidFormat && parsedAmount > maxAmount + 0.001;
  const isValid = isValidFormat && parsedAmount > 0 && !exceeds;
  const remaining = isValid ? Math.max(Math.round((maxAmount - parsedAmount) * 100) / 100, 0) : maxAmount;
  const isFull = isValid && remaining < 0.01;
  const half = Math.round((maxAmount / 2) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!isValid) {
      toast.error(exceeds ? `El monto no puede pasar de ${formatCurrency(maxAmount, currency)}` : 'Ingresa cuánto te pagaron');
      return;
    }
    if (!accountId) {
      toast.error('Elige a qué cuenta entra el dinero');
      return;
    }

    setIsSubmitting(true);
    try {
      await financialEngine.collectReceivable(user.uid, {
        debtId,
        personId,
        contactId: personId,
        amount: parsedAmount,
        accountId,
        date: parseLocalDate(date),
        observations: notes,
      });
      toast.success(
        isFull
          ? `Cobrado completo · ${formatCurrency(parsedAmount, currency)}`
          : `Abono de ${formatCurrency(parsedAmount, currency)} registrado · quedan ${formatCurrency(remaining, currency)}`
      );
      invalidateAfterReceivable(user.uid);
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('No se pudo registrar el cobro');
      console.error('[CashLife] ReceivablePaymentModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const chipBase =
    'rounded-lg border px-3 py-1.5 text-xs font-semibold tabular-nums transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.96]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receivable-payment-title"
        className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl bg-card shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-2 md:zoom-in-[0.97] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
      >
        <div className="flex items-start justify-between gap-4 p-5 md:p-6 pb-0 md:pb-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <HandCoins className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="receivable-payment-title" className="text-lg font-semibold tracking-tight">Registrar cobro</h2>
              <p className="text-sm text-muted-foreground truncate">{personName || 'Total o a cuenta'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 md:p-6">
          <div className="flex items-baseline justify-between rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm text-muted-foreground">Te debe</span>
            <span className="font-semibold tabular-nums">{formatCurrency(maxAmount, currency)}</span>
          </div>

          <div>
            <label htmlFor="receivable-amount" className="mb-2 block text-sm font-medium">
              ¿Cuánto te pagó?
            </label>
            <input
              ref={inputRef}
              id="receivable-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              aria-invalid={exceeds}
              className={`w-full rounded-xl border bg-muted px-4 py-3 text-2xl font-semibold tabular-nums tracking-tight outline-none transition-[border-color,box-shadow] focus:ring-2 ${
                exceeds ? 'border-red-500 focus:ring-red-500/30' : 'border-border focus:border-primary focus:ring-primary/30'
              }`}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAmount(maxAmount.toFixed(2))}
                className={`${chipBase} border-border hover:bg-muted`}
              >
                Todo · {formatCurrency(maxAmount, currency)}
              </button>
              {half >= 1 && (
                <button
                  type="button"
                  onClick={() => setAmount(half.toFixed(2))}
                  className={`${chipBase} border-border hover:bg-muted`}
                >
                  Mitad · {formatCurrency(half, currency)}
                </button>
              )}
            </div>
            <p aria-live="polite" className={`mt-2 text-xs ${exceeds ? 'text-red-500' : 'text-muted-foreground'}`}>
              {exceeds
                ? `Máximo ${formatCurrency(maxAmount, currency)}`
                : isValid
                  ? isFull
                    ? 'Queda cobrada por completo.'
                    : `Es un abono a cuenta — quedarán ${formatCurrency(remaining, currency)} pendientes.`
                  : 'Puedes registrar solo una parte; el resto sigue pendiente.'}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">¿Dónde entra el dinero?</p>
            <div className="flex flex-wrap gap-2">
              {accountOptions.map((c) => {
                const selected = c.id === accountId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAccountId(c.id)}
                    aria-pressed={selected}
                    className={`${chipBase} flex items-center gap-1.5 ${
                      selected
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {c.nombre === 'Efectivo' ? <Banknote className="h-3.5 w-3.5" /> : <Landmark className="h-3.5 w-3.5" />}
                    {c.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              aria-expanded={showDetails}
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} />
              Fecha y nota
            </button>
            {showDetails && (
              <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label="Fecha del cobro"
                  className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nota (opcional)"
                  maxLength={160}
                  aria-label="Nota"
                  className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-border py-2.5 font-medium transition-[background-color,transform] duration-150 hover:bg-muted active:scale-[0.97] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid || !accountId}
              className="flex-1 rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando…' : isFull || !isValid ? 'Registrar cobro' : 'Registrar abono'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
