'use client';

import { Account } from '@/types';
import { Landmark, Lock, Eye, Edit2, Trash2, Banknote, Scale } from 'lucide-react';

interface MoneyAccountCardProps {
  account: Account;
  isEfectivo: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewTransactions?: () => void;
  /** Abre la regularización de saldo (cuadrar con el banco o el efectivo contado). */
  onAdjust?: () => void;
  /** Fila angosta tipo lista en vez de la tarjeta grande. */
  compact?: boolean;
}

const formatCurrency = (value: number, currency: string = 'PEN') =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(value);

const formatDate = (date: any) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: '2-digit' });
};

export function MoneyAccountCard({
  account,
  isEfectivo,
  onEdit,
  onDelete,
  onViewTransactions,
  onAdjust,
  compact = false,
}: MoneyAccountCardProps) {
  const getAccountTypeLabel = () => {
    switch (account.tipo) {
      case 'cash':
        return 'Efectivo';
      case 'bank':
        return 'Cuenta Bancaria';
      case 'safe_box':
        return 'Caja Fuerte';
      default:
        return 'Cuenta';
    }
  };

  const getAccountIcon = () => {
    if (isEfectivo) return <Banknote className="w-8 h-8" />;
    return <Landmark className="w-8 h-8" />;
  };

  // Si el usuario personalizó un color para esta cuenta, se arma un
  // degradado a partir de ese color (en vez de las clases fijas azul/gris)
  // para poder distinguir cuentas de un vistazo, igual que las tarjetas de
  // crédito ya permiten.
  const customColor = !isEfectivo ? account.color : undefined;
  const bgGradient = customColor
    ? ''
    : isEfectivo
      ? 'bg-gradient-to-br from-slate-600 to-slate-800'
      : 'bg-gradient-to-br from-blue-600 to-blue-800';
  const bgStyle = customColor ? { backgroundImage: `linear-gradient(135deg, ${customColor}, color-mix(in oklab, ${customColor} 70%, black))` } : undefined;

  const textColor = isEfectivo ? 'text-slate-300' : customColor ? 'text-white/80' : 'text-blue-100';

  if (compact) {
    const iconBtn =
      'grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white/90 transition-[background-color,transform] duration-150 ease-out hover:bg-white/20 hover:text-white active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70';
    return (
      <article
        style={bgStyle}
        className={`${bgGradient} group relative isolate flex flex-col overflow-clip rounded-2xl p-4 text-white shadow-[0_1px_2px_rgb(0_0_0/0.25),0_8px_24px_-12px_rgb(0_0_0/0.5)] ring-1 ring-inset ring-white/10 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgb(0_0_0/0.25),0_16px_32px_-12px_rgb(0_0_0/0.55)]`}
      >
        {/* Brillo suave arriba-derecha: da profundidad sin cambiar el color elegido. */}
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 -z-10 h-48 w-48 rounded-full bg-white/15 blur-3xl" />

        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/15">
            {isEfectivo ? <Banknote className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1.5 text-[15px] font-semibold leading-tight tracking-tight">
              <span className="truncate">{account.nombre}</span>
              {isEfectivo && <Lock className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-label="Cuenta protegida" />}
            </h3>
            <p className={`mt-0.5 truncate text-xs ${textColor}`}>
              {getAccountTypeLabel()}{!isEfectivo && account.banco ? ` · ${account.banco}` : ''}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-[11px] font-medium uppercase tracking-wider ${textColor}`}>Saldo</p>
            <p className="truncate text-2xl font-semibold tabular-nums tracking-tight">
              {formatCurrency(account.saldo || 0, account.moneda || account.currency || 'PEN')}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {onAdjust && (
              <button
                onClick={onAdjust}
                title="Regularizar saldo"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-white/90 px-3 text-xs font-semibold text-slate-900 transition-[background-color,transform] duration-150 ease-out hover:bg-white active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <Scale className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Regularizar</span>
              </button>
            )}
            <button onClick={onViewTransactions} title="Ver movimientos" aria-label="Ver movimientos" className={iconBtn}>
              <Eye className="h-4 w-4" />
            </button>
            {!isEfectivo && onEdit && (
              <button onClick={onEdit} title="Editar cuenta" aria-label="Editar cuenta" className={iconBtn}>
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {!isEfectivo && onDelete && (
              <button
                onClick={onDelete}
                title="Eliminar cuenta"
                aria-label="Eliminar cuenta"
                className={`${iconBtn} hover:bg-red-500/70`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div style={bgStyle} className={`${bgGradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      {/* Header with icon and lock (if Efectivo) */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-lg">{getAccountIcon()}</div>
          <div>
            <h3 className="text-lg font-bold">{account.nombre}</h3>
            <p className={`text-sm ${textColor}`}>{getAccountTypeLabel()}</p>
          </div>
        </div>
        {isEfectivo && <Lock className="w-5 h-5 text-yellow-300" />}
      </div>

      {/* Balance section */}
      <div className="mb-6 pb-6 border-b border-white/20">
        <p className={`text-sm ${textColor} mb-2`}>Saldo disponible</p>
        <p className="text-3xl font-bold">{formatCurrency(account.saldo || 0, account.moneda || account.currency || 'PEN')}</p>
      </div>

      {/* Bank and debit card info (only for bank accounts) */}
      {!isEfectivo && account.tipo === 'bank' && (
        <div className="mb-6 space-y-2">
          {account.banco && (
            <div className="flex items-center justify-between text-sm">
              <span className={textColor}>Banco</span>
              <span className="font-semibold">{account.banco}</span>
            </div>
          )}
          {account.hasDebitCard && (
            <div className="flex items-center justify-between text-sm">
              <span className={textColor}>Tarjeta de débito</span>
              <span className="font-semibold flex items-center gap-2">
                {account.hasYape && <span className="text-xs bg-white/20 px-2 py-1 rounded">Yape</span>}
                {account.hasPlin && <span className="text-xs bg-white/20 px-2 py-1 rounded">Plin</span>}
                {!account.hasYape && !account.hasPlin && <span className="text-xs opacity-70">Sin vincular</span>}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewTransactions}
          className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-semibold transition-colors"
          title="Ver movimientos"
        >
          <Eye className="w-4 h-4" />
          Ver movimientos
        </button>
        {!isEfectivo && (
          <>
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-semibold transition-colors"
              title="Editar cuenta"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg py-2 text-sm font-semibold transition-colors"
              title="Eliminar cuenta"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
