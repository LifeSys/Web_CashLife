'use client';

import { useState } from 'react';
import { CheckCircle2, ClipboardList, Edit, History, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { usePayableObligations } from '@/hooks/useFinancial';
import { useAccounts } from '@/hooks/useAccounts';
import { payableService } from '@/services/financial.service';
import { PayableObligationModal } from '@/components/modals/PayableObligationModal';
import { PayableObligationEditModal } from '@/components/modals/PayableObligationEditModal';
import { PayableObligationHistoryModal } from '@/components/modals/PayableObligationHistoryModal';
import { PayablePaymentModal } from '@/components/modals/PayablePaymentModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { toast } from 'sonner';
import type { PayableObligation } from '@/types';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);

const CREDITOR_TYPE_LABELS: Record<string, string> = {
  person: 'Persona',
  bank: 'Banco',
  company: 'Empresa',
  sunat: 'SUNAT',
  other: 'Otro',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  partial: 'Pago parcial',
  paid: 'Pagado',
  overdue: 'Vencido',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-500',
  partial: 'bg-blue-500/15 text-blue-500',
  paid: 'bg-emerald-500/15 text-emerald-500',
  overdue: 'bg-red-500/15 text-red-500',
};

export default function Page() {
  const { user } = useAuth();
  const { obligations, mutate } = usePayableObligations();
  const { cuentas } = useAccounts();
  const [isNewObligationOpen, setIsNewObligationOpen] = useState(false);
  const [selectedObligationId, setSelectedObligationId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [obligationToEdit, setObligationToEdit] = useState<PayableObligation | null>(null);
  const [historyObligationId, setHistoryObligationId] = useState<string | null>(null);
  const [obligationToDelete, setObligationToDelete] = useState<PayableObligation | null>(null);

  const total = obligations.reduce((sum, item) => sum + (item.pendingBalance || 0), 0);
  const paid = obligations.reduce((sum, item) => sum + Math.max((item.originalAmount || 0) - (item.pendingBalance || 0), 0), 0);

  const handleMarkAsPaid = async (obligationId: string) => {
    if (!user?.uid) return;
    // Se paga con Efectivo por defecto — 'cash' no es un id de cuenta real,
    // así que había que resolverlo a la cuenta "Efectivo" de verdad o esto
    // fallaba siempre con "Cuenta cash no encontrada".
    const efectivo = cuentas.find((a) => a.nombre === 'Efectivo');
    if (!efectivo) {
      toast.error('No se encontró la cuenta "Efectivo". Usa "Registrar pago" para elegir otra cuenta.');
      return;
    }
    try {
      const obligation = obligations.find((o) => o.id === obligationId);
      if (!obligation) return;
      await payableService.registerPayment(user.uid, {
        obligationId,
        personId: obligation.personId,
        contactId: obligation.contactId,
        amount: obligation.pendingBalance,
        accountId: efectivo.id,
        date: new Date(),
      });
      toast.success('Marcado como pagado (desde Efectivo)');
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar');
      console.error('[v0] Error:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user?.uid || !obligationToDelete) return;
    try {
      await payableService.deleteObligation(user.uid, obligationToDelete.id);
      toast.success('Eliminado correctamente');
      setObligationToDelete(null);
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
      console.error('[CashLife] Error deleting obligation:', error);
    }
  };

  const selectedObligation = selectedObligationId ? obligations.find((o) => o.id === selectedObligationId) : null;
  const historyObligation = historyObligationId ? obligations.find((o) => o.id === historyObligationId) : null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cuentas por Pagar</h1>
          <p className="text-muted-foreground">Obligaciones con personas, bancos, empresas, SUNAT y otros</p>
        </div>
        <button
          onClick={() => setIsNewObligationOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <PlusCircle className="h-4 w-4" /> Nuevo registro
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pendiente por pagar</p>
          <p className="text-3xl font-bold">{formatCurrency(total)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Ya pagado</p>
          <p className="text-3xl font-bold text-emerald-500">{formatCurrency(paid)}</p>
        </div>
      </div>
      <div className="grid gap-4">
        {obligations.map((item) => {
          const toDate = (value?: unknown) =>
            value instanceof Date ? value : value && typeof value === 'object' && 'toDate' in value ? (value as { toDate(): Date }).toDate() : new Date(String(value));

          return (
            <article key={item.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold">{item.description}</h2>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${STATUS_BADGE_CLASSES[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.creditorName} · {CREDITOR_TYPE_LABELS[item.creditorType] ?? item.creditorType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vencimiento: {toDate(item.dueDate).toLocaleDateString('es-PE')}
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
                    setSelectedObligationId(item.id);
                    setIsPaymentOpen(true);
                  }}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
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
                  onClick={() => setObligationToEdit(item)}
                  className="rounded-lg bg-muted px-3 py-2 text-sm"
                >
                  <Edit className="inline h-4 w-4" /> Editar
                </button>
                <button
                  onClick={() => setHistoryObligationId(item.id)}
                  className="rounded-lg bg-muted px-3 py-2 text-sm"
                >
                  <History className="inline h-4 w-4" /> Historial
                </button>
                <button
                  onClick={() => setObligationToDelete(item)}
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <Trash2 className="inline h-4 w-4" /> Eliminar
                </button>
              </div>
            </article>
          );
        })}
        {!obligations.length && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Aún no hay registros. Usa el botón "Nuevo registro" para empezar.
          </div>
        )}
      </div>

      <PayableObligationModal
        isOpen={isNewObligationOpen}
        onClose={() => setIsNewObligationOpen(false)}
        onSuccess={() => mutate()}
      />

      {selectedObligation && (
        <PayablePaymentModal
          isOpen={isPaymentOpen}
          onClose={() => {
            setIsPaymentOpen(false);
            setSelectedObligationId(null);
          }}
          obligationId={selectedObligation.id}
          maxAmount={selectedObligation.pendingBalance}
          personId={selectedObligation.personId}
          contactId={selectedObligation.contactId}
          onSuccess={() => mutate()}
        />
      )}

      <PayableObligationEditModal
        isOpen={!!obligationToEdit}
        obligation={obligationToEdit}
        onClose={() => setObligationToEdit(null)}
        onSuccess={() => mutate()}
      />

      {historyObligation && (
        <PayableObligationHistoryModal
          isOpen={!!historyObligation}
          obligationId={historyObligation.id}
          obligation={historyObligation}
          onClose={() => setHistoryObligationId(null)}
          onRegisterPayment={() => {
            setSelectedObligationId(historyObligation.id);
            setIsPaymentOpen(true);
          }}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!obligationToDelete}
        onClose={() => setObligationToDelete(null)}
        title="¿Eliminar esta cuenta por pagar?"
        itemName={obligationToDelete?.description ?? ''}
        bullets={['Todo su historial de pagos parciales registrados']}
        warningNote="Si ya habías registrado pagos contra esto, ese dinero se revierte del saldo de la cuenta desde donde se había pagado."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
