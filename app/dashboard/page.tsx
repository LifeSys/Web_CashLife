'use client';

import { useMemo, useState } from 'react';
import {
  Landmark,
  Users,
  HandCoins,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarClock,
  Send,
  Download,
  LogOut,
  ArrowUpRight,
  ArrowDownLeft,
  Minus,
  Plus,
  ArrowRightLeft,
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import {
  usePayableObligations,
  useReceivableDebts,
  useScheduledPayments,
} from '@/hooks/useFinancial';
import { useCreditCards } from '@/hooks/useCreditCards';
import {
  DashboardMetric,
  SectionHeader,
  TimelineItem,
  EmptyState,
  ActionGrid,
  StatisticsCard,
  ContainerCard,
} from '@/components/design-system';
import { RecentTransactions } from '@/features/dashboard/components/RecentTransactions';
import { ExpenseModal } from '@/components/modals/ExpenseModal';
import { IncomeModal } from '@/components/modals/IncomeModal';
import { TransferModal } from '@/components/modals/TransferModal';
import { X } from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value || 0);
const toDate = (value: unknown) =>
  value instanceof Date
    ? value
    : value &&
        typeof value === 'object' &&
        'toDate' in value
      ? (value as { toDate(): Date }).toDate()
      : new Date(String(value));

export default function DashboardPage() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { transacciones } = useTransactions();
  console.log('[v0] Dashboard - transacciones.length:', transacciones.length);
  console.log('[v0] Dashboard - transacciones:', transacciones);
  
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
    // Income: direct income, collected receivables, loan payments received, loan origination (marked as income but is receivable)
    const monthIncome = monthTransactions.filter((tx) => ['income', 'receivable_payment', 'loan'].includes(tx.tipo)).reduce((sum, tx) => sum + tx.monto, 0);
    // Expenses: direct expenses, credit card charges, payable payments, scheduled payments, credit card payments
    const monthExpenses = monthTransactions.filter((tx) => ['expense', 'credit_card_charge', 'payable_payment', 'scheduled_payment', 'credit_card_payment'].includes(tx.tipo)).reduce((sum, tx) => sum + tx.monto, 0);
    const upcoming = scheduledPayments.filter((p) => p.active).slice(0, 5);
    return { availableMoney, receivableTotal, personDebt, bankDebt, otherDebt, creditUsed, totalDebt, monthIncome, monthExpenses, netWorth: availableMoney + receivableTotal - totalDebt, upcoming };
  }, [cuentas, debts, obligations, creditCards, scheduledPayments, transacciones]);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Buenos días' : today.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <>
      {/* Modals */}
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
      <IncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
      <TransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} />
      
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* BLOQUE 1: Encabezado Premium con saludo */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {greeting}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {today.toLocaleDateString('es-PE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* BLOQUE 1b: 3 Botones de Acción Primaria */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-600 font-semibold py-4 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <Minus className="w-5 h-5" /> Registrar Gasto
        </button>
        <button
          onClick={() => setIsIncomeModalOpen(true)}
          className="bg-green-500/10 hover:bg-green-500/20 text-green-600 font-semibold py-4 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Registrar Ingreso
        </button>
        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 font-semibold py-4 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          <ArrowRightLeft className="w-5 h-5" /> Transferencia
        </button>
      </div>

      {/* BLOQUE 2: Resumen Financiero Principal (4 Métricas Mejoradas) */}
      <div className="space-y-6">
        <SectionHeader title="Resumen Financiero" subtitle="Estado actual de tu patrimonio" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardMetric
            label="Dinero Disponible"
            value={formatCurrency(data.availableMoney)}
            icon={<Wallet className="w-5 h-5" />}
            variant="success"
            animated
          />
          <DashboardMetric
            label="Patrimonio Neto"
            value={formatCurrency(data.netWorth)}
            icon={<Landmark className="w-5 h-5" />}
            variant="primary"
            animated
          />
          <DashboardMetric
            label="Me Deben"
            value={formatCurrency(data.receivableTotal)}
            icon={<Users className="w-5 h-5" />}
            variant="info"
            animated
          />
          <DashboardMetric
            label="Total Debo"
            value={formatCurrency(data.totalDebt)}
            icon={<HandCoins className="w-5 h-5" />}
            variant="warning"
            animated
          />
        </div>
      </div>

      {/* BLOQUE 3: Actividad Reciente */}
      <div className="space-y-6">
        <SectionHeader
          title="Actividad Reciente"
          subtitle={`${transacciones.length} movimientos este mes`}
        />
        {transacciones.length > 0 ? (
          <ContainerCard padding="lg" shadow="md">
            <RecentTransactions transactions={transacciones.slice(0, 6)} />
          </ContainerCard>
        ) : (
          <EmptyState
            icon="📊"
            title="Sin movimientos aún"
            description="Registra tu primer movimiento para comenzar"
            action={{ label: 'Crear movimiento', onClick: () => {} }}
            size="md"
          />
        )}
      </div>

      {/* BLOQUE 4: Próximos Pagos */}
      <div className="space-y-6">
        <SectionHeader
          title="Próximos Pagos"
          subtitle={`${data.upcoming.length} obligaciones pendientes`}
        />
        {data.upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.upcoming.map((payment) => (
              <ContainerCard
                key={payment.id}
                padding="lg"
                shadow="md"
                className="hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {payment.name}
                    </p>
                    <p className="text-2xl font-bold mt-3">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-lg">
                    <CalendarClock className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
                <button className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-all duration-200 text-sm active:scale-95">
                  Pagar ahora
                </button>
              </ContainerCard>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="✓"
            title="Sin pagos próximos"
            description="Todas tus obligaciones están al día"
            size="md"
          />
        )}
      </div>

      {/* BLOQUE 5: Accesos Rápidos */}
      <div className="space-y-6">
        <SectionHeader title="Accesos Rápidos" subtitle="Tus acciones más utilizadas" />
        <ActionGrid
          actions={[
            {
              id: 'transfer',
              icon: <Send className="w-5 h-5" />,
              label: 'Transferir',
              onClick: () => {},
            },
            {
              id: 'deposit',
              icon: <Download className="w-5 h-5" />,
              label: 'Depositar',
              onClick: () => {},
            },
            {
              id: 'withdraw',
              icon: <LogOut className="w-5 h-5" />,
              label: 'Retirar',
              onClick: () => {},
            },
            {
              id: 'billing',
              icon: <CreditCard className="w-5 h-5" />,
              label: 'Facturación',
              onClick: () => {},
            },
          ]}
          columns={4}
          gap="md"
        />
      </div>

      {/* BLOQUE 6: Métricas Secundarias (Ingresos, Gastos, Tarjetas) */}
      <div className="space-y-6">
        <SectionHeader title="Estadísticas del Mes" subtitle="Resumen de ingresos y gastos" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatisticsCard
            title="Ingresos"
            icon={<ArrowDownLeft className="w-5 h-5" />}
            variant="success"
            data={[
              {
                value: formatCurrency(data.monthIncome),
                label: 'Total',
              },
            ]}
          />
          <StatisticsCard
            title="Gastos"
            icon={<ArrowUpRight className="w-5 h-5" />}
            variant="warning"
            data={[
              {
                value: formatCurrency(data.monthExpenses),
                label: 'Total',
              },
            ]}
          />
          <StatisticsCard
            title="Tarjetas"
            icon={<CreditCard className="w-5 h-5" />}
            variant="info"
            data={[
              {
                value: formatCurrency(data.creditUsed),
                label: 'Utilizado',
              },
            ]}
          />
        </div>
      </div>
    </div>
    </>
  );
}
