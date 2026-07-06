'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  testId?: string;
}

const sizeClasses = {
  sm: 'py-8 px-3',
  md: 'py-12 px-4',
  lg: 'py-16 px-6',
};

const iconSizeClasses = {
  sm: 'text-4xl mb-3',
  md: 'text-6xl mb-4',
  lg: 'text-8xl mb-6',
};

const titleSizeClasses = {
  sm: 'text-base font-bold',
  md: 'text-lg font-semibold',
  lg: 'text-2xl font-bold',
};

const descriptionSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  fullScreen = false,
  testId,
}: EmptyStateProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/50'
    : `flex flex-col items-center justify-center ${sizeClasses[size]} text-center`;

  return (
    <div className={containerClasses} data-testid={testId}>
      <div className="flex flex-col items-center gap-0 max-w-md">
        {icon && (
          <div className={`${iconSizeClasses[size]} opacity-40 select-none`}>
            {icon}
          </div>
        )}
        <h3 className={`${titleSizeClasses[size]} text-foreground mb-2`}>
          {title}
        </h3>
        {description && (
          <p className={`${descriptionSizeClasses[size]} text-muted-foreground mb-6 max-w-xs`}>
            {description}
          </p>
        )}
        {(action || secondaryAction) && (
          <div className="flex flex-col gap-2 w-full mt-4">
            {action && (
              <button
                onClick={action.onClick}
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors active:scale-95"
              >
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-6 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors active:scale-95"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
