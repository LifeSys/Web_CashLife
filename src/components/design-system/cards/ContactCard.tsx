import { ReactNode } from 'react';
import { PremiumCard } from './PremiumCard';
import { MoreVertical } from 'lucide-react';

interface ContactCardProps {
  avatar: string;
  name: string;
  balanceNet: number;
  owedToMe: number;
  iOwe: number;
  lastMovement?: string;
  lastMovementIcon?: ReactNode;
  onClick?: () => void;
  onPay?: () => void;
  onCollect?: () => void;
  onMore?: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

export function ContactCard({
  avatar,
  name,
  balanceNet,
  owedToMe,
  iOwe,
  lastMovement,
  lastMovementIcon,
  onClick,
  onPay,
  onCollect,
  onMore,
}: ContactCardProps) {
  const isPositiveBalance = balanceNet >= 0;

  return (
    <PremiumCard onClick={onClick} interactive={!!onClick}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <img src={avatar} alt={name} className="w-12 h-12 rounded-full" />
          <div>
            <h3 className="font-bold text-base">{name}</h3>
            <p className={`text-lg font-bold ${isPositiveBalance ? 'text-green-500' : 'text-red-500'}`}>
              {isPositiveBalance ? '+' : ''}{formatCurrency(balanceNet)}
            </p>
          </div>
        </div>
        {onMore && (
          <button onClick={onMore} className="p-1 hover:bg-muted rounded-lg">
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-green-500/10 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Me debe</p>
          <p className="text-sm font-bold text-green-500">{formatCurrency(owedToMe)}</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Le debo</p>
          <p className="text-sm font-bold text-red-500">{formatCurrency(iOwe)}</p>
        </div>
      </div>

      {/* Last movement */}
      {lastMovement && (
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          {lastMovementIcon} {lastMovement}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onCollect && (
          <button
            onClick={onCollect}
            className="flex-1 bg-green-500/20 text-green-600 text-sm font-semibold py-2 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            Cobrar
          </button>
        )}
        {onPay && (
          <button
            onClick={onPay}
            className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Pagar
          </button>
        )}
      </div>
    </PremiumCard>
  );
}
