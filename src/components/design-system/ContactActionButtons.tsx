'use client';

import { Plus, HandCoins, Wallet } from 'lucide-react';

interface ContactActionButtonsProps {
  onAddCollection?: () => void;
  onAddPayment?: () => void;
  onRegisterCollectionPayment?: () => void;
  onRegisterObligationPayment?: () => void;
  onAddNote?: () => void;
  isLoading?: boolean;
}

export function ContactActionButtons({
  onAddCollection,
  onAddPayment,
  onRegisterCollectionPayment,
  onRegisterObligationPayment,
  onAddNote,
  isLoading,
}: ContactActionButtonsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {onAddCollection && (
        <button
          onClick={onAddCollection}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 transition-all disabled:opacity-50 font-medium"
          title="Registrar dinero que el contacto me debe"
        >
          <Plus className="w-4 h-4" />
          🟢 Me Debe
        </button>
      )}

      {onAddPayment && (
        <button
          onClick={onAddPayment}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all disabled:opacity-50 font-medium"
          title="Registrar dinero que yo le debo al contacto"
        >
          <Plus className="w-4 h-4" />
          🔴 Le Debo
        </button>
      )}

      {onRegisterCollectionPayment && (
        <button
          onClick={onRegisterCollectionPayment}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all disabled:opacity-50 font-medium"
          title="Registrar un cobro (total o parcial) contra una deuda pendiente. Ej: me debe 150 y me da 100 a cuenta"
        >
          <HandCoins className="w-4 h-4" />
          Registrar Cobro
        </button>
      )}

      {onRegisterObligationPayment && (
        <button
          onClick={onRegisterObligationPayment}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30 transition-all disabled:opacity-50 font-medium"
          title="Registrar un pago (total o parcial) de lo que le debo"
        >
          <Wallet className="w-4 h-4" />
          Registrar Pago
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
