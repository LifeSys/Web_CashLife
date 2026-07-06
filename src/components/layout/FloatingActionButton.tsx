'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { MovementForm } from '@/components/common/MovementForm';

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

      {/* Modal de Movimiento */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in">
          <div className="bg-card rounded-t-2xl md:rounded-2xl w-full md:w-full md:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up md:animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card rounded-t-2xl">
              <h2 className="text-lg font-bold text-foreground">
                Registrar Movimiento
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <MovementForm onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
