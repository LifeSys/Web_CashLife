'use client';

import { useState } from 'react';
import { PlusCircle, CalendarClock } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useScheduledPayments } from '@/hooks/useFinancial';
import { scheduledPaymentService } from '@/services/financial.service';
import { ScheduledPaymentRow } from '@/components/sections/ScheduledPaymentRow';
import { ScheduledPaymentModal } from '@/components/modals/ScheduledPaymentModal';
import { ScheduledPaymentPayModal } from '@/components/modals/ScheduledPaymentPayModal';
import { ScheduledPaymentSplitsModal } from '@/components/modals/ScheduledPaymentSplitsModal';
import { DeleteScheduledPaymentModal } from '@/components/modals/DeleteScheduledPaymentModal';
import { AutoPayQuickModal } from '@/components/modals/AutoPayQuickModal';
import { EmptyState } from '@/components/design-system/feedback/EmptyState';
import { toast } from 'sonner';
import type { ScheduledPayment } from '@/types';

const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function PagosProgramadosPage() {
  const { user } = useAuth();
  const { scheduledPayments, isLoading, mutate } = useScheduledPayments();
  const [period] = useState(currentPeriod());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentToPay, setPaymentToPay] = useState<ScheduledPayment | null>(null);
  const [paymentToSplit, setPaymentToSplit] = useState<ScheduledPayment | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<ScheduledPayment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<ScheduledPayment | null>(null);
  const [autoPayChooserPayment, setAutoPayChooserPayment] = useState<ScheduledPayment | null>(null);

  // Clic en el ícono de rayo/repeat de cada tarjeta: apaga directo si ya
  // estaba en automático; si lo prende y ya recuerda una cuenta/tarjeta de
  // una vez anterior la reutiliza; si nunca tuvo una, pide elegirla.
  const handleToggleAutoPay = async (payment: ScheduledPayment) => {
    if (!user?.uid) return;
    if (payment.autoPay) {
      try {
        await scheduledPaymentService.update(user.uid, payment.id, { autoPay: false });
        toast.success('Cobro automático desactivado');
        mutate();
      } catch (error) {
        toast.error('Error al desactivar el cobro automático');
        console.error('[CashLife] Error toggling autoPay:', error);
      }
      return;
    }
    if (payment.suggestedAccountId) {
      try {
        await scheduledPaymentService.update(user.uid, payment.id, { autoPay: true });
        toast.success('Cobro automático activado');
        mutate();
      } catch (error) {
        toast.error('Error al activar el cobro automático');
        console.error('[CashLife] Error toggling autoPay:', error);
      }
      return;
    }
    setAutoPayChooserPayment(payment);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pagos Programados</h1>
          <p className="text-muted-foreground mt-1">
            Tus gastos fijos de cada mes — Netflix, Movistar, alquiler, etc. Aquí los marcas pagados, no se cobran solos.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex-shrink-0 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo pago</span>
        </button>
      </div>

      {!isLoading && scheduledPayments.length === 0 && (
        <EmptyState
          icon={<CalendarClock className="w-full h-full" />}
          title="Sin pagos programados"
          description="Registra tus gastos fijos mensuales (suscripciones, alquiler, servicios) para no perderles la pista."
          action={{ label: 'Crear el primero', onClick: () => setShowCreateModal(true) }}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scheduledPayments.map((payment) => (
          <ScheduledPaymentRow
            key={payment.id}
            payment={payment}
            period={period}
            onPay={setPaymentToPay}
            onManageSplit={setPaymentToSplit}
            onEdit={setPaymentToEdit}
            onDelete={setPaymentToDelete}
            onToggleAutoPay={handleToggleAutoPay}
          />
        ))}
      </div>

      <ScheduledPaymentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => mutate()}
      />

      <ScheduledPaymentModal
        isOpen={!!paymentToEdit}
        payment={paymentToEdit}
        onClose={() => setPaymentToEdit(null)}
        onSuccess={() => mutate()}
      />

      <ScheduledPaymentPayModal
        isOpen={!!paymentToPay}
        payment={paymentToPay}
        period={period}
        onClose={() => setPaymentToPay(null)}
        onSuccess={() => setPaymentToPay(null)}
      />

      <ScheduledPaymentSplitsModal
        isOpen={!!paymentToSplit}
        payment={paymentToSplit}
        onClose={() => setPaymentToSplit(null)}
      />

      <DeleteScheduledPaymentModal
        isOpen={!!paymentToDelete}
        payment={paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onSuccess={() => mutate()}
      />

      <AutoPayQuickModal
        isOpen={!!autoPayChooserPayment}
        payment={autoPayChooserPayment}
        onClose={() => setAutoPayChooserPayment(null)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
