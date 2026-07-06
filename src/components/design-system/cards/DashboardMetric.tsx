import { ReactNode } from 'react';
import { PremiumCard } from './PremiumCard';

interface DashboardMetricProps {
  label: string;
  value: string;
  icon: ReactNode;
  variant: 'primary' | 'success' | 'info' | 'warning';
  onClick?: () => void;
  change?: number;
  subtext?: string;
  animated?: boolean;
}

const variantColors = {
  primary: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  success: 'bg-green-500/10 text-green-500 border border-green-500/20',
  info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
};

const changeColors = {
  positive: 'text-green-500 font-semibold',
  negative: 'text-red-500 font-semibold',
};

export function DashboardMetric({
  label,
  value,
  icon,
  variant,
  onClick,
  change,
  subtext,
  animated = true,
}: DashboardMetricProps) {
  return (
    <PremiumCard onClick={onClick} interactive={!!onClick} variant="elevated">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            {label}
          </p>
          <p
            className={`text-3xl md:text-4xl font-bold tracking-tight transition-all duration-500 ${
              animated ? 'animate-scale-in' : ''
            }`}
          >
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-2 mt-3">
              <p
                className={`text-xs font-semibold ${
                  change >= 0 ? changeColors.positive : changeColors.negative
                }`}
              >
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% este mes
              </p>
            </div>
          )}
          {subtext && <p className="text-xs text-muted-foreground mt-2">{subtext}</p>}
        </div>
        <div
          className={`rounded-lg p-4 flex-shrink-0 transform transition-transform duration-200 hover:scale-110 ${variantColors[variant]}`}
        >
          {icon}
        </div>
      </div>
    </PremiumCard>
  );
}
