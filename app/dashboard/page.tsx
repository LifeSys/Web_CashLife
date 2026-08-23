'use client';

import { useMemo, useState } from 'react';
import {
  Landmark,
  Users,
  HandCoins,
  Wallet,
  CalendarClock,
  Minus,
  Plus,
  ArrowRightLeft,
  MessageCircle,
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import {
  usePayableObligations,
  useReceivableDebts,
  useScheduledPayments,
} from '@/hooks/useFinancial';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCollectionReminders, FOLLOW_UP_DAYS } from '@/hooks/useCollectionReminders';
import { useSettings } from '@/hooks/useSettings';
import { personService } from '@/services/person.service';
import { buildDebtMessage } from '@/lib/whatsapp';
import { toPenEquivalent } from '@/lib/currency';
import {
  DashboardMetric,
  SectionHeader,
  EmptyState,
  ContainerCard,
} from '@/components/design-system';
import { RecentTransactions } from '@/features/dashboard/components/RecentTransactions';
import { ExpenseModal } from '@/components/modals/ExpenseModal';
import { IncomeModal } from '@/components/modals/IncomeModal';
import { TransferModal } from '@/components/modals/TransferModal';
import { WhatsAppMessageModal } from '@/components/modals/WhatsAppMessageModal';
import { useAuth } from '@/providers/AuthProvider';
import type { Person } from '@/types';

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
  const { user } = useAuth();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [whatsAppContact, setWhatsAppContact] = useState<Person | null>(null);
  const { transacciones } = useTransactions();
  const { cuentas } = useAccounts();
  const { debts } = useReceivableDebts();
  const { obligations } = usePayableObligations();
  const { scheduledPayments } = useScheduledPayments();
  const { creditCards } = useCreditCards();
  const { settings } = useSettings();
  const { followUpRows, mutatePeople } = useCollectionReminders();

  const handleReminderSent = async (contact: Person) => {
    if (!user?.uid) return;
    try {
      await personService.update(user.uid, contact.id, { lastReminderAt: new Date() });
      mutatePeople();
    } catch (error) {
      console.error('[CashLife] Error registrando recordatorio:', error);
    }
  };

  const data = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const availableMoney = cuentas.filter((a) => a.tipo !== 'credit_card').reduce((sum, a) => sum + (a.saldo ?? a.balance ?? 0), 0);
    const receivableTotal = debts.reduce((sum, d) => sum + toPenEquivalent(d.pendingBalance || 0, d.tipoCambio), 0);
    const personDebt = obligations.filter((o) => o.creditorType === 'person' || !!o.personId).reduce((sum, o) => sum + toPenEquivalent(o.pendingBalance || 0, o.tipoCambio), 0);
    const bankDebt = obligations.filter((o) => o.creditorType === 'bank').reduce((sum, o) => sum + toPenEquivalent(o.pendingBalance || 0, o.tipoCambio), 0);
    const otherDebt = obligations.filter((o) => o.creditorType !== 'person' && o.creditorType !== 'bank' && !o.personId).reduce((sum, o) => sum + toPenEquivalent(o.pendingBalance || 0, o.tipoCambio), 0);
    const creditUsed = creditCards.reduce((sum, c) => sum + (c.usedAmount ?? c.montoUtilizado ?? 0), 0);
    const totalDebt = personDebt + bankDebt + otherDebt + creditUsed;
    const monthTransactions = transacciones.filter((tx) => toDate(tx.fecha) >= startMonth);
    // Ingresos/gastos reales del mes — 'receivable_debt'/'payable_obligation'
    // (registrar que te deben o debes) no cuentan como dinero movido todavía,
    // solo 'receivable_payment'/'payable_payment' cuando de verdad se cobra/paga.
    const monthIncome = monthTransactions.filter((tx) => ['income', 'receivable_payment'].includes(tx.tipo)).reduce((sum, tx) => sum + tx.monto, 0);
    const monthExpenses = monthTransactions.filter((tx) => ['expense', 'credit_card_charge', 'payable_payment', 'scheduled_payment'].includes(tx.tipo)).reduce((sum, tx) => sum + tx.monto, 0);
    const upcoming = scheduledPayments.filter((p) => p.active).slice(0, 5);
    return { availableMoney, receivableTotal, personDebt, bankDebt, otherDebt, creditUsed, totalDebt, monthIncome, monthExpenses, monthTransactionsCount: monthTransactions.length, netWorth: availableMoney + receivableTotal - totalDebt, upcoming };
  }, [cuentas, debts, obligations, creditCards, scheduledPayments, transacciones]);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Buenos días' : today.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <>
      {/* Modals */}
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
      <IncomeModal isOpen={isIncomeModalOpen} onClose={() => setIsIncomeModalOpen(false)} />
      <TransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} />
      {whatsAppContact && (
        <WhatsAppMessageModal
          isOpen={!!whatsAppContact}
          onClose={() => setWhatsAppContact(null)}
          contactName={whatsAppContact.nombre}
          phone={whatsAppContact.phone}
          initialMessage={buildDebtMessage({
            contactName: whatsAppContact.nombre,
            netBalance: followUpRows.find((row) => row.contact.id === whatsAppContact.id)?.netBalance ?? 0,
            paymentMethodLabel: settings?.metodoPagoLabel,
            paymentMethodValue: settings?.metodoPagoValor,
          })}
          onSend={() => handleReminderSent(whatsAppContact)}
        />
      )}

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

      {/* BLOQUE 2b: Cobros pendientes de seguimiento (aviso, no envía nada solo) */}
      {followUpRows.length > 0 && (
        <div className="space-y-6">
          <SectionHeader
            title="Cobros pendientes"
            subtitle={
              followUpRows.length === 1
                ? `1 persona te debe y no le has escrito en más de ${FOLLOW_UP_DAYS} días`
                : `${followUpRows.length} personas te deben y no les has escrito en más de ${FOLLOW_UP_DAYS} días`
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followUpRows.map(({ contact, netBalance, daysSinceReminder }) => (
              <ContainerCard key={contact.id} padding="lg" shadow="md" className="hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
                      {contact.nombre}
                    </p>
                    <p className="text-2xl font-bold mt-3">{formatCurrency(netBalance)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {daysSinceReminder === null ? 'Nunca le has escrito' : `Último recordatorio hace ${daysSinceReminder} días`}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg flex-shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <button
                  onClick={() => setWhatsAppContact(contact)}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-all duration-200 text-sm active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  Escribirle
                </button>
              </ContainerCard>
            ))}
          </div>
        </div>
      )}

      {/* BLOQUE 3: Actividad Reciente */}
      <div className="space-y-6">
        <SectionHeader
          title="Actividad Reciente"
          subtitle={`${data.monthTransactionsCount} movimientos este mes · ${transacciones.length} en total`}
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


    </div>
    </>
  );
}
