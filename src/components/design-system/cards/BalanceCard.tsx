import { ReactNode } from 'react';
import { PremiumCard } from './PremiumCard';

interface BalanceCardProps {
  label: string;
  amount: string;
  icon: ReactNode;
  gradient: string;
  onClick?: () => void;
  lastMovement?: string;
}

export function BalanceCard({
  label,
  amount,
  icon,
  gradient,
  onClick,
  lastMovement,
}: BalanceCardProps) {
  return (
    <PremiumCard onClick={onClick} interactive={!!onClick}>
      <div className={`rounded-xl p-4 mb-4 text-white ${gradient}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold opacity-80">{label}</span>
          <div className="text-2xl">{icon}</div>
        </div>
        <p className="text-3xl md:text-4xl font-bold">{amount}</p>
      </div>
      {lastMovement && <p className="text-xs text-muted-foreground">{lastMovement}</p>}
    </PremiumCard>
  );
}
