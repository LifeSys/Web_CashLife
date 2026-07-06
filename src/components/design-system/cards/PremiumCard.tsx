import { ReactNode } from 'react';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  hover?: boolean;
}

export function PremiumCard({ children, className = '', onClick, interactive = false, hover = true }: PremiumCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl bg-card border border-border p-6
        transition-all duration-200 ease-out
        ${hover ? 'hover:shadow-md' : ''}
        ${interactive ? 'cursor-pointer hover:scale-102' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
