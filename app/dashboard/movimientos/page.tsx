'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { MovementCard } from '@/components/common/MovementCard';
import { SectionHeader } from '@/components/common/SectionHeader';

export default function MovimientosPage() {
  const { transacciones } = useTransactions();
  const { categorias } = useCategories();
  const [filtro, setFiltro] = useState<'todos' | 'hoy' | 'semana' | 'mes' | 'año'>('todos');

  const getCategoryName = (categoryId: string) => {
    return categorias.find(c => c.id === categoryId)?.nombre || 'Categoría';
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearAgo = new Date(now.getFullYear(), 0, 1);

    return transacciones.filter(t => {
      const tDate = t.fecha instanceof Date ? t.fecha : t.fecha.toDate();
      const tDateOnly = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());

      if (filtro === 'hoy') return tDateOnly.getTime() === today.getTime();
      if (filtro === 'semana') return tDate >= weekAgo;
      if (filtro === 'mes') return tDate >= monthAgo;
      if (filtro === 'año') return tDate >= yearAgo;
      return true;
    });
  };

  const filtered = getFilteredTransactions();

  const filterButtons = [
    { id: 'todos', label: 'Todos' },
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
    { id: 'año', label: 'Año' },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Movimientos</h1>
        <p className="text-muted-foreground">Historial completo de transacciones</p>
      </div>

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
  );
}
