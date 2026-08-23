'use client';

import { useState } from 'react';
import { PlusCircle, CalendarClock } from 'lucide-react';
import { useScheduledPayments } from '@/hooks/useFinancial';
import { ScheduledPaymentRow } from '@/components/sections/ScheduledPaymentRow';
import { ScheduledPaymentModal } from '@/components/modals/ScheduledPaymentModal';
import { ScheduledPaymentPayModal } from '@/components/modals/ScheduledPaymentPayModal';
import { EmptyState } from '@/components/design-system/feedback/EmptyState';
import type { ScheduledPayment } from '@/types';

const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function PagosProgramadosPage() {
  const { scheduledPayments, isLoading, mutate } = useScheduledPayments();
  const [period] = useState(currentPeriod());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentToPay, setPaymentToPay] = useState<ScheduledPayment | null>(null);

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
          />
        ))}
      </div>

      <ScheduledPaymentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => mutate()}
      />

      <ScheduledPaymentPayModal
        isOpen={!!paymentToPay}
        payment={paymentToPay}
        period={period}
        onClose={() => setPaymentToPay(null)}
        onSuccess={() => setPaymentToPay(null)}
      />
    </div>
  );
}
