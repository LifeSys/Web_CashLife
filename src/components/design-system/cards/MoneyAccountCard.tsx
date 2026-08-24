'use client';

import { Account } from '@/types';
import { Landmark, Lock, Eye, Edit2, Trash2, Banknote } from 'lucide-react';

interface MoneyAccountCardProps {
  account: Account;
  isEfectivo: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewTransactions?: () => void;
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
      ? 'bg-gradient-to-br from-slate-600 to-slate-700'
      : 'bg-gradient-to-br from-blue-600 to-blue-700';
  const bgStyle = customColor ? { backgroundImage: `linear-gradient(to bottom right, ${customColor}, ${customColor}cc)` } : undefined;

  const textColor = isEfectivo ? 'text-slate-300' : customColor ? 'text-white/80' : 'text-blue-100';

  if (compact) {
    return (
      <div style={bgStyle} className={`${bgGradient} rounded-xl p-3 text-white shadow-md hover:shadow-lg transition-shadow flex flex-wrap items-center gap-2`}>
        <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
          {isEfectivo ? <Banknote className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-[120px]">
          <p className="font-bold text-sm truncate flex items-center gap-1.5">
            {account.nombre}
            {isEfectivo && <Lock className="w-3 h-3 text-yellow-300 flex-shrink-0" />}
          </p>
          <p className={`text-xs ${textColor} truncate`}>
            {getAccountTypeLabel()}{!isEfectivo && account.banco ? ` · ${account.banco}` : ''}
          </p>
        </div>
        <p className="font-bold text-sm whitespace-nowrap flex-shrink-0">
          {formatCurrency(account.saldo || 0, account.moneda || account.currency || 'PEN')}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onViewTransactions} title="Ver movimientos" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          {!isEfectivo && onEdit && (
            <button onClick={onEdit} title="Editar cuenta" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {!isEfectivo && onDelete && (
            <button onClick={onDelete} title="Eliminar cuenta" className="p-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
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
