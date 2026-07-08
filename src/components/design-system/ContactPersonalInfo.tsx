'use client';

import { Person } from '@/types';
import { Mail, Phone, Building2, FileText, Edit2, Trash2, MessageCircle, PhoneCall } from 'lucide-react';

interface ContactPersonalInfoProps {
  contact: Person;
  onEdit?: () => void;
  onDelete?: () => void;
  onWhatsApp?: () => void;
  onCall?: () => void;
}

const CONTACT_TYPE_LABELS = {
  PRESTAMISTA: 'Prestamista',
  DEUDOR: 'Deudor',
  PERSON: 'Persona',
  EMPRESA: 'Empresa',
  BANCO: 'Banco',
  PROVEEDOR: 'Proveedor',
} as const;

const CONTACT_TYPE_COLORS = {
  PRESTAMISTA: 'bg-green-500/10 text-green-300 border-green-500/30',
  DEUDOR: 'bg-red-500/10 text-red-300 border-red-500/30',
  PERSON: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  EMPRESA: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  BANCO: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
  PROVEEDOR: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
} as const;

export function ContactPersonalInfo({
  contact,
  onEdit,
  onDelete,
  onWhatsApp,
  onCall,
}: ContactPersonalInfoProps) {
  const contactType = (contact.tipo || 'PERSON') as keyof typeof CONTACT_TYPE_LABELS;
  const typeLabel = CONTACT_TYPE_LABELS[contactType] || contact.tipo;
  const typeColor = CONTACT_TYPE_COLORS[contactType] || CONTACT_TYPE_COLORS.PERSON;

  return (
    <div className="space-y-6">
      {/* Header with name and type badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold">{contact.nombre}</h1>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium ${typeColor}`}
            >
              {contact.tipo === 'PRESTAMISTA' && '💰'}
              {contact.tipo === 'DEUDOR' && '💳'}
              {contact.tipo === 'PERSON' && '👤'}
              {contact.tipo === 'EMPRESA' && '🏢'}
              {contact.tipo === 'BANCO' && '🏦'}
              {contact.tipo === 'PROVEEDOR' && '📦'}
              {typeLabel}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 md:flex-row">
          {onWhatsApp && (
            <button
              onClick={onWhatsApp}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/30"
              title="Contactar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Chat</span>
            </button>
          )}
          {onCall && contact.telefono && (
            <button
              onClick={onCall}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/30"
              title="Llamar"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Llamar</span>
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/30"
              title="Editar contacto"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Editar</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/30"
              title="Eliminar contacto"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Eliminar</span>
            </button>
          )}
        </div>
      </div>

      {/* Contact Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teléfono */}
        {contact.telefono && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Teléfono</p>
              <p className="text-base font-medium truncate">{contact.telefono}</p>
            </div>
          </div>
        )}

        {/* Email */}
        {contact.email && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="text-base font-medium truncate">{contact.email}</p>
            </div>
          </div>
        )}

        {/* Empresa */}
        {contact.empresa && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Empresa</p>
              <p className="text-base font-medium truncate">{contact.empresa}</p>
            </div>
          </div>
        )}

        {/* Notas */}
        {contact.notas && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border md:col-span-2">
            <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notas</p>
              <p className="text-sm line-clamp-3">{contact.notas}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
