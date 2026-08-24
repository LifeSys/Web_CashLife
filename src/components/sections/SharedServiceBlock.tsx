'use client';

import { useState } from 'react';
import { Edit, PlusCircle, Trash2, Tv } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { usePeople } from '@/hooks/usePeople';
import { useServiceProfiles } from '@/hooks/useReventas';
import { useScheduledPayments } from '@/hooks/useFinancial';
import { useSettings } from '@/hooks/useSettings';
import { reventasService, type ServiceProfileWithCurrentRental } from '@/services/reventas.service';
import { ServiceProfileRow } from './ServiceProfileRow';
import { ServiceProfileModal } from '@/components/modals/ServiceProfileModal';
import { ProfileRentalModal } from '@/components/modals/ProfileRentalModal';
import { WhatsAppMessageModal } from '@/components/modals/WhatsAppMessageModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { buildProfileRentalReminderMessage } from '@/lib/whatsapp';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';
import type { SharedService } from '@/types';

interface SharedServiceBlockProps {
  service: SharedService;
  onEdit: () => void;
  onDelete: () => void;
}

const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0);

export function SharedServiceBlock({ service, onEdit, onDelete }: SharedServiceBlockProps) {
  const { user } = useAuth();
  const { contacts } = usePeople();
  const { scheduledPayments } = useScheduledPayments();
  const { settings } = useSettings();
  const { profiles, isLoading, mutate } = useServiceProfiles(service.id);
  const { invalidateAfterRental } = useSWRInvalidation();

  const [profileToEdit, setProfileToEdit] = useState<ServiceProfileWithCurrentRental | null | 'new'>(null);
  const [profileToRenew, setProfileToRenew] = useState<ServiceProfileWithCurrentRental | null>(null);
  const [profileToWhatsApp, setProfileToWhatsApp] = useState<ServiceProfileWithCurrentRental | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<ServiceProfileWithCurrentRental | null>(null);
  const [quickRenewingId, setQuickRenewingId] = useState<string | null>(null);

  const cost = scheduledPayments.find((p) => p.id === service.scheduledPaymentId)?.amount ?? 0;
  // Solo cuenta como "ingreso" lo que ya está cobrado — los ciclos
  // marcados "sin cobrar" son cuentas por cobrar, no dinero en mano.
  const income = profiles.reduce((sum, p) => sum + (p.currentRental?.paid !== false ? p.currentRental?.price ?? 0 : 0), 0);
  const margin = income - cost;

  const handleConfirmDeleteProfile = async () => {
    if (!user?.uid || !profileToDelete) return;
    try {
      await reventasService.deleteProfile(user.uid, profileToDelete.id);
      toast.success('Perfil eliminado');
      mutate();
      invalidateAfterRental(user.uid);
      setProfileToDelete(null);
    } catch (error) {
      toast.error('Error al eliminar el perfil');
      console.error('[CashLife] SharedServiceBlock error:', error);
    }
  };

  /**
   * "Renovar 1 mes" sin abrir ningún modal: reutiliza el mismo cliente,
   * precio y cuenta del ciclo actual, y extiende 30 días desde donde
   * quedaba (o desde hoy si ya estaba vencido).
   */
  const handleQuickRenew = async (profile: ServiceProfileWithCurrentRental) => {
    const current = profile.currentRental;
    if (!user?.uid || !current?.personId || !current.accountId || current.paid === false) return;

    setQuickRenewingId(profile.id);
    try {
      const currentEnd = current.endDate instanceof Date ? current.endDate : new Date(current.endDate);
      const now = new Date();
      const start = currentEnd > now ? currentEnd : now;
      const end = new Date(start);
      end.setDate(end.getDate() + 30);

      await reventasService.createRental(user.uid, {
        profileId: profile.id,
        personId: current.personId,
        startDate: start,
        endDate: end,
        price: current.price,
        accountId: current.accountId,
        paid: true,
      });
      toast.success('Renovado por 1 mes más');
      mutate();
      invalidateAfterRental(user.uid);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al renovar');
      console.error('[CashLife] SharedServiceBlock quick renew error:', error);
    } finally {
      setQuickRenewingId(null);
    }
  };

  const whatsAppClient =
    profileToWhatsApp?.currentRental?.personId
      ? contacts.find((c) => c.id === profileToWhatsApp.currentRental!.personId) ?? null
      : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${service.color ?? '#3B82F6'}22`, color: service.color ?? '#3B82F6' }}
          >
            <Tv className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="font-bold truncate">{service.name}</p>
            <p className="text-xs text-muted-foreground">{profiles.length} perfil{profiles.length === 1 ? '' : 'es'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onEdit} title="Editar servicio" className="p-2 rounded-lg hover:bg-muted">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} title="Eliminar servicio" className="p-2 rounded-lg hover:bg-muted text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg bg-muted/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">Ingreso activo</p>
          <p className="text-sm font-bold text-emerald-500">{money(income)}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">Costo</p>
          <p className="text-sm font-bold text-red-500">{cost ? `-${money(cost)}` : '—'}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">Margen</p>
          <p className="text-sm font-bold">{cost ? money(margin) : '—'}</p>
        </div>
      </div>

      {!isLoading && profiles.length === 0 && (
        <p className="text-sm text-muted-foreground py-3">Sin perfiles aún. Agrega el primero.</p>
      )}

      {profiles.map((profile) => (
        <ServiceProfileRow
          key={profile.id}
          profile={profile}
          client={profile.currentRental?.personId ? contacts.find((c) => c.id === profile.currentRental!.personId) ?? null : null}
          quickRenewing={quickRenewingId === profile.id}
          onQuickRenew={() => handleQuickRenew(profile)}
          onRenew={() => setProfileToRenew(profile)}
          onWhatsApp={() => setProfileToWhatsApp(profile)}
          onEdit={() => setProfileToEdit(profile)}
          onDelete={() => setProfileToDelete(profile)}
        />
      ))}

      <button
        onClick={() => setProfileToEdit('new')}
        className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
      >
        <PlusCircle className="w-4 h-4" /> Nuevo perfil
      </button>

      <ServiceProfileModal
        isOpen={!!profileToEdit}
        onClose={() => setProfileToEdit(null)}
        serviceId={service.id}
        profile={profileToEdit === 'new' ? null : profileToEdit}
        onSuccess={() => mutate()}
      />

      <ProfileRentalModal
        isOpen={!!profileToRenew}
        onClose={() => setProfileToRenew(null)}
        profile={profileToRenew}
        serviceName={service.name}
        onSuccess={() => mutate()}
      />

      {profileToWhatsApp && whatsAppClient && profileToWhatsApp.currentRental && (
        <WhatsAppMessageModal
          isOpen={!!profileToWhatsApp}
          onClose={() => setProfileToWhatsApp(null)}
          contactName={whatsAppClient.nombre}
          phone={whatsAppClient.phone}
          initialMessage={buildProfileRentalReminderMessage({
            contactName: whatsAppClient.nombre,
            serviceName: service.name,
            profileLabel: profileToWhatsApp.label,
            endDate:
              profileToWhatsApp.currentRental.endDate instanceof Date
                ? profileToWhatsApp.currentRental.endDate
                : new Date(profileToWhatsApp.currentRental.endDate),
            price: profileToWhatsApp.currentRental.price,
            paymentMethodLabel: settings?.metodoPagoLabel,
            paymentMethodValue: settings?.metodoPagoValor,
            template: settings?.msgRentalReminderTemplate,
          })}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!profileToDelete}
        onClose={() => setProfileToDelete(null)}
        title="Eliminar perfil"
        itemName={profileToDelete?.label ?? 'este perfil'}
        bullets={['Todo su historial de alquiler (renovaciones anteriores)', 'El ingreso ya cobrado de este ciclo se revierte de la cuenta']}
        onConfirm={handleConfirmDeleteProfile}
      />
    </div>
  );
}
