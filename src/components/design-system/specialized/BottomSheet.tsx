'use client';

import { ReactNode, useEffect, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  height?: 'sm' | 'md' | 'lg' | 'full';
  showHandle?: boolean;
  testId?: string;
}

const heightClasses = {
  sm: 'max-h-96',
  md: 'max-h-2xl',
  lg: 'max-h-4xl',
  full: 'max-h-[90vh]',
};

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 'md',
  showHandle = true,
  testId,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
          data-testid={testId ? `${testId}-backdrop` : undefined}
        />
      )}

      {/* Sheet Container */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-card rounded-t-2xl border-t border-border
          transition-all duration-300 ease-out
          ${isOpen ? 'animate-slide-up' : 'translate-y-full'}
          ${!isOpen ? 'pointer-events-none' : ''}
          safe-area-inset-bottom
        `}
        data-testid={testId}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 rounded-full bg-muted" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className={`
            overflow-y-auto
            ${heightClasses[height]}
            px-6 py-4
          `}
        >
          {children}
        </div>
      </div>
    </>
  );
}
