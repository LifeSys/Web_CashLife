'use client';

import { useState } from 'react';
import { PlusCircle, Share2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSharedServices } from '@/hooks/useReventas';
import { reventasService } from '@/services/reventas.service';
import { SharedServiceBlock } from '@/components/sections/SharedServiceBlock';
import { RentalRemindersPanel } from '@/components/sections/RentalRemindersPanel';
import { SharedServiceModal } from '@/components/modals/SharedServiceModal';
import { EmptyState } from '@/components/design-system/feedback/EmptyState';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';
import type { SharedService } from '@/types';

export default function ReventasPage() {
  const { user } = useAuth();
  const { services, isLoading, mutate } = useSharedServices();
  const { invalidateAfterRental } = useSWRInvalidation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<SharedService | null>(null);

  const handleDeleteService = async (service: SharedService) => {
    if (!user?.uid) return;
    if (!confirm(`¿Eliminar "${service.name}"? Se borran también sus perfiles y su historial de alquiler.`)) return;
    try {
      await reventasService.deleteService(user.uid, service.id);
      toast.success('Servicio eliminado');
      mutate();
      invalidateAfterRental(user.uid);
    } catch (error) {
      toast.error('Error al eliminar el servicio');
      console.error('[CashLife] ReventasPage error:', error);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reventas</h1>
          <p className="text-muted-foreground mt-1">
            Cuentas compartidas que alquilas por perfiles — Netflix, Disney+, etc. Cada cliente con su propio ciclo y precio.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex-shrink-0 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo servicio</span>
        </button>
      </div>

      <RentalRemindersPanel />

      {!isLoading && services.length === 0 && (
        <EmptyState
          icon={<Share2 className="w-full h-full" />}
          title="Sin servicios aún"
          description="Registra la cuenta que compartes (ej. Netflix) y arma sus perfiles para empezar a asignarlos a tus clientes."
          action={{ label: 'Crear el primero', onClick: () => setShowCreateModal(true) }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => (
          <SharedServiceBlock
            key={service.id}
            service={service}
            onEdit={() => setServiceToEdit(service)}
            onDelete={() => handleDeleteService(service)}
          />
        ))}
      </div>

      <SharedServiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => mutate()}
      />

      <SharedServiceModal
        isOpen={!!serviceToEdit}
        service={serviceToEdit}
        onClose={() => setServiceToEdit(null)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
