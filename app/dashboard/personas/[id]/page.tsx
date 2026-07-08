'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { usePeople } from '@/hooks/usePeople';
import { usePayableObligations, useReceivableDebts } from '@/hooks/useFinancial';
import { personService, PersonFinancialSummary } from '@/services/person.service';
import { ContactPersonalInfo } from '@/components/design-system/ContactPersonalInfo';
import { ContactFinancialSummary } from '@/components/design-system/ContactFinancialSummary';
import { ContactHistoryTimeline } from '@/components/design-system/ContactHistoryTimeline';
import { ContactActionButtons } from '@/components/design-system/ContactActionButtons';
import { ReceivablePaymentContextModal } from '@/components/modals/ReceivablePaymentContextModal';
import { PayableObligationContextModal } from '@/components/modals/PayableObligationContextModal';
import { PersonEditModal } from '@/components/modals/PersonEditModal';
import { toast } from 'sonner';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { contacts, mutate: mutatePeople } = usePeople();
  const { debts, mutate: mutateDebts } = useReceivableDebts();
  const { obligations, mutate: mutateObligations } = usePayableObligations();
  
  const [financialSummary, setFinancialSummary] = useState<PersonFinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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

    const phoneNumber = contact.phone.replace(/\D/g, '');
    const pendingDebt = financialSummary?.meDebe || 0;
    
    let message = `Hola ${contact.nombre},`;
    if (pendingDebt > 0) {
      message += ` tenemos registrado que me debes ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(pendingDebt)}. ¿Puedes agendar un pago?`;
    } else {
      message += ` quería confirmar los detalles de nuestras operaciones pendientes.`;
    }

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este contacto? Esta acción no se puede deshacer.')) return;
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

  const handleAddCollection = () => {
    setIsCollectionModalOpen(true);
  };

  const handleAddPayment = () => {
    setIsPaymentModalOpen(true);
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
          <ReceivablePaymentContextModal
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
        </>
      )}
    </div>
  );
}
