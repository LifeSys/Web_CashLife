'use client';

import { ReactNode } from 'react';

interface SectionDividerProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  variant?: 'line' | 'dotted' | 'solid';
  spacing?: 'sm' | 'md' | 'lg';
}

export function SectionDivider({
  title,
  description,
  icon,
  variant = 'line',
  spacing = 'md',
}: SectionDividerProps) {
  const spacingClasses = {
    sm: 'my-4',
    md: 'my-6',
    lg: 'my-8',
  };

  const variantClasses = {
    line: 'border-t border-border',
    dotted: 'border-t-2 border-dotted border-border',
    solid: 'border-t-2 border-border',
  };

  if (!title) {
    return <div className={`${variantClasses[variant]} ${spacingClasses[spacing]}`} />;
  }

  return (
    <div className={spacingClasses[spacing]}>
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t border-border" />
        <div className="flex items-center gap-2 flex-shrink-0">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex-1 border-t border-border" />
      </div>
    </div>
  );
}
