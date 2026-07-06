import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  subtitle?: string;
}

export function SectionHeader({ title, icon, action, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && <div className="text-2xl">{icon}</div>}
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
