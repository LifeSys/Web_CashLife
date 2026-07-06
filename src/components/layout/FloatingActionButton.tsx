'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { OperationModal } from '@/components/common/OperationModal';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-24 md:bottom-8 right-4 safe-area-inset-bottom
          w-16 h-16 bg-gradient-to-br from-primary to-blue-600
          rounded-full shadow-lg flex items-center justify-center
          text-primary-foreground
          transition-all duration-300 ease-out
          hover:shadow-2xl hover:scale-110
          active:scale-95
          z-40
        `}
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modal de Nueva Operación */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in">
          <div className="bg-card rounded-t-2xl md:rounded-2xl w-full md:w-full md:max-w-2xl max-h-[90vh] shadow-2xl animate-slide-up md:animate-scale-in flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-muted rounded-lg transition-all duration-200 active:scale-95 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <OperationModal onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
