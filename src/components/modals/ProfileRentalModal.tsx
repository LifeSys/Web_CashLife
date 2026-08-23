'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { usePeople } from '@/hooks/usePeople';
import { useAccounts } from '@/hooks/useAccounts';
import { reventasService, type ServiceProfileWithCurrentRental } from '@/services/reventas.service';
import { parseLocalDate, formatDateInput } from '@/lib/date';
import { useSWRInvalidation } from '@/lib/swr/swr-config';
import { toast } from 'sonner';

interface ProfileRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ServiceProfileWithCurrentRental | null;
  serviceName: string;
  onSuccess?: () => void;
}

const DURATIONS = [
  { label: '1 semana', days: 7 },
  { label: '1 mes', days: 30 },
  { label: '3 meses', days: 90 },
];

export function ProfileRentalModal({ isOpen, onClose, profile, serviceName, onSuccess }: ProfileRentalModalProps) {
  const { user } = useAuth();
  const { contacts } = usePeople();
  const { cuentas } = useAccounts();
  const { invalidateAfterRental } = useSWRInvalidation();

  const [personId, setPersonId] = useState('');
  const [startDate, setStartDate] = useState(formatDateInput(new Date()));
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paid, setPaid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !profile) return;
    const today = formatDateInput(new Date());
    setPersonId(profile.currentRental?.personId ?? '');
    setStartDate(today);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setEndDate(formatDateInput(d));
    setPrice(profile.currentRental ? String(profile.currentRental.price) : '');
    setAccountId('');
    setPaid(true);
  }, [isOpen, profile]);

  if (!isOpen || !profile) return null;

  const accountOptions = cuentas.filter((c) => c.tipo !== 'credit_card');

  const applyDuration = (days: number) => {
    const start = parseLocalDate(startDate);
    const d = new Date(start);
    d.setDate(d.getDate() + days);
    setEndDate(formatDateInput(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    if (!personId) {
      toast.error('Elige el cliente que va a usar este perfil');
      return;
    }
    if (!endDate) {
      toast.error('Elige hasta cuándo dura el ciclo');
      return;
    }
    const parsedPrice = Number(price);
    if (!parsedPrice || parsedPrice <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }
    if (paid && !accountId) {
      toast.error('¿En qué cuenta te pagó el cliente?');
      return;
    }

    setIsSubmitting(true);
    try {
      await reventasService.createRental(user.uid, {
        profileId: profile.id,
        personId,
        startDate: parseLocalDate(startDate),
        endDate: parseLocalDate(endDate),
        price: parsedPrice,
        accountId: paid ? accountId : undefined,
        paid,
      });
      toast.success(paid ? 'Perfil asignado' : 'Perfil asignado — queda como pendiente de cobro');
      invalidateAfterRental(user.uid);
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrar el alquiler');
      console.error('[CashLife] ProfileRentalModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Renovar / asignar</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{serviceName} · {profile.label}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Cliente *</label>
            <select value={personId} onChange={(e) => setPersonId(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2">
              <option value="">Selecciona un contacto</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">¿No está en la lista? Créalo primero en Contactos.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Desde *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hasta *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.days}
                type="button"
                onClick={() => applyDuration(d.days)}
                className="flex-1 rounded-lg border border-border px-2 py-1.5 text-xs font-medium hover:bg-muted"
              >
                {d.label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium">Precio *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div className="border-t border-border pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium">¿Ya te pagó este ciclo?</span>
            </label>

            {paid ? (
              <div className="mt-3">
                <label className="text-sm font-medium">Cuenta que recibe *</label>
                <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2">
                  <option value="">Elige una cuenta</option>
                  {accountOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-2">Esto registra el ingreso ya mismo en esa cuenta.</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">
                No se registra ningún ingreso todavía — se crea una cuenta por cobrar a este cliente, para que aparezca en Por Cobrar hasta que te pague.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
              {isSubmitting ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
