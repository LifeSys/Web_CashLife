'use client';

import { CalendarPlus, Edit, MessageCircle, RefreshCw, Trash2 } from 'lucide-react';
import type { Person } from '@/types';
import type { ServiceProfileWithCurrentRental } from '@/services/reventas.service';

interface ServiceProfileRowProps {
  profile: ServiceProfileWithCurrentRental;
  client: Person | null;
  quickRenewing?: boolean;
  onQuickRenew: () => void;
  onRenew: () => void;
  onWhatsApp: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0);
const shortDate = (d: Date) => new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(d);

function getStatus(rental: ServiceProfileWithCurrentRental['currentRental']): { label: string; className: string } {
  if (!rental) return { label: 'Sin asignar', className: 'bg-muted text-muted-foreground' };
  const end = rental.endDate instanceof Date ? rental.endDate : new Date(rental.endDate);
  const diffDays = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Vencida', className: 'bg-red-500/15 text-red-500' };
  if (diffDays <= 5) return { label: `Vence en ${diffDays}d`, className: 'bg-amber-500/15 text-amber-500' };
  return { label: 'Activa', className: 'bg-emerald-500/15 text-emerald-500' };
}

export function ServiceProfileRow({ profile, client, quickRenewing, onQuickRenew, onRenew, onWhatsApp, onEdit, onDelete }: ServiceProfileRowProps) {
  const rental = profile.currentRental;
  const status = getStatus(rental);
  const start = rental ? (rental.startDate instanceof Date ? rental.startDate : new Date(rental.startDate)) : null;
  const end = rental ? (rental.endDate instanceof Date ? rental.endDate : new Date(rental.endDate)) : null;
  const canQuickRenew = !!(rental && rental.personId && rental.paid !== false && rental.accountId);

  return (
    <div className="flex flex-wrap items-center gap-2 py-2.5 border-b border-border/60 last:border-b-0">
      <div className="min-w-[140px] flex-1">
        <p className="text-sm font-semibold truncate">{profile.label}{profile.pin ? ` · PIN ${profile.pin}` : ''}</p>
        <p className="text-xs text-muted-foreground truncate">
          {client ? client.nombre : 'Sin cliente asignado'}{client?.phone ? ` · ${client.phone}` : ''}
        </p>
      </div>
      <div className="text-right flex-shrink-0 min-w-[90px]">
        <p className="text-xs">{start && end ? `${shortDate(start)} → ${shortDate(end)}` : 'Sin definir'}</p>
        {rental && <p className="text-xs font-semibold text-muted-foreground">{money(rental.price)}</p>}
      </div>
      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap flex-shrink-0 ${status.className}`}>
        {status.label}
      </span>
      {rental?.paid === false && (
        <span className="px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap flex-shrink-0 bg-amber-500/15 text-amber-500">
          Sin cobrar
        </span>
      )}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onWhatsApp}
          disabled={!client}
          title="Recordar por WhatsApp"
          className="p-2 rounded-lg hover:bg-muted text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={onQuickRenew}
          disabled={!canQuickRenew || quickRenewing}
          title={canQuickRenew ? 'Renovar 1 mes (mismo cliente, precio y cuenta)' : 'Asigna un cliente primero'}
          className="p-2 rounded-lg hover:bg-muted text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <CalendarPlus className={`w-4 h-4 ${quickRenewing ? 'animate-pulse' : ''}`} />
        </button>
        <button onClick={onRenew} title="Renovar con otras fechas / otro cliente / otro precio" className="p-2 rounded-lg hover:bg-muted text-primary">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button onClick={onEdit} title="Editar nombre/PIN del perfil" className="p-2 rounded-lg hover:bg-muted">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={onDelete} title="Eliminar perfil" className="p-2 rounded-lg hover:bg-muted text-destructive">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
