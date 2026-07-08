'use client';

import { Account } from '@/types';
import { MoneyAccountCard } from '@/components/design-system/cards/MoneyAccountCard';
import { Plus } from 'lucide-react';

interface AccountsSectionProps {
  accounts: Account[];
  loading?: boolean;
  onAddAccount: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onViewTransactions: (accountId: string) => void;
}

export function AccountsSection({
  accounts,
  loading = false,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onViewTransactions,
}: AccountsSectionProps) {
  // Separate Efectivo from other accounts
  const efectivo = accounts.find(a => a.nombre === 'Efectivo');
  const bankAccounts = accounts.filter(a => a.nombre !== 'Efectivo');

  const sortedAccounts = efectivo ? [efectivo, ...bankAccounts] : bankAccounts;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tus Cuentas</h2>
          <p className="text-sm text-muted-foreground mt-1">Dinero real en tus cuentas y efectivo</p>
        </div>
        <button
          onClick={onAddAccount}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nueva cuenta
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border">
          <p className="text-muted-foreground">No tienes cuentas registradas</p>
          <p className="text-sm text-muted-foreground mt-1">Crea tu primera cuenta bancaria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAccounts.map(account => (
            <MoneyAccountCard
              key={account.id}
              account={account}
              isEfectivo={account.nombre === 'Efectivo'}
              onViewTransactions={() => onViewTransactions(account.id)}
              onEdit={account.nombre !== 'Efectivo' ? () => onEditAccount(account) : undefined}
              onDelete={account.nombre !== 'Efectivo' ? () => onDeleteAccount(account.id) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
