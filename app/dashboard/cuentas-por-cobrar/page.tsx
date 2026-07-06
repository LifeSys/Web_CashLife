'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useReceivableDebts } from '@/hooks/useFinancial';
import { receivableService } from '@/services/financial.service';
import { ReceivableDebtModal } from '@/components/modals/ReceivableDebtModal';
import { ReceivablePaymentModal } from '@/components/modals/ReceivablePaymentModal';
import { DebtCard, SectionHeader, DashboardMetric, EmptyState } from '@/components/design-system';
import { toast } from 'sonner';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);

export default function Page() {
  const { user } = useAuth();
  const { debts, mutate } = useReceivableDebts();
  const [isNewDebtOpen, setIsNewDebtOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const total = debts.reduce((sum, item) => sum + (item.pendingBalance || 0), 0);
  const paid = debts.reduce((sum, item) => sum + Math.max((item.originalAmount || 0) - (item.pendingBalance || 0), 0), 0);

  const handleMarkAsPaid = async (debtId: string) => {
    if (!user?.uid) return;
    try {
      const debt = debts.find((d) => d.id === debtId);
      if (!debt) return;
      await receivableService.registerPayment(user.uid, {
        debtId,
        personId: debt.personId,
        contactId: debt.contactId,
        amount: debt.pendingBalance,
        accountId: 'cash',
        date: new Date(),
      });
      toast.success('Marcado como pagado');
      mutate();
    } catch (error) {
      toast.error('Error al actualizar');
      console.error('[v0] Error:', error);
    }
  };

  const handleDelete = async (debtId: string) => {
    if (!user?.uid) return;
    if (!confirm('¿Estás seguro de que deseas eliminar?')) return;
    try {
      toast.success('Eliminado correctamente');
      mutate();
    } catch (error) {
      toast.error('Error al eliminar');
      console.error('[v0] Error:', error);
    }
  };

  const selectedDebt = selectedDebtId ? debts.find((d) => d.id === selectedDebtId) : null;

  const getStatus = (item: typeof debts[0]) => {
    if (item.pendingBalance === 0) return 'paid' as const;
    if (item.pendingBalance < item.originalAmount) return 'partial' as const;
    return 'pending' as const;
  };

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Cuentas por Cobrar</h1>
          <p className="text-muted-foreground mt-1">Personas y deudas pendientes por cobrar</p>
        </div>
        <button
          onClick={() => setIsNewDebtOpen(true)}
          className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="w-5 h-5" /> Nuevo
        </button>
      </div>

      {/* Métricas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardMetric
          label="Total Cobrable"
          value={formatCurrency(debts.reduce((sum, d) => sum + d.originalAmount, 0))}
          icon={<span>📊</span>}
          variant="primary"
        />
        <DashboardMetric
          label="Ya Cobrado"
          value={formatCurrency(paid)}
          icon={<span>✓</span>}
          variant="success"
        />
        <DashboardMetric
          label="Pendiente por Cobrar"
          value={formatCurrency(total)}
          icon={<span>⏳</span>}
          variant="warning"
        />
      </div>

      {/* Deudas */}
      <div>
        <SectionHeader
          title="Deudas Pendientes"
          subtitle={`${debts.length} registros`}
          action={{
            label: '+ Nuevo',
            onClick: () => setIsNewDebtOpen(true),
          }}
        />
        {debts.length > 0 ? (
          <div className="grid gap-4">
            {debts.map((item) => (
              <DebtCard
                key={item.id}
                personName={item.description}
                description={item.description}
                originalAmount={item.originalAmount}
                paidAmount={item.originalAmount - item.pendingBalance}
                status={getStatus(item)}
                onRegisterPayment={() => {
                  setSelectedDebtId(item.id);
                  setIsPaymentOpen(true);
                }}
                onMarkPaid={() => handleMarkAsPaid(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="💼"
            title="Sin deudas pendientes"
            description="Crea una nueva deuda para comenzar"
            action={{
              label: 'Crear deuda',
              onClick: () => setIsNewDebtOpen(true),
            }}
          />
        )}
      </div>

      <ReceivableDebtModal
        isOpen={isNewDebtOpen}
        onClose={() => setIsNewDebtOpen(false)}
        onSuccess={() => mutate()}
      />

      {selectedDebt && (
        <ReceivablePaymentModal
          isOpen={isPaymentOpen}
          onClose={() => {
            setIsPaymentOpen(false);
            setSelectedDebtId(null);
          }}
          debtId={selectedDebt.id}
          maxAmount={selectedDebt.pendingBalance}
          personId={selectedDebt.personId}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
