'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { accountService } from '@/services/account.service';
import { toast } from 'sonner';

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BankAccountModal({ isOpen, onClose, onSuccess }: BankAccountModalProps) {
  const { user } = useAuth();
  const { mutate } = useAccounts();
  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [moneda, setMoneda] = useState('PEN');
  const [tieneDebito, setTieneDebito] = useState(false);
  const [vinculacion, setVinculacion] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!nombre.trim() || !banco.trim() || !saldoInicial.trim()) {
      toast.error('Completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    try {
      await accountService.create(user.uid, {
        nombre: nombre.trim(),
        tipo: 'bank',
        banco: banco.trim(),
        saldo: parseFloat(saldoInicial),
        saldoInicial: parseFloat(saldoInicial),
        moneda,
        tarjetaDebito: tieneDebito,
        vinculacionDebito: tieneDebito ? vinculacion : undefined,
      });
      toast.success('Cuenta bancaria creada');
      mutate();
      setNombre('');
      setBanco('');
      setSaldoInicial('');
      setMoneda('PEN');
      setTieneDebito(false);
      setVinculacion([]);
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-card shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Crear Cuenta Bancaria</h2>
            <p className="text-sm text-muted-foreground mt-1">Configura tu nueva cuenta de banco</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la cuenta</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Mi cuenta BCP" className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Banco</label>
            <select value={banco} onChange={(e) => setBanco(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2">
              <option value="">Selecciona un banco</option>
              <option value="BCP">BCP</option>
              <option value="Interbank">Interbank</option>
              <option value="BBVA">BBVA</option>
              <option value="Scotiabank">Scotiabank</option>
              <option value="Banco de Crédito">Banco de Crédito</option>
              <option value="Otro">Otro</option>
            </select>
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

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={tieneDebito} onChange={(e) => setTieneDebito(e.target.checked)} className="rounded" />
              <span className="text-sm font-medium">¿Tiene tarjeta de débito?</span>
            </label>
          </div>

          {tieneDebito && (
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
