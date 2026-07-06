'use client';

import { ReactNode } from 'react';

type QuickActionVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type QuickActionSize = 'sm' | 'md' | 'lg';

interface QuickActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: QuickActionVariant;
  size?: QuickActionSize;
  disabled?: boolean;
  loading?: boolean;
  testId?: string;
}

export function QuickAction({
  icon,
  label,
  onClick,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  loading = false,
  testId,
}: QuickActionProps) {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 border border-primary',
    secondary:
      'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
    ghost: 'bg-transparent text-foreground hover:bg-muted border border-transparent',
    outline:
      'bg-transparent text-foreground hover:bg-muted border border-border',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 gap-1.5',
    md: 'px-4 py-2.5 gap-2',
    lg: 'px-5 py-3 gap-2.5',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs font-medium',
    md: 'text-sm font-semibold',
    lg: 'text-base font-semibold',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={testId}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-200 active:scale-95
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${textSizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className={iconSizeClasses[size]}>
        {loading ? (
          <div className="w-full h-full border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
      </div>
      {label}
    </button>
  );
}
