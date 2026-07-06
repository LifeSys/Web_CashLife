'use client';

import { ReactNode } from 'react';

interface ContainerCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  bgColor?: 'default' | 'muted' | 'primary' | 'success';
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const shadowClasses = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  none: 'shadow-none',
};

const roundedClasses = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
};

const bgColorClasses = {
  default: 'bg-card',
  muted: 'bg-muted/50',
  primary: 'bg-primary/10',
  success: 'bg-green-500/10',
};

export function ContainerCard({
  children,
  className = '',
  padding = 'md',
  border = true,
  shadow = 'md',
  rounded = 'lg',
  bgColor = 'default',
}: ContainerCardProps) {
  return (
    <div
      className={`
        ${bgColorClasses[bgColor]}
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${roundedClasses[rounded]}
        ${border ? 'border border-border' : ''}
        transition-all duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}
