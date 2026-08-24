'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { accountService } from '@/services/account.service';
import { toast } from 'sonner';
import type { Account } from '@/types';

const BANK_SUGGESTIONS = ['BCP', 'Interbank', 'BBVA', 'Scotiabank', 'Banco de la Nación', 'Banco Falabella', 'Banco Pichincha'];
const ACCOUNT_COLOR_PRESETS = ['#2563EB', '#059669', '#7C3AED', '#DC2626', '#D97706', '#0891B2', '#DB2777', '#4B5563'];

interface AccountEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSuccess?: () => void;
}

export function AccountEditModal({ isOpen, onClose, account, onSuccess }: AccountEditModalProps) {
  const { user } = useAuth();
  const { mutate } = useAccounts();
  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState('');
  const [moneda, setMoneda] = useState('PEN');
  const [tieneDebito, setTieneDebito] = useState(false);
  const [hasYape, setHasYape] = useState(false);
  const [hasPlin, setHasPlin] = useState(false);
  const [color, setColor] = useState(ACCOUNT_COLOR_PRESETS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBank = account?.tipo === 'bank';

  useEffect(() => {
    if (isOpen && account) {
      setNombre(account.nombre ?? '');
      setBanco(account.banco ?? '');
      setMoneda(account.moneda || account.currency || 'PEN');
      setTieneDebito(!!account.hasDebitCard);
      setHasYape(!!account.hasYape);
      setHasPlin(!!account.hasPlin);
      setColor(account.color || ACCOUNT_COLOR_PRESETS[0]);
    }
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !nombre.trim()) {
      toast.error('El nombre de la cuenta es requerido');
      return;
    }

    setIsSubmitting(true);
    try {
      await accountService.update(user.uid, account.id, {
        nombre: nombre.trim(),
        banco: isBank ? banco.trim() : undefined,
        moneda,
        hasDebitCard: isBank ? tieneDebito : undefined,
        hasYape: isBank ? hasYape : undefined,
        hasPlin: isBank ? hasPlin : undefined,
        color,
      });
      toast.success('Cuenta actualizada');
      mutate();
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la cuenta');
      console.error('[CashLife] AccountEditModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Editar Cuenta</h2>
            <p className="text-sm text-muted-foreground mt-1">{account.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la cuenta</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          {isBank && (
            <div>
              <label className="block text-sm font-medium mb-2">Banco</label>
              <input
                type="text"
                list="account-edit-modal-bancos"
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                placeholder="BCP, Interbank, SIP..."
                className="w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
              <datalist id="account-edit-modal-bancos">
                {BANK_SUGGESTIONS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Color de la tarjeta</label>
            <div className="flex items-center gap-2 flex-wrap">
              {ACCOUNT_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  title={c}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border border-border"
                title="Color personalizado"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Moneda</label>
            <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2">
              <option value="PEN">Soles (PEN)</option>
              <option value="USD">Dólares (USD)</option>
              <option value="EUR">Euros (EUR)</option>
            </select>
          </div>

          {isBank && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={tieneDebito} onChange={(e) => setTieneDebito(e.target.checked)} className="rounded" />
                <span className="text-sm font-medium">¿Tiene tarjeta de débito?</span>
              </label>
            </div>
          )}

          {isBank && tieneDebito && (
            <div>
              <label className="block text-sm font-medium mb-2">¿Vinculada con?</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={hasYape} onChange={(e) => setHasYape(e.target.checked)} className="rounded" />
                  <span className="text-sm">Yape</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={hasPlin} onChange={(e) => setHasPlin(e.target.checked)} className="rounded" />
                  <span className="text-sm">Plin</span>
                </label>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">El saldo no se edita aquí — se mueve solo con tus movimientos.</p>

          <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
