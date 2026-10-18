'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Scale, X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { accountService } from '@/services/account.service';
import { toast } from 'sonner';
import type { Account } from '@/types';

interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSuccess?: () => void;
}

const formatCurrency = (value: number, currency: string = 'PEN') =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(value);

export function AdjustBalanceModal({ isOpen, onClose, account, onSuccess }: AdjustBalanceModalProps) {
  const { user } = useAuth();
  const [realBalance, setRealBalance] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && account) {
      setRealBalance((account.saldo ?? 0).toFixed(2));
      setReason('');
      // Tras el re-render con el saldo inicial, así escribir reemplaza el monto.
      const t = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 30);
      return () => clearTimeout(t);
    }
  }, [isOpen, account]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !account) return null;

  const currency = account.moneda || account.currency || 'PEN';
  const currentBalance = account.saldo ?? 0;
  const parsed = parseFloat(realBalance.replace(',', '.'));
  const isValid = /^-?\d+([.,]\d{1,2})?$/.test(realBalance.trim()) && Number.isFinite(parsed);
  const delta = isValid ? Math.round((parsed - currentBalance) * 100) / 100 : 0;
  const hasChange = isValid && Math.abs(delta) >= 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!isValid) {
      toast.error('Ingresa el saldo real de la cuenta');
      return;
    }
    if (!hasChange) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await accountService.adjustBalance(user.uid, account.id, parsed, reason.trim());
      toast.success(`Saldo regularizado a ${formatCurrency(parsed, currency)}`);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo regularizar el saldo');
      console.error('[CashLife] AdjustBalanceModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        aria-labelledby="adjust-balance-title"
        className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl bg-card shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-2 md:zoom-in-[0.97] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
      >
        <div className="flex items-start justify-between gap-4 p-5 md:p-6 pb-0 md:pb-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Scale className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="adjust-balance-title" className="text-lg font-semibold tracking-tight">Regularizar saldo</h2>
              <p className="text-sm text-muted-foreground truncate">{account.nombre}</p>
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
            <span className="text-sm text-muted-foreground">Saldo en CashLife</span>
            <span className="font-semibold tabular-nums">{formatCurrency(currentBalance, currency)}</span>
          </div>

          <div>
            <label htmlFor="adjust-real-balance" className="mb-2 block text-sm font-medium">
              Saldo real
            </label>
            <input
              ref={inputRef}
              id="adjust-real-balance"
              type="text"
              inputMode="decimal"
              value={realBalance}
              onChange={(e) => setRealBalance(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-2xl font-semibold tabular-nums tracking-tight outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Lo que ves en tu app del banco o lo que contaste en efectivo.
            </p>
          </div>

          <div
            aria-live="polite"
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
              !hasChange
                ? 'border-border text-muted-foreground'
                : delta > 0
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            <span className="flex items-center gap-2">
              {hasChange && (delta > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />)}
              {!hasChange ? 'Sin diferencia' : delta > 0 ? 'Se registrará un ingreso' : 'Se registrará un gasto'}
            </span>
            {hasChange && (
              <span className="font-semibold tabular-nums">
                {delta > 0 ? '+' : '−'}
                {formatCurrency(Math.abs(delta), currency)}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="adjust-reason" className="mb-2 block text-sm font-medium">
              Motivo <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="adjust-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. cuadre con estado de cuenta, comisión no registrada"
              maxLength={120}
              className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            La diferencia queda como movimiento de categoría <span className="font-medium text-foreground">Ajuste</span>, así siempre sabrás por qué cambió el saldo.
          </p>

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
              disabled={isSubmitting || !isValid}
              className="flex-1 rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando…' : hasChange ? 'Regularizar' : 'Listo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
