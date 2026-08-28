'use client';

import { useCategories } from '@/hooks/useCategories';
import { usePeople } from '@/hooks/usePeople';
import { MovementCard } from '@/components/common/MovementCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import type { Transaction, FireDate } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const toDate = (date: FireDate) =>
  date instanceof Date ? date : date?.toDate?.() ?? new Date(String(date));

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { categorias } = useCategories();
  const { contacts } = usePeople();

  const getCategoryName = (categoryId: string) => {
    return categorias.find(c => c.id === categoryId)?.nombre || 'Categoría';
  };

  // Mismo criterio que en Movimientos: el campo de persona cambia de
  // nombre según por dónde se creó el movimiento.
  const getPersonName = (t: Transaction) => {
    const personId = t.contactId ?? t.persona ?? t.personaId ?? t.personId;
    if (!personId) return undefined;
    return contacts.find((c) => c.id === personId)?.nombre;
  };

  // Sort transactions from newest to oldest by createdAt (creation date)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = toDate(a.createdAt);
    const dateB = toDate(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <SectionHeader
        title="Actividad Reciente"
        subtitle={`${transactions.length} movimientos registrados`}
      />
      <div className="divide-y divide-border">
        {sortedTransactions.length > 0 ? (
          sortedTransactions.map(tx => (
            <MovementCard
              key={tx.id}
              transaction={tx}
              categoryName={getCategoryName(tx.categoria ?? tx.categoriaId ?? '')}
              personName={getPersonName(tx)}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No hay movimientos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
