'use client';

import { useState } from 'react';
import { X, ShieldOff } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

interface DisableTwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DisableTwoFactorModal({ isOpen, onClose, onSuccess }: DisableTwoFactorModalProps) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Ingresa tu contraseña');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.disableTotp({ password });
      toast.success('Verificación en dos pasos desactivada');
      setPassword('');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al desactivar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldOff className="w-5 h-5 text-destructive" />
            </span>
            <h2 className="text-lg font-bold">Desactivar verificación en dos pasos</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Confirma tu contraseña para desactivarla. Tus códigos de respaldo actuales dejarán de servir.
          </p>
          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-destructive px-4 py-2 font-medium text-destructive-foreground disabled:opacity-50"
            >
              {isSubmitting ? 'Desactivando...' : 'Desactivar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
