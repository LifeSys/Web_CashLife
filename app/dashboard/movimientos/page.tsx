'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { usePeople } from '@/hooks/usePeople';
import { MovementCard } from '@/components/common/MovementCard';
import { X, Search } from 'lucide-react';
import { formatDateInput, parseLocalDate } from '@/lib/date';

function MovimientosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cuentaFiltro = searchParams.get('cuenta');
  const tarjetaFiltro = searchParams.get('tarjeta');

  const { transacciones } = useTransactions();
  const { categorias } = useCategories();
  const { cuentas } = useAccounts();
  const { creditCards } = useCreditCards();
  const { contacts } = usePeople();
  const [filtro, setFiltro] = useState<'todos' | 'hoy' | 'semana' | 'mes' | 'año'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const getCategoryName = (categoryId: string) => {
    return categorias.find(c => c.id === categoryId)?.nombre || 'Categoría';
  };

  // El nombre de la persona ligada al movimiento (cobros, pagos, préstamos
  // con alguien) — el campo viene con distintos nombres según por dónde se
  // creó el movimiento (persona/personaId/personId/contactId, arrastre de
  // versiones anteriores del código), así que se prueban todos.
  const getPersonName = (t: (typeof transacciones)[number]) => {
    const personId = t.contactId ?? t.persona ?? t.personaId ?? t.personId;
    if (!personId) return undefined;
    return contacts.find((c) => c.id === personId)?.nombre;
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearAgo = new Date(now.getFullYear(), 0, 1);

    const desde = fechaDesde ? parseLocalDate(fechaDesde) : null;
    // "Hasta" es inclusivo del día completo: sin esto, un movimiento del
    // mismo día "hasta" quedaba afuera porque su hora ya pasaba medianoche.
    const hasta = fechaHasta ? new Date(parseLocalDate(fechaHasta).getTime() + 24 * 60 * 60 * 1000 - 1) : null;
    const busquedaLower = busqueda.trim().toLowerCase();

    return transacciones.filter(t => {
      if (cuentaFiltro && t.cuentaId !== cuentaFiltro && t.destinationAccountId !== cuentaFiltro) return false;
      if (tarjetaFiltro && t.creditCardId !== tarjetaFiltro) return false;

      const tDate = t.fecha instanceof Date ? t.fecha : t.fecha.toDate();
      const tDateOnly = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());

      if (desde && tDate < desde) return false;
      if (hasta && tDate > hasta) return false;
      if (busquedaLower && !t.descripcion?.toLowerCase().includes(busquedaLower)) return false;

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

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por descripción..."
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Rango de fechas */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {(fechaDesde || fechaHasta) && (
          <button
            onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/80 shrink-0"
          >
            <X className="h-3 w-3" /> Quitar fechas
          </button>
        )}
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
                personName={getPersonName(tx)}
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
