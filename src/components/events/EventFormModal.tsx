'use client';

import { EventForm } from './EventForm';
import { CategoriaEvento } from '@/types/EventTypes';

interface EventFormModalProps {
  onClose: () => void;
  categoriaInicial?: CategoriaEvento;
}

/**
 * Modal wrapper para EventForm
 * Proporciona una interfaz clara de modal para la creación de eventos
 */
export function EventFormModal({ onClose, categoriaInicial }: EventFormModalProps) {
  return (
    <div className="w-full max-h-[90vh] overflow-y-auto flex flex-col bg-card rounded-lg">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 rounded-t-lg">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Registrar Evento Financiero
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecciona el tipo de evento y completa la información
        </p>
      </div>

      {/* Content */}
      <div className="flex-1">
        <EventForm onClose={onClose} categoriaInicial={categoriaInicial} />
      </div>
    </div>
  );
}
