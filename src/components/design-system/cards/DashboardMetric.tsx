import { ReactNode } from 'react';
import { PremiumCard } from './PremiumCard';

interface DashboardMetricProps {
  label: string;
  value: string;
  icon: ReactNode;
  variant: 'primary' | 'success' | 'info' | 'warning';
  onClick?: () => void;
  change?: number;
}

const variantColors = {
  primary: 'bg-emerald-500/10 text-emerald-500',
  success: 'bg-green-500/10 text-green-500',
  info: 'bg-blue-500/10 text-blue-500',
  warning: 'bg-amber-500/10 text-amber-500',
};

export function DashboardMetric({ label, value, icon, variant, onClick, change }: DashboardMetricProps) {
  return (
    <PremiumCard onClick={onClick} interactive={!!onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <p className="text-3xl md:text-4xl font-bold">{value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-2 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change}% este mes
            </p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${variantColors[variant]}`}>{icon}</div>
      </div>
    </PremiumCard>
  );
}
