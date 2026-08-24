'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { accountService } from '@/services/account.service';
import { toast } from 'sonner';
import type { AccountType } from '@/types';

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ACCOUNT_TYPES: { value: AccountType; label: string; hint: string }[] = [
  { value: 'bank', label: 'Cuenta bancaria', hint: 'BCP, Interbank, BBVA, Yape, Plin...' },
  { value: 'cash', label: 'Efectivo', hint: 'Otro fondo en efectivo aparte de "Efectivo"' },
  { value: 'safe_box', label: 'Caja fuerte', hint: 'Dinero guardado, no en un banco' },
];

const BANK_SUGGESTIONS = ['BCP', 'Interbank', 'BBVA', 'Scotiabank', 'Banco de la Nación', 'Banco Falabella', 'Banco Pichincha'];

const ACCOUNT_COLOR_PRESETS = ['#2563EB', '#059669', '#7C3AED', '#DC2626', '#D97706', '#0891B2', '#DB2777', '#4B5563'];

export function BankAccountModal({ isOpen, onClose, onSuccess }: BankAccountModalProps) {
  const { user } = useAuth();
  const { mutate } = useAccounts();
  const [tipo, setTipo] = useState<AccountType>('bank');
  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [moneda, setMoneda] = useState('PEN');
  const [tieneDebito, setTieneDebito] = useState(false);
  const [vinculacion, setVinculacion] = useState<string[]>([]);
  const [color, setColor] = useState(ACCOUNT_COLOR_PRESETS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isBank = tipo === 'bank';

  const resetForm = () => {
    setTipo('bank');
    setNombre('');
    setBanco('');
    setSaldoInicial('');
    setMoneda('PEN');
    setTieneDebito(false);
    setVinculacion([]);
    setColor(ACCOUNT_COLOR_PRESETS[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    // Validate required fields
    if (!nombre.trim()) {
      toast.error('El nombre de la cuenta es requerido');
      return;
    }
    if (isBank && !banco.trim()) {
      toast.error('El banco es requerido');
      return;
    }
    if (!saldoInicial.trim()) {
      toast.error('El saldo inicial es requerido');
      return;
    }

    const saldo = parseFloat(saldoInicial);
    if (isNaN(saldo) || saldo < 0) {
      toast.error('El saldo inicial debe ser un número válido mayor o igual a 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await accountService.create(user.uid, {
        nombre: nombre.trim(),
        tipo,
        banco: isBank ? banco.trim() : undefined,
        saldo,
        moneda,
        hasDebitCard: isBank ? tieneDebito : undefined,
        hasYape: isBank ? vinculacion.includes('yape') : undefined,
        hasPlin: isBank ? vinculacion.includes('plin') : undefined,
        color,
      });
      toast.success('Cuenta creada exitosamente');
      mutate();
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear cuenta';
      toast.error(message);
      console.error('[v0] BankAccountModal Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-card shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Crear Cuenta</h2>
            <p className="text-sm text-muted-foreground mt-1">Configura tu nueva cuenta</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de cuenta</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTipo(option.value)}
                  className={`text-left rounded-lg border px-3 py-2 transition-all ${
                    tipo === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted hover:border-primary/40'
                  }`}
                >
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la cuenta</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={isBank ? 'Mi cuenta BCP' : tipo === 'safe_box' ? 'Caja fuerte casa' : 'Efectivo dólares'}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          {isBank && (
            <div>
              <label className="block text-sm font-medium mb-2">Banco</label>
              <input
                type="text"
                list="bank-account-modal-bancos"
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                placeholder="BCP, Interbank, SIP..."
                className="w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
              <datalist id="bank-account-modal-bancos">
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
            <label className="block text-sm font-medium mb-2">Saldo Inicial</label>
            <input type="number" value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)} placeholder="0.00" step="0.01" className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
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
                  <input type="checkbox" checked={vinculacion.includes('yape')} onChange={(e) => setVinculacion(e.target.checked ? [...vinculacion, 'yape'] : vinculacion.filter(v => v !== 'yape'))} className="rounded" />
                  <span className="text-sm">Yape</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={vinculacion.includes('plin')} onChange={(e) => setVinculacion(e.target.checked ? [...vinculacion, 'plin'] : vinculacion.filter(v => v !== 'plin'))} className="rounded" />
                  <span className="text-sm">Plin</span>
                </label>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
            {isSubmitting ? 'Creando...' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
