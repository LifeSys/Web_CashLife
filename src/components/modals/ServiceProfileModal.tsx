'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { reventasService } from '@/services/reventas.service';
import { toast } from 'sonner';
import type { ServiceProfile } from '@/types';

interface ServiceProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  profile?: ServiceProfile | null;
  onSuccess?: () => void;
}

export function ServiceProfileModal({ isOpen, onClose, serviceId, profile, onSuccess }: ServiceProfileModalProps) {
  const { user } = useAuth();
  const isEditing = !!profile;

  const [label, setLabel] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLabel(profile?.label ?? '');
    setPin(profile?.pin ?? '');
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!label.trim()) {
      toast.error('Ponle un nombre al perfil, ej. Perfil 1');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await reventasService.updateProfile(user.uid, profile.id, { label: label.trim(), pin: pin.trim() || undefined });
        toast.success('Perfil actualizado');
      } else {
        await reventasService.createProfile(user.uid, { serviceId, label: label.trim(), pin: pin.trim() || undefined });
        toast.success('Perfil creado');
      }
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el perfil');
      console.error('[CashLife] ServiceProfileModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar perfil' : 'Nuevo perfil'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre del perfil *</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Perfil 1"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">PIN</label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="1234"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
