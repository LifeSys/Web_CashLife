'use client';

import { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

interface WhatsAppMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  phone?: string;
  initialMessage: string;
  /** Se llama justo antes de abrir WhatsApp (para registrar "último recordatorio enviado"). */
  onSend?: () => void;
}

export function WhatsAppMessageModal({ isOpen, onClose, contactName, phone, initialMessage, onSend }: WhatsAppMessageModalProps) {
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (isOpen) setMessage(initialMessage);
  }, [isOpen, initialMessage]);

  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    if (!phone) return;
    onSend?.();
    window.open(buildWhatsAppUrl(phone, message), '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Mensaje para {contactName}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!phone ? (
          <p className="text-sm text-muted-foreground">
            {contactName} no tiene un teléfono registrado. Agrégalo editando el contacto para poder escribirle por WhatsApp.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Ajusta el mensaje si quieres — se abrirá WhatsApp con este texto ya escrito, pero tú decides si lo mandas.
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2 pt-4">
              <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Abrir WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
