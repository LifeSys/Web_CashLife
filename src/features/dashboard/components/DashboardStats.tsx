import { DollarSign, TrendingUp, TrendingDown, Wallet, Send, ArrowUpRight } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { BalanceCard } from '@/components/common/BalanceCard';
import type { DashboardStats as DashboardStatsType } from '@/hooks/useCalculations';

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Tarjeta grande de saldo */}
      <BalanceCard saldo={stats.saldoTotal} />

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          title="Ingresos"
          value={formatCurrency(stats.ingresosDelMes)}
          color="green"
        />
        <StatCard
          icon={TrendingDown}
          title="Gastos"
          value={formatCurrency(stats.gastosDelMes)}
          color="red"
        />
        <StatCard
          icon={DollarSign}
          title="Balance"
          value={formatCurrency(stats.balance)}
          color={stats.balance >= 0 ? 'green' : 'red'}
        />
        {stats.dineroPrestado > 0 && (
          <StatCard
            icon={Send}
            title="Prestado"
            value={formatCurrency(stats.dineroPrestado)}
            color="blue"
          />
        )}
        {stats.dineroPorCobrar > 0 && (
          <StatCard
            icon={ArrowUpRight}
            title="Por Cobrar"
            value={formatCurrency(stats.dineroPorCobrar)}
            color="green"
          />
        )}
        <StatCard
          icon={Wallet}
          title="Transacciones"
          value={stats.transaccionesDelMes}
          color="blue"
        />
      </div>
    </div>
  );
}
