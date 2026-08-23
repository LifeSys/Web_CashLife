'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { MovementCard } from '@/components/common/MovementCard';
import { X } from 'lucide-react';

function MovimientosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cuentaFiltro = searchParams.get('cuenta');
  const tarjetaFiltro = searchParams.get('tarjeta');

  const { transacciones } = useTransactions();
  const { categorias } = useCategories();
  const { cuentas } = useAccounts();
  const { creditCards } = useCreditCards();
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
      if (cuentaFiltro && t.cuentaId !== cuentaFiltro && t.destinationAccountId !== cuentaFiltro) return false;
      if (tarjetaFiltro && t.creditCardId !== tarjetaFiltro) return false;

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

  const filteredAccountName = cuentaFiltro ? cuentas.find(c => c.id === cuentaFiltro)?.nombre : null;
  const filteredCardName = tarjetaFiltro ? creditCards.find(c => c.id === tarjetaFiltro)?.nombre : null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Movimientos</h1>
        <p className="text-muted-foreground">Historial completo de transacciones</p>
      </div>

      {(filteredAccountName || filteredCardName) && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm">
          <span>
            Filtrando por: <b>{filteredAccountName || filteredCardName}</b>
          </span>
          <button
            onClick={() => router.push('/dashboard/movimientos')}
            className="ml-auto inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium hover:bg-muted/80"
          >
            <X className="h-3 w-3" /> Quitar filtro
          </button>
        </div>
      )}

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

export default function MovimientosPage() {
  return (
    <Suspense fallback={null}>
      <MovimientosContent />
    </Suspense>
  );
}
