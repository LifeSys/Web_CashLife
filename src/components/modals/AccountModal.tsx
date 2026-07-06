'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { accountService } from '@/services/account.service';
import { toast } from 'sonner';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AccountModal({ isOpen, onClose, onSuccess }: AccountModalProps) {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [saldo, setSaldo] = useState('');
  const [tipo, setTipo] = useState<'cash' | 'bank' | 'safe_box' | 'credit_card'>('bank');
  const [banco, setBanco] = useState('');
  const [subtipo, setSubtipo] = useState<'savings' | 'checking'>('checking');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !nombre) {
      toast.error('Por favor ingresa el nombre de la cuenta');
      return;
    }

    const parsedBalance = Number(saldo || '0');
    if (parsedBalance < 0) {
      toast.error('El saldo no puede ser negativo');
      return;
    }

    setIsSubmitting(true);
    try {
      await accountService.create(user.uid, {
        nombre,
        saldo: parsedBalance,
        balance: parsedBalance,
        tipo,
        banco,
        subtipo,
        active: true,
      });
      toast.success('Cuenta creada correctamente');
      setNombre('');
      setSaldo('');
      setTipo('bank');
      setBanco('');
      setSubtipo('checking');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Error al crear la cuenta');
      console.error('[v0] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Nueva Cuenta</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre de la Cuenta *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Mi Cuenta BCP"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tipo de Cuenta *</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="cash">Efectivo</option>
              <option value="bank">Banco</option>
              <option value="safe_box">Caja Fuerte</option>
              <option value="credit_card">Tarjeta de Crédito</option>
            </select>
          </div>

          {tipo === 'bank' && (
            <>
              <div>
                <label className="text-sm font-medium">Banco</label>
                <input
                  type="text"
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  placeholder="Ej: BCP, Interbank..."
                  className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de Cuenta</label>
                <select
                  value={subtipo}
                  onChange={(e) => setSubtipo(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
                >
                  <option value="checking">Corriente</option>
                  <option value="savings">Ahorros</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium">Saldo Inicial</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={saldo}
              onChange={(e) => setSaldo(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
