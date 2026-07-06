'use client';

import { ReactNode } from 'react';

interface ErrorStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  fullScreen?: boolean;
  testId?: string;
}

export function ErrorState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  fullScreen = false,
  testId,
}: ErrorStateProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses} data-testid={testId}>
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {icon ? (
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            {icon}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {(action || secondaryAction) && (
          <div className="flex flex-col gap-3 w-full mt-4">
            {action && (
              <button
                onClick={action.onClick}
                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-200 hover:bg-primary/90 active:scale-98"
              >
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="w-full px-4 py-3 bg-muted text-foreground rounded-lg font-semibold transition-all duration-200 hover:bg-muted/80 active:scale-98"
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
