'use client';

import { ReactNode } from 'react';
import { PremiumCard } from './PremiumCard';

interface DataPoint {
  value: number | string;
  label: string;
}

interface StatisticsCardProps {
  title: string;
  icon?: ReactNode;
  data: DataPoint[];
  variant?: 'primary' | 'success' | 'info' | 'warning';
  layout?: 'vertical' | 'horizontal';
  onClick?: () => void;
}

const variantColors = {
  primary: 'from-primary to-blue-600',
  success: 'from-green-500 to-emerald-600',
  info: 'from-blue-500 to-cyan-600',
  warning: 'from-amber-500 to-orange-600',
};

export function StatisticsCard({
  title,
  icon,
  data,
  variant = 'primary',
  layout = 'horizontal',
  onClick,
}: StatisticsCardProps) {
  const isVertical = layout === 'vertical';

  return (
    <PremiumCard onClick={onClick} interactive={!!onClick} variant="elevated">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            {title}
          </h3>
          {icon && (
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${variantColors[variant]}`}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div
          className={`grid gap-3 ${
            isVertical
              ? 'grid-cols-1'
              : `grid-cols-${Math.min(data.length, 3)} md:grid-cols-${Math.min(data.length, 4)}`
          }`}
        >
          {data.map((item, index) => (
            <div
              key={index}
              className={`
                ${isVertical ? 'flex justify-between' : 'text-center'}
                p-3 rounded-lg bg-muted/50 border border-border
              `}
            >
              <p className={`text-lg font-bold text-foreground ${!isVertical ? 'block' : ''}`}>
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
}
