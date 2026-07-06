'use client';

type ProgressColor = 'emerald' | 'amber' | 'red' | 'blue' | 'primary' | 'success' | 'warning' | 'danger';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  color?: ProgressColor;
  showPercentage?: boolean;
  size?: ProgressSize;
  animated?: boolean;
  showLabel?: boolean;
  caption?: string;
  testId?: string;
}

const colorClasses = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  primary: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export function ProgressBar({
  percentage,
  label,
  color = 'primary',
  showPercentage = true,
  size = 'md',
  animated = true,
  showLabel = true,
  caption,
  testId,
}: ProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full space-y-2" data-testid={testId}>
      {(label || showPercentage) && showLabel && (
        <div className="flex justify-between items-center mb-3">
          {label && (
            <span className="text-xs font-semibold text-foreground">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs font-bold text-primary">
              {Math.round(clampedPercentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${heightClasses[size]} bg-muted rounded-full overflow-hidden relative`}>
        <div
          className={`
            ${heightClasses[size]} ${colorClasses[color]}
            rounded-full transition-all duration-500 ease-out
            ${animated ? 'animate-pulse-subtle' : ''}
          `}
          style={{ width: `${clampedPercentage}%` }}
          role="progressbar"
          aria-valuenow={clampedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {caption && (
        <p className="text-xs text-muted-foreground mt-1">{caption}</p>
      )}
    </div>
  );
}
