'use client';

import { useMemo } from 'react';
import { CalendarClock, CreditCard, HandCoins, Landmark, LineChart, TrendingDown, TrendingUp, Users, Building2, WalletCards } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { usePayableObligations, useReceivableDebts, useScheduledPayments } from '@/hooks/useFinancial';
import { useCreditCards } from '@/hooks/useCreditCards';
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

  const cards = [
    { label: 'Dinero disponible', value: data.availableMoney, icon: Landmark, tone: 'text-emerald-500' },
    { label: 'Me deben', value: data.receivableTotal, icon: Users, tone: 'text-sky-500' },
    { label: 'Debo personas', value: data.personDebt, icon: HandCoins, tone: 'text-orange-500' },
    { label: 'Debo bancos', value: data.bankDebt, icon: Building2, tone: 'text-red-500' },
    { label: 'Tarjetas utilizadas', value: data.creditUsed, icon: CreditCard, tone: 'text-purple-500' },
    { label: 'Ingresos del mes', value: data.monthIncome, icon: TrendingUp, tone: 'text-emerald-500' },
    { label: 'Gastos del mes', value: data.monthExpenses, icon: TrendingDown, tone: 'text-rose-500' },
    { label: 'Patrimonio Neto', value: data.netWorth, icon: LineChart, tone: 'text-primary' },
    { label: 'TOTAL QUE DEBO', value: data.totalDebt, icon: WalletCards, tone: 'text-red-600' },
  ];

  return <div className="space-y-6 p-4 md:p-6"><div><h1 className="text-2xl md:text-3xl font-bold">Dashboard financiero</h1><p className="text-muted-foreground">Situación financiera real sin doble conteo.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card) => <div key={card.label} className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{card.label}</p><card.icon className={`h-5 w-5 ${card.tone}`} /></div><p className="mt-3 text-2xl font-bold">{formatCurrency(card.value)}</p></div>)}</div><div className="grid gap-6 xl:grid-cols-3"><div className="xl:col-span-2"><RecentTransactions transactions={transacciones.slice(0, 8)} /></div><section className="rounded-xl border border-border bg-card p-4"><h2 className="mb-4 flex items-center gap-2 font-bold"><CalendarClock className="h-5 w-5" /> Pagos próximos</h2>{data.upcoming.length ? data.upcoming.map((p) => <div key={p.id} className="flex justify-between border-t border-border py-3 text-sm"><span>{p.name}</span><strong>{formatCurrency(p.amount)}</strong></div>) : <p className="text-sm text-muted-foreground">Sin pagos activos.</p>}</section></div></div>;
}
