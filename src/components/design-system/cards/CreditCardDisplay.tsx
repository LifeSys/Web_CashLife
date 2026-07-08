'use client';

import { CreditCard, Account } from '@/types';
import { Zap, Eye, CreditCard as CardIcon, Edit2, Trash2, TrendingDown } from 'lucide-react';
import { ProgressBar } from '../feedback/ProgressBar';

interface CreditCardDisplayProps {
  card: CreditCard;
  account?: Account | null;
  onPay?: () => void;
  onRecordCharge?: () => void;
  onViewTransactions?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

const formatDate = (date: Date | string | number) => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  } catch {
    return '--';
  }
};

export function CreditCardDisplay({
  card,
  account,
  onPay,
  onRecordCharge,
  onViewTransactions,
  onEdit,
  onDelete,
}: CreditCardDisplayProps) {
  const available = card.lineaCredito - (card.montoUtilizado || 0);
  const percentageUsed = ((card.montoUtilizado || 0) / card.lineaCredito) * 100;
  const isNearLimit = percentageUsed > 80;

  // Get brand color or use card color
  const cardColor = card.cardColor || '#3B82F6';

  return (
    <div className="space-y-4">
      {/* Visual Card */}
      <div
        style={{ background: `linear-gradient(135deg, ${cardColor}cc 0%, ${cardColor} 100%)` }}
        className="rounded-3xl p-8 text-white aspect-video flex flex-col justify-between shadow-xl hover:shadow-2xl transition-shadow"
      >
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-80 font-semibold">{card.banco}</p>
              <p className="text-xs opacity-70 mt-1">{card.marca}</p>
            </div>
            <CardIcon className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-lg font-mono tracking-widest">•••• •••• •••• {card.lastDigits}</p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs opacity-70 mb-1">MONEDA</p>
            <p className="font-semibold">{card.currency}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70 mb-1">CORTE</p>
            <p className="font-mono text-sm">{card.cutOffDay}</p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Credit Info */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-muted-foreground">Línea de Crédito</span>
            <span className="text-lg font-bold">{formatCurrency(card.lineaCredito)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Disponible</p>
              <p className="text-xl font-bold text-green-500">{formatCurrency(available)}</p>
            </div>
            <div className={`${isNearLimit ? 'bg-red-500/10' : 'bg-amber-500/10'} rounded-lg p-3`}>
              <p className="text-xs text-muted-foreground mb-1">Utilizado</p>
              <p className={`text-xl font-bold ${isNearLimit ? 'text-red-500' : 'text-amber-500'}`}>
                {formatCurrency(card.montoUtilizado || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <ProgressBar
            percentage={percentageUsed}
            label="Uso de Crédito"
            color={percentageUsed > 80 ? 'red' : percentageUsed > 50 ? 'amber' : 'emerald'}
          />
        </div>

        {/* Important Details Grid */}
        <div className="border-t border-border pt-4">
          <p className="text-sm font-semibold mb-4">Detalles de la tarjeta</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Día de Corte</p>
                <p className="font-bold text-sm">{card.cutOffDay}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vencimiento</p>
                <p className="font-bold text-sm">{card.duePaymentDay}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pago mínimo</p>
                <p className="font-bold text-sm">{formatCurrency(card.minimumPayment || 0)}</p>
              </div>
            </div>

            {card.tasaInteres || card.interestRate ? (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-orange-500">%</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tasa de interés</p>
                  <p className="font-bold text-sm">{((card.tasaInteres || card.interestRate) || 0).toFixed(2)}%</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Associated Account */}
        {account && (
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-2">Cuenta asociada para pagos</p>
            <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
              <span className="font-semibold text-sm">{account.nombre}</span>
              <span className="text-xs text-muted-foreground">{formatCurrency(account.saldo || 0)}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {card.notes && (
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-2">Notas</p>
            <p className="text-sm text-foreground">{card.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-border pt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          {onPay && (
            <button
              onClick={onPay}
              className="bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Pagar
            </button>
          )}
          {onRecordCharge && (
            <button
              onClick={onRecordCharge}
              className="bg-muted text-muted-foreground font-semibold py-2 rounded-lg hover:bg-muted/80 transition-colors text-sm"
            >
              Registrar compra
            </button>
          )}
          {onViewTransactions && (
            <button
              onClick={onViewTransactions}
              className="bg-muted text-muted-foreground font-semibold py-2 rounded-lg hover:bg-muted/80 transition-colors text-sm flex items-center justify-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Ver
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="bg-blue-500/10 text-blue-500 font-semibold py-2 rounded-lg hover:bg-blue-500/20 transition-colors text-sm flex items-center justify-center gap-1"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="bg-red-500/10 text-red-500 font-semibold py-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm flex items-center justify-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
