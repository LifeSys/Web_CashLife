'use client';

import { useState } from 'react';
import { X, Fingerprint } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

interface AddPasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddPasskeyModal({ isOpen, onClose, onSuccess }: AddPasskeyModalProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const options = await authService.startPasskeyRegistration();
      const response = await startRegistration({ optionsJSON: options });
      await authService.finishPasskeyRegistration(response, name.trim() || undefined);
      toast.success('Llave de acceso agregada');
      setName('');
      onClose();
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al agregar la llave de acceso';
      // Cancelar el prompt del navegador no es realmente un error del sistema.
      if (!message.toLowerCase().includes('cancel') && !message.toLowerCase().includes('user')) {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-primary" />
            </span>
            <h2 className="text-lg font-bold">Nueva llave de acceso</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Al confirmar, tu navegador te va a pedir tu huella, Face ID o PIN del dispositivo — con eso queda guardada.
          </p>
          <div>
            <label className="text-sm font-medium">Nombre (opcional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mi celular"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
              {isSubmitting ? 'Esperando...' : 'Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
