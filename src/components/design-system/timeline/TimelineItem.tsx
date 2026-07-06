import { ReactNode } from 'react';

interface TimelineItemProps {
  icon: ReactNode;
  category: string;
  description: string;
  amount: number;
  date: Date;
  account?: string;
  isPositive: boolean;
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

export function TimelineItem({
  icon,
  category,
  description,
  amount,
  date,
  account,
  isPositive,
}: TimelineItemProps) {
  return (
    <div className="flex gap-4 py-4">
      {/* Línea */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-background border-2 border-card flex items-center justify-center">{icon}</div>
        <div className="w-0.5 h-12 bg-border my-2" />
      </div>

      {/* Contenido */}
      <div className="flex-1 pt-1">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{category}</p>
            <p className="text-sm font-semibold text-foreground">{description}</p>
          </div>
          <p className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : '-'} {formatAmount(Math.abs(amount))}
          </p>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{formatTime(date)}</span>
          {account && <span>• {account}</span>}
        </div>
      </div>
    </div>
  );
}
