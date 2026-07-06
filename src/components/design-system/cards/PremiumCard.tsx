import { ReactNode } from 'react';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'glass';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  hover?: boolean;
  variant?: CardVariant;
  disabled?: boolean;
  testId?: string;
}

export function PremiumCard({
  children,
  className = '',
  onClick,
  interactive = false,
  hover = true,
  variant = 'elevated',
  disabled = false,
  testId,
}: PremiumCardProps) {
  const variantClasses = {
    elevated: 'bg-card border border-border/50 shadow-md hover:shadow-lg',
    outlined: 'bg-card/50 border border-border hover:border-primary/30',
    filled: 'bg-card/80 border border-transparent',
    glass: 'bg-card/40 backdrop-blur border border-primary/10',
  };

  const baseClasses = `
    rounded-lg bg-card border border-border p-6
    transition-all duration-200 ease-out
    ${variantClasses[variant]}
    ${hover && !disabled ? 'hover:shadow-lg hover:border-primary/20' : ''}
    ${interactive && !disabled ? 'cursor-pointer active:scale-98' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={baseClasses}
      data-testid={testId}
      role={interactive ? 'button' : 'div'}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}
