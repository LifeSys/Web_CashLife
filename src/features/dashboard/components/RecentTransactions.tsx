'use client';

import { useCategories } from '@/hooks/useCategories';
import { MovementCard } from '@/components/common/MovementCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import type { Transaction } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { categorias } = useCategories();

  const getCategoryName = (categoryId: string) => {
    return categorias.find(c => c.id === categoryId)?.nombre || 'Categoría';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <SectionHeader
        title="Últimos Movimientos"
        subtitle={`${transactions.length} transacciones registradas`}
      />
      <div className="divide-y divide-border">
        {transactions.length > 0 ? (
          transactions.map(tx => (
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
