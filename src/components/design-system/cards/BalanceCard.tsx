import { ReactNode } from 'react';
import { PremiumCard } from './PremiumCard';

interface BalanceCardProps {
  label: string;
  amount: string;
  icon: ReactNode;
  gradient: string;
  onClick?: () => void;
  lastMovement?: string;
  hidden?: boolean;
  animateValue?: boolean;
}

export function BalanceCard({
  label,
  amount,
  icon,
  gradient,
  onClick,
  lastMovement,
  hidden = false,
  animateValue = true,
}: BalanceCardProps) {
  return (
    <PremiumCard onClick={onClick} interactive={!!onClick} variant="elevated">
      <div className={`rounded-lg p-5 mb-5 text-white ${gradient} backdrop-blur-sm`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold opacity-80 uppercase tracking-wide">
            {label}
          </span>
          <div className="text-2xl transform transition-transform duration-200 hover:scale-110">
            {icon}
          </div>
        </div>
        <p
          className={`text-3xl md:text-4xl font-bold tracking-tight transition-all duration-500 ${
            animateValue ? 'animate-scale-in' : ''
          }`}
        >
          {hidden ? '••••••' : amount}
        </p>
      </div>
      {lastMovement && (
        <p className="text-xs text-muted-foreground font-medium">{lastMovement}</p>
      )}
    </PremiumCard>
  );
}
