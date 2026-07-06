'use client';

import { ReactNode } from 'react';

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  isLast?: boolean;
}

interface TimelineListProps {
  entries: TimelineEntry[];
  direction?: 'vertical' | 'horizontal';
  compact?: boolean;
  testId?: string;
}

const colorClasses = {
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-green-500 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-500 text-white',
  danger: 'bg-red-500 text-white',
};

export function TimelineList({
  entries,
  direction = 'vertical',
  compact = false,
  testId,
}: TimelineListProps) {
  if (direction === 'horizontal') {
    return (
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        data-testid={testId}
        role="list"
      >
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex-shrink-0 w-64 md:w-80"
            role="listitem"
          >
            <div className="bg-card border border-border rounded-lg p-4 h-full">
              <div className="flex items-start gap-3">
                {entry.icon && (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      colorClasses[entry.color || 'primary']
                    }`}
                  >
                    {entry.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {entry.title}
                  </p>
                  {entry.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {entry.timestamp}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Vertical timeline (default)
  return (
    <div
      className="space-y-0"
      data-testid={testId}
      role="list"
    >
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className={`flex gap-4 pb-4 ${!entry.isLast && index < entries.length - 1 ? 'border-l border-border ml-4' : ''}`}
          role="listitem"
        >
          {/* Timeline dot */}
          <div className="relative flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                colorClasses[entry.color || 'primary']
              } relative z-10 -ml-4 mt-1`}
            >
              {entry.icon || (
                <div className="w-2 h-2 bg-current rounded-full" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 ${compact ? 'pt-0' : 'pt-1'}`}>
            <p className="text-sm font-semibold text-foreground">
              {entry.title}
            </p>
            {entry.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {entry.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {entry.timestamp}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
