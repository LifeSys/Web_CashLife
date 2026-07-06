interface ProgressBarProps {
  percentage: number;
  label?: string;
  color?: 'emerald' | 'amber' | 'red' | 'blue';
  showPercentage?: boolean;
}

const colorClasses = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};

export function ProgressBar({ percentage, label, color = 'emerald', showPercentage = true }: ProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="space-y-1">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
          {showPercentage && <span className="text-xs font-semibold text-foreground">{Math.round(clampedPercentage)}%</span>}
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300 rounded-full`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}
