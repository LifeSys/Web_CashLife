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
  // Calculate dynamic font size based on value length
  const getResponsiveFontSize = (): string => {
    const charLength = value.length;
    if (charLength <= 10) return 'text-3xl sm:text-4xl';
    if (charLength <= 15) return 'text-2xl sm:text-3xl';
    if (charLength <= 20) return 'text-xl sm:text-2xl';
    return 'text-lg sm:text-xl';
  };

  return (
    <PremiumCard onClick={onClick} interactive={!!onClick} variant="elevated">
      <div className="flex items-center justify-between gap-3 h-full">
        {/* Content Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide truncate">
            {label}
          </p>
          <p
            className={`font-bold tracking-tight transition-all duration-500 overflow-hidden overflow-ellipsis ${
              getResponsiveFontSize()
            } ${animated ? 'animate-scale-in' : ''}`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
            }}
          >
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <p
                className={`text-xs font-semibold whitespace-nowrap ${
                  change >= 0 ? changeColors.positive : changeColors.negative
                }`}
              >
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              </p>
            </div>
          )}
          {subtext && <p className="text-xs text-muted-foreground mt-1 truncate">{subtext}</p>}
        </div>
        {/* Icon Section - Fixed position, never overlaps */}
        <div
          className={`rounded-lg p-3 flex-shrink-0 transform transition-transform duration-200 hover:scale-110 ${variantColors[variant]}`}
        >
          {icon}
        </div>
      </div>
    </PremiumCard>
  );
}
