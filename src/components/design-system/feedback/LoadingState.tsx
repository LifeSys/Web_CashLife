'use client';

import { ReactNode } from 'react';

type LoadingVariant = 'spinner' | 'pulse' | 'skeleton' | 'dots';

interface LoadingStateProps {
  text?: string;
  variant?: LoadingVariant;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  icon?: ReactNode;
}

export function LoadingState({
  text = 'Cargando...',
  variant = 'spinner',
  size = 'md',
  fullScreen = false,
  icon,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {variant === 'spinner' && (
          <div
            className={`${sizeClasses[size]} border-3 border-muted border-t-primary rounded-full animate-spin`}
          />
        )}

        {variant === 'pulse' && (
          <div
            className={`${sizeClasses[size]} rounded-lg bg-gradient-to-r from-primary to-blue-500 animate-pulse-subtle`}
          />
        )}

        {variant === 'skeleton' && (
          <div className="w-full space-y-3">
            <div className="h-4 bg-muted rounded-md animate-pulse" />
            <div className="h-4 bg-muted rounded-md animate-pulse w-5/6" />
            <div className="h-4 bg-muted rounded-md animate-pulse w-4/6" />
          </div>
        )}

        {variant === 'dots' && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        )}

        {icon && <div className={sizeClasses[size]}>{icon}</div>}

        {text && (
          <p className={`${textSizeClasses[size]} text-muted-foreground font-medium text-center`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
