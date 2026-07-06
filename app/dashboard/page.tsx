'use client';

import { useMemo } from 'react';
import { Landmark, Users, HandCoins, Building2, CreditCard, TrendingUp, TrendingDown, Wallet, CalendarClock, Send, Download, LogOut } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { usePayableObligations, useReceivableDebts, useScheduledPayments } from '@/hooks/useFinancial';
import { useCreditCards } from '@/hooks/useCreditCards';
import { DashboardMetric, SectionHeader, TimelineItem, EmptyState } from '@/components/design-system';
import { RecentTransactions } from '@/features/dashboard/components/RecentTransactions';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
const toDate = (value: unknown) => value instanceof Date ? value : value && typeof value === 'object' && 'toDate' in value ? (value as { toDate(): Date }).toDate() : new Date(String(value));

export default function DashboardPage() {
  const { transacciones } = useTransactions();
  const { cuentas } = useAccounts();
  const { debts } = useReceivableDebts();
  const { obligations } = usePayableObligations();
  const { scheduledPayments } = useScheduledPayments();
  const { creditCards } = useCreditCards();

  const data = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const availableMoney = cuentas.filter((a) => a.tipo !== 'credit_card').reduce((sum, a) => sum + (a.saldo ?? a.balance ?? 0), 0);
    const receivableTotal = debts.reduce((sum, d) => sum + (d.pendingBalance || 0), 0);
    const personDebt = obligations.filter((o) => o.creditorType === 'person' || !!o.personId).reduce((sum, o) => sum + (o.pendingBalance || 0), 0);
    const bankDebt = obligations.filter((o) => o.creditorType === 'bank').reduce((sum, o) => sum + (o.pendingBalance || 0), 0);
    const otherDebt = obligations.filter((o) => o.creditorType !== 'person' && o.creditorType !== 'bank' && !o.personId).reduce((sum, o) => sum + (o.pendingBalance || 0), 0);
    const creditUsed = creditCards.reduce((sum, c) => sum + (c.usedAmount ?? c.montoUtilizado ?? 0), 0);
    const totalDebt = personDebt + bankDebt + otherDebt + creditUsed;
    const monthTransactions = transacciones.filter((tx) => toDate(tx.fecha) >= startMonth);
    const monthIncome = monthTransactions.filter((tx) => ['income', 'receivable_payment', 'loan_payment'].includes(tx.tipo)).reduce((sum, tx) => sum + tx.monto, 0);
    const monthExpenses = monthTransactions.filter((tx) => ['expense', 'payable_payment', 'scheduled_payment', 'credit_card_payment'].includes(tx.tipo)).reduce((sum, tx) => sum + tx.monto, 0);
    const upcoming = scheduledPayments.filter((p) => p.active).slice(0, 5);
    return { availableMoney, receivableTotal, personDebt, bankDebt, otherDebt, creditUsed, totalDebt, monthIncome, monthExpenses, netWorth: availableMoney + receivableTotal - totalDebt, upcoming };
  }, [cuentas, debts, obligations, creditCards, scheduledPayments, transacciones]);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Buenos días' : today.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* BLOQUE 1: Encabezado Premium */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{greeting}</h1>
          <p className="text-muted-foreground mt-1">
            {today.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* BLOQUE 2: Resumen Financiero Principal (4 Métricas) */}
      <div>
        <SectionHeader title="Resumen Financiero" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardMetric
            label="Dinero Disponible"
            value={formatCurrency(data.availableMoney)}
            icon={<Wallet className="w-5 h-5" />}
            variant="success"
          />
          <DashboardMetric
            label="Patrimonio Neto"
            value={formatCurrency(data.netWorth)}
            icon={<Landmark className="w-5 h-5" />}
            variant="primary"
          />
          <DashboardMetric
            label="Me Deben"
            value={formatCurrency(data.receivableTotal)}
            icon={<Users className="w-5 h-5" />}
            variant="info"
          />
          <DashboardMetric
            label="Total Debo"
            value={formatCurrency(data.totalDebt)}
            icon={<HandCoins className="w-5 h-5" />}
            variant="warning"
          />
        </div>
      </div>

      {/* BLOQUE 3: Actividad Reciente */}
      <div>
        <SectionHeader title="Actividad Reciente" subtitle={`${transacciones.length} movimientos`} />
        {transacciones.length > 0 ? (
          <div className="bg-card border border-border rounded-2xl p-6">
            <RecentTransactions transactions={transacciones.slice(0, 6)} />
          </div>
        ) : (
          <EmptyState
            icon="📊"
            title="Sin movimientos aún"
            description="Crea tu primer movimiento para comenzar"
            action={{ label: 'Crear movimiento', onClick: () => {} }}
          />
        )}
      </div>

      {/* BLOQUE 4: Próximos Pagos */}
      <div>
        <SectionHeader title="Próximos Pagos" subtitle={`${data.upcoming.length} pagos activos`} />
        {data.upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.upcoming.map((payment) => (
              <div key={payment.id} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{payment.name}</p>
                    <p className="text-2xl font-bold mt-2">{formatCurrency(payment.amount)}</p>
                  </div>
                  <CalendarClock className="w-5 h-5 text-amber-500" />
                </div>
                <button className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm">
                  Pagar ahora
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="✓"
            title="Sin pagos próximos"
            description="Todas tus obligaciones están al día"
          />
        )}
      </div>

      {/* BLOQUE 5: Accesos Rápidos */}
      <div>
        <SectionHeader title="Accesos Rápidos" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all flex flex-col items-center gap-3">
            <Send className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-semibold">Transferir</span>
          </button>
          <button className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all flex flex-col items-center gap-3">
            <Download className="w-6 h-6 text-green-500" />
            <span className="text-sm font-semibold">Depositar</span>
          </button>
          <button className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all flex flex-col items-center gap-3">
            <LogOut className="w-6 h-6 text-red-500" />
            <span className="text-sm font-semibold">Retirar</span>
          </button>
          <button className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all flex flex-col items-center gap-3">
            <CreditCard className="w-6 h-6 text-purple-500" />
            <span className="text-sm font-semibold">Facturación</span>
          </button>
        </div>
      </div>

      {/* BLOQUE 6: Métricas Secundarias (opcional en móvil) */}
      <div className="hidden lg:block">
        <SectionHeader title="Otras Métricas" />
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-muted-foreground mb-2">Ingresos Mes</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(data.monthIncome)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-muted-foreground mb-2">Gastos Mes</p>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(data.monthExpenses)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-sm text-muted-foreground mb-2">Tarjetas Utilizadas</p>
            <p className="text-2xl font-bold text-purple-500">{formatCurrency(data.creditUsed)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
