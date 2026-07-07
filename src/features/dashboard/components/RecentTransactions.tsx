'use client';

import { useCategories } from '@/hooks/useCategories';
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

  const getCategoryName = (categoryId: string) => {
    return categorias.find(c => c.id === categoryId)?.nombre || 'Categoría';
  };

  // Sort transactions from newest to oldest
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = toDate(a.fecha);
    const dateB = toDate(b.fecha);
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
