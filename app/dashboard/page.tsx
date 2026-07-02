'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { useAccountBalance } from '@/hooks/useAccounts';
import { useCalculations } from '@/hooks/useCalculations';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { RecentTransactions } from '@/features/dashboard/components/RecentTransactions';

export default function DashboardPage() {
  const { transacciones } = useTransactions();
  const { saldoTotal } = useAccountBalance();
  const stats = useCalculations(transacciones, saldoTotal);

  const recentTransactions = transacciones.slice(0, 5);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Bienvenido a CashLife</h1>
        <p className="text-muted-foreground">Controla tu dinero, vive mejor</p>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
