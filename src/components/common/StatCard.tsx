import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: number;
  color?: string;
  bg?: string;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  trend,
  color = 'primary',
  bg = 'bg-card',
}: StatCardProps) {
  const colorClass = {
    primary: 'text-primary bg-primary/10',
    green: 'text-green-500 bg-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    red: 'text-red-500 bg-red-500/10',
  }[color] || 'text-primary bg-primary/10';

  return (
    <div className={`${bg} border border-border rounded-lg p-4 space-y-2`}>
      <div className="flex items-start justify-between">
        <div className={`${colorClass} p-2 rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-semibold ${
              trend >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-balance">{value}</p>
      </div>
    </div>
  );
}
