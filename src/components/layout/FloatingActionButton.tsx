'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { MovementForm } from '@/components/common/MovementForm';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-4 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:shadow-xl transition-shadow z-40 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal de Movimiento */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-card rounded-t-2xl md:rounded-2xl w-full md:w-full md:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-lg font-bold">Registrar Movimiento</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MovementForm onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
