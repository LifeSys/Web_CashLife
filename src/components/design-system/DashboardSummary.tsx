'use client';

import { Wallet, CreditCard, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardSummaryProps {
  totalAvailableMoney: number;
  accountCount: number;
  creditCardCount: number;
  totalCreditDebt: number;
  currency?: string;
}

const formatCurrency = (value: number, currency: string = 'PEN') =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(value);

const MetricCard = ({
  icon: Icon,
  label,
  value,
  description,
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description?: string;
  gradient: string;
}) => (
  <div className={`${gradient} rounded-2xl p-4 md:p-6 text-white shadow-lg`}>
    <div className="flex items-start justify-between mb-4">
      <h3 className="text-sm md:text-base font-semibold opacity-90">{label}</h3>
      <Icon className="w-5 h-5 md:w-6 md:h-6 opacity-70" />
    </div>
    <p className="text-2xl md:text-3xl font-bold mb-1">{value}</p>
    {description && <p className="text-xs md:text-sm opacity-80">{description}</p>}
  </div>
);

export function DashboardSummary({
  totalAvailableMoney,
  accountCount,
  creditCardCount,
  totalCreditDebt,
  currency = 'PEN',
}: DashboardSummaryProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={DollarSign}
        label="Dinero disponible"
        value={formatCurrency(totalAvailableMoney, currency)}
        description="En tus cuentas"
        gradient="bg-gradient-to-br from-emerald-600 to-emerald-700"
      />

      <MetricCard
        icon={Wallet}
        label="Tus cuentas"
        value={accountCount.toString()}
        description={accountCount === 1 ? 'cuenta' : 'cuentas'}
        gradient="bg-gradient-to-br from-blue-600 to-blue-700"
      />

      <MetricCard
        icon={CreditCard}
        label="Tarjetas de crédito"
        value={creditCardCount.toString()}
        description={creditCardCount === 1 ? 'tarjeta' : 'tarjetas'}
        gradient="bg-gradient-to-br from-purple-600 to-purple-700"
      />

      <MetricCard
        icon={TrendingUp}
        label="Deuda en tarjetas"
        value={formatCurrency(totalCreditDebt, currency)}
        description="Total utilizado"
        gradient={totalCreditDebt === 0 ? 'bg-gradient-to-br from-slate-600 to-slate-700' : 'bg-gradient-to-br from-orange-600 to-orange-700'}
      />
    </div>
  );
}
