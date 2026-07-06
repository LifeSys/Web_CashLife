'use client';

import { ReactNode } from 'react';

export interface QuickActionItem {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface ActionGridProps {
  actions: QuickActionItem[];
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  testId?: string;
}

export function ActionGrid({
  actions,
  columns = 4,
  gap = 'md',
  fullWidth = true,
  testId,
}: ActionGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  const colsClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  } as Record<number, string>;

  const responsiveGridClasses = `
    grid ${colsClasses[columns as keyof typeof colsClasses] || 'grid-cols-4'}
    md:grid-cols-${columns} ${gapClasses[gap]}
    ${fullWidth ? 'w-full' : ''}
  `;

  return (
    <div
      className={responsiveGridClasses}
      data-testid={testId}
      role="group"
      aria-label="Quick actions"
    >
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className={`
            flex flex-col items-center justify-center gap-2 p-3 rounded-lg
            bg-card border border-border
            transition-all duration-200
            hover:border-primary/30 hover:shadow-md
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
          `}
        >
          <div className="w-6 h-6 text-primary flex items-center justify-center">
            {action.loading ? (
              <div className="w-full h-full border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              action.icon
            )}
          </div>
          <span className="text-xs font-semibold text-center text-foreground">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
