'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useScheduledPayments } from '@/hooks/useFinancial';
import { reventasService } from '@/services/reventas.service';
import { toast } from 'sonner';
import type { SharedService } from '@/types';

interface SharedServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: SharedService | null;
  onSuccess?: () => void;
}

export function SharedServiceModal({ isOpen, onClose, service, onSuccess }: SharedServiceModalProps) {
  const { user } = useAuth();
  const { scheduledPayments } = useScheduledPayments();
  const isEditing = !!service;

  const [name, setName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [scheduledPaymentId, setScheduledPaymentId] = useState('');
  const [color, setColor] = useState('#E50914');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(service?.name ?? '');
    setLoginEmail(service?.loginEmail ?? '');
    setLoginPassword(service?.loginPassword ?? '');
    setScheduledPaymentId(service?.scheduledPaymentId ?? '');
    setColor(service?.color || '#E50914');
  }, [isOpen, service]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!name.trim()) {
      toast.error('Ponle un nombre al servicio');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        loginEmail: loginEmail.trim() || undefined,
        loginPassword: loginPassword.trim() || undefined,
        scheduledPaymentId: scheduledPaymentId || undefined,
        color,
        active: true,
      };
      if (isEditing) {
        await reventasService.updateService(user.uid, service.id, data);
        toast.success('Servicio actualizado');
      } else {
        await reventasService.createService(user.uid, data);
        toast.success('Servicio creado');
      }
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el servicio');
      console.error('[CashLife] SharedServiceModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar servicio' : 'Nuevo servicio compartido'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Netflix — cuenta principal"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="text-sm font-medium">Correo de acceso</label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 w-16 h-10 rounded-lg border border-border cursor-pointer" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Contraseña de acceso</label>
            <input
              type="text"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Pago programado que cubre el costo</label>
            <select
              value={scheduledPaymentId}
              onChange={(e) => setScheduledPaymentId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="">Sin vincular</option>
              {scheduledPayments.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — S/ {p.amount.toFixed(2)}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Así se calcula el margen: lo que ganas con los perfiles menos lo que te cuesta el servicio.
            </p>
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
