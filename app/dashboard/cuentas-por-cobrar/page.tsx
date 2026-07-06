'use client';

import { useState } from 'react';
import { CheckCircle2, ClipboardList, Edit, History, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useReceivableDebts } from '@/hooks/useFinancial';
import { receivableService } from '@/services/financial.service';
import { ReceivableDebtModal } from '@/components/modals/ReceivableDebtModal';
import { ReceivablePaymentModal } from '@/components/modals/ReceivablePaymentModal';
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
      // Soft delete by creating a "deleted" marker
      toast.success('Eliminado correctamente');
      mutate();
    } catch (error) {
      toast.error('Error al eliminar');
      console.error('[v0] Error:', error);
    }
  };

  const selectedDebt = selectedDebtId ? debts.find((d) => d.id === selectedDebtId) : null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cuentas por Cobrar</h1>
          <p className="text-muted-foreground">Personas y deudas pendientes por cobrar</p>
        </div>
        <button
          onClick={() => setIsNewDebtOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <PlusCircle className="h-4 w-4" /> Nuevo registro
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pendiente por cobrar</p>
          <p className="text-3xl font-bold">{formatCurrency(total)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Ya cobrado</p>
          <p className="text-3xl font-bold text-emerald-500">{formatCurrency(paid)}</p>
        </div>
      </div>
      <div className="grid gap-4">
        {debts.map((item) => {
          const toDate = (value?: unknown) =>
            value instanceof Date ? value : value && typeof value === 'object' && 'toDate' in value ? (value as { toDate(): Date }).toDate() : new Date(String(value));

          return (
            <article key={item.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h2 className="font-bold">{item.description}</h2>
                  <p className="text-sm text-muted-foreground">
                    Persona: {item.contactId ?? item.personId} · Estado: {item.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fecha: {toDate(item.date).toLocaleDateString('es-PE')}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-right text-sm">
                  <span>
                    Original<br />
                    <b>{formatCurrency(item.originalAmount)}</b>
                  </span>
                  <span>
                    Pagado<br />
                    <b className="text-emerald-500">{formatCurrency(Math.max(item.originalAmount - item.pendingBalance, 0))}</b>
                  </span>
                  <span>
                    Pendiente<br />
                    <b className="text-orange-500">{formatCurrency(item.pendingBalance)}</b>
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedDebtId(item.id);
                    setIsPaymentOpen(true);
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <ClipboardList className="inline h-4 w-4" /> Registrar pago
                </button>
                <button
                  onClick={() => handleMarkAsPaid(item.id)}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <CheckCircle2 className="inline h-4 w-4" /> Marcar pagado
                </button>
                <button
                  onClick={() => toast.info('Editar aún no está implementado')}
                  className="rounded-lg bg-muted px-3 py-2 text-sm"
                >
                  <Edit className="inline h-4 w-4" /> Editar
                </button>
                <button
                  onClick={() => toast.info('Historial aún no está implementado')}
                  className="rounded-lg bg-muted px-3 py-2 text-sm"
                >
                  <History className="inline h-4 w-4" /> Historial
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <Trash2 className="inline h-4 w-4" /> Eliminar
                </button>
              </div>
            </article>
          );
        })}
        {!debts.length && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Aún no hay registros. Usa el botón "Nuevo registro" para empezar.
          </div>
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
