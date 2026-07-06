'use client';

import { useMemo } from 'react';
import { BarChart3, Bell, CalendarClock, CreditCard, HandCoins, Landmark, LineChart, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { usePeople } from '@/hooks/usePeople';
import { usePayableObligations, useReceivableDebts, useScheduledPayments } from '@/hooks/useFinancial';
import { RecentTransactions } from '@/features/dashboard/components/RecentTransactions';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
const toDate = (value: unknown) => value instanceof Date ? value : value && typeof value === 'object' && 'toDate' in value ? (value as { toDate(): Date }).toDate() : new Date(String(value));

export default function DashboardPage() {
  const { transacciones } = useTransactions();
  const { cuentas } = useAccounts();
  const { personas } = usePeople();
  const { debts } = useReceivableDebts();
  const { obligations } = usePayableObligations();
  const { scheduledPayments } = useScheduledPayments();

  const data = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const availableMoney = cuentas.filter((account) => account.tipo !== 'credit_card').reduce((sum, account) => sum + (account.saldo ?? account.balance ?? 0), 0);
    const creditUsed = cuentas.filter((account) => account.tipo === 'credit_card').reduce((sum, account) => sum + Math.max((account.creditLimit ?? 0) - (account.saldo ?? account.balance ?? 0), 0), 0);
    const receivableTotal = debts.reduce((sum, debt) => sum + debt.pendingBalance, 0) + personas.filter((person) => person.tipo === 'DEUDOR').reduce((sum, person) => sum + person.deuda, 0);
    const payableTotal = obligations.reduce((sum, obligation) => sum + obligation.pendingBalance, 0) + personas.filter((person) => person.tipo === 'PRESTAMISTA').reduce((sum, person) => sum + person.deuda, 0);
    const monthTransactions = transacciones.filter((tx) => toDate(tx.fecha) >= startMonth);
    const monthIncome = monthTransactions.filter((tx) => tx.tipo === 'income').reduce((sum, tx) => sum + tx.monto, 0);
    const monthExpenses = monthTransactions.filter((tx) => tx.tipo === 'expense').reduce((sum, tx) => sum + tx.monto, 0);
    const upcoming = scheduledPayments.filter((payment) => payment.active).slice(0, 4);
    const categoryTotals = monthTransactions.filter((tx) => tx.tipo === 'expense').reduce<Record<string, number>>((acc, tx) => ({ ...acc, [tx.categoria || 'Sin categoría']: (acc[tx.categoria || 'Sin categoría'] || 0) + tx.monto }), {});
    return { availableMoney, creditUsed, receivableTotal, payableTotal, monthIncome, monthExpenses, netWorth: availableMoney + receivableTotal - payableTotal - creditUsed, upcoming, categoryTotals };
  }, [cuentas, debts, obligations, personas, scheduledPayments, transacciones]);

  const cards = [
    { label: 'Dinero disponible', value: data.availableMoney, icon: Landmark, tone: 'text-emerald-500' },
    { label: 'Tarjetas utilizadas', value: data.creditUsed, icon: CreditCard, tone: 'text-rose-500' },
    { label: 'Total que me deben', value: data.receivableTotal, icon: Users, tone: 'text-sky-500' },
    { label: 'Total que debo', value: data.payableTotal, icon: HandCoins, tone: 'text-orange-500' },
    { label: 'Patrimonio Neto', value: data.netWorth, icon: LineChart, tone: 'text-primary' },
    { label: 'Ingresos del mes', value: data.monthIncome, icon: TrendingUp, tone: 'text-emerald-500' },
    { label: 'Gastos del mes', value: data.monthExpenses, icon: TrendingDown, tone: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Centro de control financiero</h1>
          <p className="text-muted-foreground">Resumen consolidado y actualizado desde Firestore.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"><Bell className="h-4 w-4 text-primary" /> Notificaciones locales activas</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <div key={card.label} className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{card.label}</p><card.icon className={`h-5 w-5 ${card.tone}`} /></div><p className="mt-3 text-2xl font-bold">{formatCurrency(card.value)}</p></div>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><RecentTransactions transactions={transacciones.slice(0, 6)} /></div>
        <section className="rounded-xl border border-border bg-card p-4"><h2 className="mb-4 flex items-center gap-2 font-bold"><CalendarClock className="h-5 w-5" /> Próximos pagos por vencer</h2>{data.upcoming.length ? data.upcoming.map((payment) => <div key={payment.id} className="flex justify-between border-t border-border py-3 text-sm"><span>{payment.name}</span><strong>{formatCurrency(payment.amount)}</strong></div>) : <p className="text-sm text-muted-foreground">No hay pagos programados activos.</p>}</section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4"><h2 className="mb-4 flex items-center gap-2 font-bold"><BarChart3 className="h-5 w-5" /> Ingresos vs gastos</h2><div className="space-y-3"><div className="h-3 rounded-full bg-muted"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min((data.monthIncome / Math.max(data.monthIncome + data.monthExpenses, 1)) * 100, 100)}%` }} /></div><div className="h-3 rounded-full bg-muted"><div className="h-3 rounded-full bg-rose-500" style={{ width: `${Math.min((data.monthExpenses / Math.max(data.monthIncome + data.monthExpenses, 1)) * 100, 100)}%` }} /></div></div></section>
        <section className="rounded-xl border border-border bg-card p-4"><h2 className="mb-4 font-bold">Gastos por categoría</h2>{Object.entries(data.categoryTotals).slice(0, 5).map(([category, total]) => <div key={category} className="flex justify-between border-t border-border py-2 text-sm"><span>{category}</span><strong>{formatCurrency(total)}</strong></div>)}{!Object.keys(data.categoryTotals).length && <p className="text-sm text-muted-foreground">Sin gastos este mes.</p>}</section>
      </div>
    </div>
  );
}
