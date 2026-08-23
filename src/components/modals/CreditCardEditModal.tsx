'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { creditCardService } from '@/services/credit-card.service';
import { toast } from 'sonner';
import type { CreditCard } from '@/types';

interface CreditCardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard | null;
  onSuccess?: () => void;
}

const CARD_BRANDS = ['Visa', 'Mastercard', 'American Express', 'Diners', 'Discover', 'Other'] as const;
const CURRENCIES = ['PEN', 'USD', 'EUR'] as const;
const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0);

export function CreditCardEditModal({ isOpen, onClose, card, onSuccess }: CreditCardEditModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const { mutate } = useCreditCards();

  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState('');
  const [marca, setMarca] = useState<typeof CARD_BRANDS[number]>('Visa');
  const [lineaCredito, setLineaCredito] = useState('');
  const [currency, setCurrency] = useState<typeof CURRENCIES[number]>('PEN');
  const [lastDigits, setLastDigits] = useState('');
  const [cardColor, setCardColor] = useState('#3B82F6');
  const [cutOffDay, setCutOffDay] = useState('15');
  const [duePaymentDay, setDuePaymentDay] = useState('10');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [montoUtilizado, setMontoUtilizado] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
      setNombre(card.nombre ?? '');
      setBanco(card.banco ?? '');
      setMarca((card.marca as typeof CARD_BRANDS[number]) || 'Visa');
      setLineaCredito(String(card.lineaCredito ?? ''));
      setCurrency((card.currency as typeof CURRENCIES[number]) || 'PEN');
      setLastDigits(card.lastDigits ?? '');
      setCardColor(card.cardColor || '#3B82F6');
      setCutOffDay(String(card.cutOffDay ?? '15'));
      setDuePaymentDay(String(card.duePaymentDay ?? '10'));
      setMinimumPayment(String(card.minimumPayment ?? ''));
      setInterestRate(card.tasaInteres || card.interestRate ? String(card.tasaInteres ?? card.interestRate) : '');
      setLinkedAccountId(card.linkedAccountId ?? '');
      setNotes(card.notes ?? '');
      setMontoUtilizado(String(card.montoUtilizado ?? 0));
      setAdjustReason('');
    }
  }, [isOpen, card]);

  if (!isOpen || !card) return null;

  const originalUsed = card.montoUtilizado ?? 0;
  const parsedUsed = Number(montoUtilizado) || 0;
  const usageDelta = parsedUsed - originalUsed;
  const usageChanged = Math.abs(usageDelta) >= 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!nombre.trim() || !banco.trim() || !lineaCredito || !cutOffDay || !duePaymentDay || !linkedAccountId || !lastDigits.trim() || !minimumPayment) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    if (usageChanged && !adjustReason.trim()) {
      toast.error('Cuéntame en una línea por qué cambia el monto utilizado');
      return;
    }

    setIsSubmitting(true);
    try {
      await creditCardService.update(user.uid, card.id, {
        nombre: nombre.trim(),
        banco: banco.trim(),
        marca,
        lineaCredito: parseFloat(lineaCredito),
        currency,
        lastDigits: lastDigits.trim().slice(-4),
        cardColor,
        cutOffDay: parseInt(cutOffDay),
        duePaymentDay: parseInt(duePaymentDay),
        minimumPayment: parseFloat(minimumPayment),
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        tasaInteres: interestRate ? parseFloat(interestRate) : undefined,
        linkedAccountId,
        notes: notes.trim() || undefined,
      });
      if (usageChanged) {
        await creditCardService.adjustUsage(user.uid, card.id, parsedUsed, adjustReason.trim());
      }
      toast.success('Tarjeta actualizada');
      mutate();
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la tarjeta');
      console.error('[CashLife] CreditCardEditModal error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-card shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Editar Tarjeta</h2>
            <p className="text-sm text-muted-foreground mt-1">{card.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Marca *</label>
              <select value={marca} onChange={(e) => setMarca(e.target.value as typeof marca)} className="w-full rounded-lg border border-border bg-muted px-3 py-2">
                {CARD_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Banco *</label>
            <input type="text" value={banco} onChange={(e) => setBanco(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Línea de crédito *</label>
              <input type="number" step="0.01" value={lineaCredito} onChange={(e) => setLineaCredito(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Moneda *</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} className="w-full rounded-lg border border-border bg-muted px-3 py-2">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Día de corte *</label>
              <input type="number" min="1" max="31" value={cutOffDay} onChange={(e) => setCutOffDay(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Día de pago *</label>
              <input type="number" min="1" max="31" value={duePaymentDay} onChange={(e) => setDuePaymentDay(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Pago mínimo *</label>
              <input type="number" step="0.01" value={minimumPayment} onChange={(e) => setMinimumPayment(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tasa de interés</label>
              <input type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Últimos 4 dígitos *</label>
              <input type="text" maxLength={4} value={lastDigits} onChange={(e) => setLastDigits(e.target.value.replace(/\D/g, ''))} className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="w-16 h-10 rounded-lg border border-border cursor-pointer" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cuenta para pagos *</label>
            <select value={linkedAccountId} onChange={(e) => setLinkedAccountId(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2">
              <option value="">Selecciona una cuenta</option>
              {cuentas.filter((c) => c.tipo !== 'credit_card').map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-muted px-3 py-2 resize-none" />
          </div>

          <div className="border-t border-border pt-4">
            <label className="block text-sm font-medium mb-2">Monto utilizado</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={montoUtilizado}
              onChange={(e) => setMontoUtilizado(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Corrígelo si no cuadra con tu banco. No se descuenta de ninguna cuenta — se guarda como un ajuste aparte en Movimientos.
            </p>
            {usageChanged && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-2">Motivo del ajuste *</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ej: interés que cobró el banco, cargo que faltaba, error al registrar..."
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2"
                />
                <p className={`text-xs mt-1 ${usageDelta > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {usageDelta > 0 ? `Vas a sumar ${money(usageDelta)} al monto usado` : `Vas a restar ${money(Math.abs(usageDelta))} al monto usado`}
                </p>
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
