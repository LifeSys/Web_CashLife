'use client';

import { useState } from 'react';
import { AlarmClock, MessageCircle, RefreshCw } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useRentalReminders, type RentalReminderRow } from '@/hooks/useRentalReminders';
import { WhatsAppMessageModal } from '@/components/modals/WhatsAppMessageModal';
import { ProfileRentalModal } from '@/components/modals/ProfileRentalModal';
import { buildProfileRentalDueTodayMessage, buildProfileRentalDueTomorrowMessage } from '@/lib/whatsapp';

const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0);
const shortDate = (d: Date) => new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(d);

export function RentalRemindersPanel() {
  const { settings } = useSettings();
  const { rows, isLoading } = useRentalReminders();
  const [whatsAppTarget, setWhatsAppTarget] = useState<RentalReminderRow | null>(null);
  const [renewTarget, setRenewTarget] = useState<RentalReminderRow | null>(null);

  if (isLoading || rows.length === 0) return null;

  const rental = whatsAppTarget?.profile.currentRental;
  const initialMessage = whatsAppTarget && rental
    ? (whatsAppTarget.urgency === 'today' ? buildProfileRentalDueTodayMessage : buildProfileRentalDueTomorrowMessage)({
        contactName: whatsAppTarget.client.nombre,
        serviceName: whatsAppTarget.profile.serviceName,
        profileLabel: whatsAppTarget.profile.label,
        price: rental.price,
        paymentMethodLabel: settings?.metodoPagoLabel,
        paymentMethodValue: settings?.metodoPagoValor,
      })
    : '';

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlarmClock className="w-4 h-4 text-amber-500" />
        <p className="font-semibold text-sm">Vencen pronto — avísales antes de que se les corte</p>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const r = row.profile.currentRental!;
          const rStart = r.startDate instanceof Date ? r.startDate : new Date(r.startDate);
          const rEnd = r.endDate instanceof Date ? r.endDate : new Date(r.endDate);
          return (
            <div key={row.profile.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-card border border-border/60 px-3 py-2">
              <div className="min-w-[140px] flex-1">
                <p className="text-sm font-semibold truncate">{row.client.nombre}</p>
                <p className="text-xs text-muted-foreground truncate">{row.profile.serviceName} · {row.profile.label}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs">{shortDate(rStart)} → {shortDate(rEnd)}</p>
                <p className="text-xs font-semibold text-muted-foreground">{money(r.price)}</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                  row.urgency === 'today' ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500'
                }`}
              >
                {row.urgency === 'today' ? 'Vence hoy' : 'Vence mañana'}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setWhatsAppTarget(row)}
                  disabled={!row.client.phone}
                  title="Enviar recordatorio por WhatsApp"
                  className="p-2 rounded-lg hover:bg-muted text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRenewTarget(row)}
                  title="Ya pagó — renovar y actualizar la cuenta"
                  className="p-2 rounded-lg hover:bg-muted text-primary"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {whatsAppTarget && rental && (
        <WhatsAppMessageModal
          isOpen={!!whatsAppTarget}
          onClose={() => setWhatsAppTarget(null)}
          contactName={whatsAppTarget.client.nombre}
          phone={whatsAppTarget.client.phone}
          initialMessage={initialMessage}
        />
      )}

      <ProfileRentalModal
        isOpen={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        profile={renewTarget?.profile ?? null}
        serviceName={renewTarget?.profile.serviceName ?? ''}
      />
    </div>
  );
}
