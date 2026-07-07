'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { EventFormModal } from '@/components/events/EventFormModal';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { MovementCard } from '@/components/common/MovementCard';
import { SectionHeader } from '@/components/common/SectionHeader';

export default function MovimientosPage() {
  const { transacciones } = useTransactions();
  const { categorias } = useCategories();
  const [filtro, setFiltro] = useState<'todos' | 'hoy' | 'semana' | 'mes'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCategoryName = (categoryId: string) => {
    return categorias.find(c => c.id === categoryId)?.nombre || 'Categoría';
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

    return transacciones.filter(t => {
      const tDate = t.fecha instanceof Date ? t.fecha : t.fecha.toDate();
      const tDateOnly = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());

      if (filtro === 'hoy') return tDateOnly.getTime() === today.getTime();
      if (filtro === 'semana') return tDate >= weekAgo;
      if (filtro === 'mes') return tDate >= monthAgo;
      return true;
    });
  };

  const filtered = getFilteredTransactions();

  const filterButtons = [
    { id: 'todos', label: 'Todos' },
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
  ];

  return (
    <>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-card shadow-2xl animate-slide-up md:animate-scale-in">
            <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 rounded-t-lg flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Nuevo Movimiento</h2>
                <p className="text-sm text-muted-foreground mt-1">Registra un nuevo movimiento financiero</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              <EventFormModal onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Movimientos</h1>
        <p className="text-muted-foreground">Historial completo de transacciones</p>
      </div>

      {/* Botón Principal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" /> Nuevo Movimiento
      </button>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setFiltro(btn.id as any)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
              filtro === btn.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-border">
            {filtered.map(tx => (
              <MovementCard
                key={tx.id}
                transaction={tx}
                categoryName={getCategoryName(tx.categoria ?? tx.categoriaId ?? '')}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No hay movimientos en este período</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
