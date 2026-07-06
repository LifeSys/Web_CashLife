'use client';

import { ReactNode } from 'react';

type AvatarStatus = 'active' | 'pending' | 'inactive' | 'alert';
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface FinancialAvatarProps {
  initials: string;
  amount?: string;
  status?: AvatarStatus;
  badgeIcon?: ReactNode;
  size?: AvatarSize;
  bgColor?: string;
  onClick?: () => void;
  interactive?: boolean;
  testId?: string;
}

const statusColors = {
  active: 'bg-green-500',
  pending: 'bg-amber-500',
  inactive: 'bg-gray-500',
  alert: 'bg-red-500',
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const badgeSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

export function FinancialAvatar({
  initials,
  amount,
  status = 'active',
  badgeIcon,
  size = 'md',
  bgColor = 'bg-gradient-to-br from-primary to-blue-600',
  onClick,
  interactive = false,
  testId,
}: FinancialAvatarProps) {
  return (
    <div
      className={`relative inline-flex flex-col items-center gap-2 ${
        interactive && onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
      data-testid={testId}
    >
      {/* Avatar Circle */}
      <div
        className={`
          ${sizeClasses[size]} ${bgColor}
          rounded-full flex items-center justify-center
          text-white font-bold
          transition-all duration-200
          ${interactive ? 'hover:shadow-lg' : 'shadow-md'}
          ${textSizeClasses[size]}
        `}
      >
        {initials}

        {/* Status Badge */}
        {status && (
          <div
            className={`
              absolute bottom-0 right-0
              ${badgeSizeClasses[size]} rounded-full
              ${statusColors[status]} border-2 border-background
              animate-pulse-subtle
            `}
          />
        )}

        {/* Custom Badge Icon */}
        {badgeIcon && (
          <div
            className={`
              absolute top-0 right-0
              ${badgeSizeClasses[size]} rounded-full
              bg-primary border-2 border-background
              flex items-center justify-center
              text-white text-xs
            `}
          >
            {badgeIcon}
          </div>
        )}
      </div>

      {/* Amount Badge */}
      {amount && (
        <div className="text-xs font-semibold text-foreground text-center whitespace-nowrap">
          {amount}
        </div>
      )}
    </div>
  );
}
