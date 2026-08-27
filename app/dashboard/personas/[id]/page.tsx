'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { usePeople } from '@/hooks/usePeople';
import { usePayableObligations, useReceivableDebts } from '@/hooks/useFinancial';
import { useSettings } from '@/hooks/useSettings';
import { personService, PersonFinancialSummary } from '@/services/person.service';
import { buildDebtMessage, debtsToMessageItems } from '@/lib/whatsapp';
import { ContactPersonalInfo } from '@/components/design-system/ContactPersonalInfo';
import { ContactFinancialSummary } from '@/components/design-system/ContactFinancialSummary';
import { ContactHistoryTimeline, type TimelineEvent } from '@/components/design-system/ContactHistoryTimeline';
import { ContactActionButtons } from '@/components/design-system/ContactActionButtons';
import { ReceivableDebtContextModal } from '@/components/modals/ReceivableDebtContextModal';
import { PayableObligationContextModal } from '@/components/modals/PayableObligationContextModal';
import { ReceivablePaymentContextModal } from '@/components/modals/ReceivablePaymentContextModal';
import { PayablePaymentContextModal } from '@/components/modals/PayablePaymentContextModal';
import { PersonEditModal } from '@/components/modals/PersonEditModal';
import { WhatsAppMessageModal } from '@/components/modals/WhatsAppMessageModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { receivableService, payableService } from '@/services/financial.service';
import { toast } from 'sonner';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { contacts, mutate: mutatePeople } = usePeople();
  const { debts, mutate: mutateDebts } = useReceivableDebts();
  const { obligations, mutate: mutateObligations } = usePayableObligations();
  const { settings } = useSettings();

  const [financialSummary, setFinancialSummary] = useState<PersonFinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCollectionPaymentModalOpen, setIsCollectionPaymentModalOpen] = useState(false);
  const [isObligationPaymentModalOpen, setIsObligationPaymentModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<TimelineEvent | null>(null);
  const [isDeleteContactModalOpen, setIsDeleteContactModalOpen] = useState(false);

  const contact = contacts.find((c) => c.id === id);

  // Fetch financial summary
  useEffect(() => {
    if (!user?.uid || !id) return;
    
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const summary = await personService.getFinancialSummary(user.uid, id);
        setFinancialSummary(summary);
      } catch (error) {
        console.error('[v0] Error fetching financial summary:', error);
        toast.error('Error al cargar resumen financiero');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [user?.uid, id]);

  if (!contact) {
    return (
      <div className="p-6 space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:text-primary/80"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">Contacto no encontrado</p>
        </div>
      </div>
    );
  }

  const contactDebts = debts.filter((d) => (d.contactId ?? d.personId) === id);
  const contactObligations = obligations.filter((o) => (o.contactId ?? o.personId) === id);

  const handleWhatsApp = () => {
    if (!contact.phone) {
      toast.error('No hay número de teléfono registrado');
      return;
    }
    setIsWhatsAppModalOpen(true);
  };

  const whatsAppMessage = buildDebtMessage({
    contactName: contact?.nombre ?? '',
    netBalance: financialSummary?.netBalance ?? 0,
    paymentMethodLabel: settings?.metodoPagoLabel,
    paymentMethodValue: settings?.metodoPagoValor,
    template: settings?.msgDebtTemplate,
    items: id ? debtsToMessageItems(debts, id) : undefined,
  });

  const handleReminderSent = async () => {
    if (!user?.uid || !id) return;
    try {
      await personService.update(user.uid, id, { lastReminderAt: new Date() });
      mutatePeople();
    } catch (error) {
      console.error('[CashLife] Error registrando recordatorio:', error);
    }
  };

  const handleCall = () => {
    if (!contact.phone) {
      toast.error('No hay número de teléfono registrado');
      return;
    }
    window.location.href = `tel:${contact.phone}`;
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteContactModalOpen(true);
  };

  const handleConfirmDeleteContact = async () => {
    try {
      if (!user?.uid || !id) return;
      setIsLoadingActions(true);
      await personService.delete(user.uid, id);
      toast.success('Contacto eliminado exitosamente');
      router.push('/dashboard/personas');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar contacto');
      console.error('[v0] Delete error:', error);
    } finally {
      setIsLoadingActions(false);
    }
  };

  const handleConfirmDeleteEvent = async () => {
    if (!user?.uid || !eventToDelete) return;
    try {
      if (eventToDelete.type === 'receivable') {
        await receivableService.deleteDebt(user.uid, eventToDelete.id);
      } else {
        await payableService.deleteObligation(user.uid, eventToDelete.id);
      }
      toast.success('Eliminado correctamente');
      setEventToDelete(null);
      await handleRefreshAfterOperation();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
      console.error('[CashLife] Error deleting timeline event:', error);
    }
  };

  const handleAddCollection = () => {
    setIsCollectionModalOpen(true);
  };

  const handleAddPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handleRegisterCollectionPayment = () => {
    setIsCollectionPaymentModalOpen(true);
  };

  const handleRegisterObligationPayment = () => {
    setIsObligationPaymentModalOpen(true);
  };

  // Auto-refresh function to update all related data
  const handleRefreshAfterOperation = async () => {
    try {
      // Refresh all SWR caches
      await Promise.all([
        mutatePeople(),
        mutateDebts(),
        mutateObligations(),
      ]);
      
      // Refresh financial summary
      if (user?.uid && id) {
        const summary = await personService.getFinancialSummary(user.uid, id);
        setFinancialSummary(summary);
      }
    } catch (error) {
      console.error('[v0] Error refreshing data:', error);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      {/* Personal Info Section */}
      <div className="space-y-4">
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
            Información Personal
          </h2>
        </div>
        <ContactPersonalInfo
          contact={contact}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onWhatsApp={handleWhatsApp}
          onCall={handleCall}
        />
      </div>

      {/* Financial Summary Section */}
      {financialSummary && (
        <div className="space-y-4">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
              Resumen Financiero
            </h2>
          </div>
          <ContactFinancialSummary summary={financialSummary} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <ContactActionButtons
          onAddCollection={handleAddCollection}
          onAddPayment={handleAddPayment}
          onRegisterCollectionPayment={handleRegisterCollectionPayment}
          onRegisterObligationPayment={handleRegisterObligationPayment}
          isLoading={isLoadingActions}
        />
      </div>

      {/* Financial History Section */}
      <div className="space-y-4">
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide">
            Historial Financiero
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {contactDebts.length + contactObligations.length} operaciones registradas
          </p>
        </div>
        <ContactHistoryTimeline
          debts={contactDebts}
          obligations={contactObligations}
          isLoading={isLoading}
          onDelete={setEventToDelete}
        />
      </div>

      {/* Future Sections Placeholder */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground space-y-2">
          <p>• Documentos y comprobantes</p>
          <p>• Calendario de pagos</p>
          <p>• Recordatorios y actividades</p>
          <p>• Contratos y acuerdos</p>
        </div>
      </div>

      {/* Modals */}
      {contact && (
        <>
          <PersonEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            contact={contact}
            onSuccess={() => {
              setIsEditModalOpen(false);
              toast.success('Contacto actualizado');
              mutatePeople();
            }}
          />
          <ReceivableDebtContextModal
            isOpen={isCollectionModalOpen}
            onClose={() => setIsCollectionModalOpen(false)}
            contactId={id}
            contactName={contact.nombre}
            onSuccess={handleRefreshAfterOperation}
          />
          <PayableObligationContextModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            contactId={id}
            contactName={contact.nombre}
            onSuccess={handleRefreshAfterOperation}
          />
          <ReceivablePaymentContextModal
            isOpen={isCollectionPaymentModalOpen}
            onClose={() => setIsCollectionPaymentModalOpen(false)}
            contactId={id}
            contactName={contact.nombre}
            onSuccess={handleRefreshAfterOperation}
          />
          <PayablePaymentContextModal
            isOpen={isObligationPaymentModalOpen}
            onClose={() => setIsObligationPaymentModalOpen(false)}
            contactId={id}
            contactName={contact.nombre}
            onSuccess={handleRefreshAfterOperation}
          />
          <WhatsAppMessageModal
            isOpen={isWhatsAppModalOpen}
            onClose={() => setIsWhatsAppModalOpen(false)}
            contactName={contact.nombre}
            phone={contact.phone}
            initialMessage={whatsAppMessage}
            onSend={handleReminderSent}
          />
        </>
      )}

      <ConfirmDeleteModal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        title={eventToDelete?.type === 'receivable' ? '¿Eliminar esta cuenta por cobrar?' : '¿Eliminar esta cuenta por pagar?'}
        itemName={eventToDelete?.description ?? ''}
        bullets={[
          'Todo su historial de cobros/pagos parciales registrados',
        ]}
        warningNote="Si ya habías registrado cobros o pagos contra esto, ese dinero se revierte del saldo de la cuenta donde se había movido."
        onConfirm={handleConfirmDeleteEvent}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteContactModalOpen}
        onClose={() => setIsDeleteContactModalOpen(false)}
        title="Eliminar contacto"
        itemName={contact?.nombre ?? 'este contacto'}
        bullets={['Su historial financiero (cuentas por cobrar/pagar) queda huérfano de este contacto']}
        onConfirm={handleConfirmDeleteContact}
      />
    </div>
  );
}
