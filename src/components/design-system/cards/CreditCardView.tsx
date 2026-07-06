import { ReactNode } from 'react';
import { ProgressBar } from '../feedback/ProgressBar';
import { Zap } from 'lucide-react';

interface CreditCardViewProps {
  bankName: string;
  cardBrand: string;
  cardNumber: string;
  holderName: string;
  gradient: string;
  creditLine: number;
  used: number;
  cutDate: Date;
  paymentDate: Date;
  icon: ReactNode;
  recentTransactions?: Array<{ description: string; amount: number; date: Date }>;
  onPay?: () => void;
  onViewTransactions?: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
};

export function CreditCardView({
  bankName,
  cardBrand,
  cardNumber,
  holderName,
  gradient,
  creditLine,
  used,
  cutDate,
  paymentDate,
  icon,
  recentTransactions,
  onPay,
  onViewTransactions,
}: CreditCardViewProps) {
  const available = creditLine - used;
  const percentageUsed = (used / creditLine) * 100;
  const isNearLimit = percentageUsed > 80;

  return (
    <div className="space-y-4">
      {/* Visual Card */}
      <div
        className={`${gradient} rounded-3xl p-8 text-white aspect-video flex flex-col justify-between shadow-xl transform hover:scale-105 transition-transform duration-200`}
      >
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-80 font-semibold">{bankName}</p>
              <p className="text-xs opacity-70 mt-1">{cardBrand}</p>
            </div>
            <div className="text-3xl">{icon}</div>
          </div>
          <p className="text-lg font-mono tracking-widest">•••• •••• •••• {cardNumber}</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs opacity-70 mb-1">TITULAR</p>
            <p className="font-semibold">{holderName.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70 mb-1">VENCE</p>
            <p className="font-mono">{formatDate(paymentDate)}</p>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Credit Info */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-muted-foreground">Línea de Crédito</span>
            <span className="text-lg font-bold">{formatCurrency(creditLine)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Disponible</p>
              <p className="text-xl font-bold text-green-500">{formatCurrency(available)}</p>
            </div>
            <div className={`${isNearLimit ? 'bg-red-500/10' : 'bg-amber-500/10'} rounded-lg p-3`}>
              <p className="text-xs text-muted-foreground mb-1">Utilizado</p>
              <p className={`text-xl font-bold ${isNearLimit ? 'text-red-500' : 'text-amber-500'}`}>
                {formatCurrency(used)}
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

        {/* Important Dates */}
        <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha de Corte</p>
              <p className="font-bold text-sm">{formatDate(cutDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha de Pago</p>
              <p className="font-bold text-sm">{formatDate(paymentDate)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border">
          {onPay && (
            <button className="flex-1 bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors">
              Pagar Ahora
            </button>
          )}
          {onViewTransactions && (
            <button className="flex-1 bg-muted text-muted-foreground font-semibold py-3 rounded-lg hover:bg-muted/80 transition-colors">
              Ver Movimientos
            </button>
          )}
        </div>

        {/* Recent Transactions */}
        {recentTransactions && recentTransactions.length > 0 && (
          <div className="pt-4 border-t border-border space-y-2">
            <p className="text-sm font-semibold">Últimas transacciones</p>
            {recentTransactions.slice(0, 3).map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{tx.description}</span>
                <span className="font-semibold text-red-500">-{formatCurrency(tx.amount)}</span>
              </div>
            ))}
            {recentTransactions.length > 3 && (
              <button onClick={onViewTransactions} className="text-xs text-primary hover:underline w-full text-center pt-2">
                Ver todas
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
