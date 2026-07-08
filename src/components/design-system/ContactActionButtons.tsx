'use client';

import { Plus } from 'lucide-react';

interface ContactActionButtonsProps {
  onAddCollection?: () => void;
  onAddPayment?: () => void;
  onAddNote?: () => void;
  isLoading?: boolean;
}

export function ContactActionButtons({
  onAddCollection,
  onAddPayment,
  onAddNote,
  isLoading,
}: ContactActionButtonsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {onAddCollection && (
        <button
          onClick={onAddCollection}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 transition-all disabled:opacity-50 font-medium"
        >
          <Plus className="w-4 h-4" />
          Registrar Pago
        </button>
      )}

      {onAddPayment && (
        <button
          onClick={onAddPayment}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all disabled:opacity-50 font-medium"
        >
          <Plus className="w-4 h-4" />
          Registrar Deuda
        </button>
      )}

      {onAddNote && (
        <button
          onClick={onAddNote}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-all disabled:opacity-50 font-medium"
        >
          <Plus className="w-4 h-4" />
          Agregar Nota
        </button>
      )}
    </div>
  );
}
