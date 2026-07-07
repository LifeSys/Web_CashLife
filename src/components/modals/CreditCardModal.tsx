'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAccounts } from '@/hooks/useAccounts';
import { creditCardService } from '@/services/credit-card.service';
import { toast } from 'sonner';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreditCardModal({ isOpen, onClose, onSuccess }: CreditCardModalProps) {
  const { user } = useAuth();
  const { cuentas } = useAccounts();
  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState('');
  const [lineaCredito, setLineaCredito] = useState('');
  const [cutDay, setCutDay] = useState('15');
  const [paymentDay, setPaymentDay] = useState('25');
  const [ultimos4, setUltimos4] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [paymentAccount, setPaymentAccount] = useState('');
  const [brand, setBrand] = useState<'Visa' | 'Mastercard' | 'American Express' | 'Diners' | 'Otra'>('Visa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const missingFields = [];
    if (!banco.trim()) missingFields.push('Banco');
    if (!nombre.trim()) missingFields.push('Nombre');
    if (!lineaCredito) missingFields.push('Línea de crédito');
    if (!cutDay) missingFields.push('Fecha de corte');
    if (!paymentDay) missingFields.push('Fecha de pago');
    if (!ultimos4.trim()) missingFields.push('Últimos 4 dígitos');
    if (!paymentAccount) missingFields.push('Cuenta de pago');

    if (missingFields.length > 0) {
      toast.error(`Completa estos campos: ${missingFields.join(', ')}`);
      return;
    }

    const parsedLimit = Number(lineaCredito);
    if (parsedLimit <= 0) {
      toast.error('La línea de crédito debe ser mayor a 0');
      return;
    }

    if (!/^\d{4}$/.test(ultimos4.trim())) {
      toast.error('Los últimos 4 dígitos deben ser 4 números');
      return;
    }

    setIsSubmitting(true);
    try {
      await creditCardService.create(user.uid, {
        nombre: nombre.trim(),
        name: nombre.trim(),
        banco: banco.trim(),
        bank: banco.trim(),
        brand,
        lineaCredito: parsedLimit,
        creditLimit: parsedLimit,
        montoUtilizado: 0,
        usedAmount: 0,
        availableAmount: parsedLimit,
        cutDay: Number(cutDay),
        paymentDay: Number(paymentDay),
        fechaCorte: cutDay,
        fechaMaximaPago: paymentDay,
        pagoMinimo: 0,
        minimumPayment: 0,
        color,
        lastDigits: ultimos4.trim(),
        linkedAccountId: paymentAccount,
      });
      toast.success('Tarjeta creada correctamente');
      setNombre('');
      setBanco('');
      setLineaCredito('');
      setCutDay('15');
      setPaymentDay('25');
      setUltimos4('');
      setColor('#6366F1');
      setPaymentAccount('');
      setBrand('Visa');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la tarjeta');
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
          <h2 className="text-xl font-bold">Nueva Tarjeta</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Banco *</label>
            <input
              type="text"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              placeholder="Ej: BCP, Scotiabank..."
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Nombre de la Tarjeta *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Visa Oro"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Línea de Crédito *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={lineaCredito}
              onChange={(e) => setLineaCredito(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Día de Corte *</label>
              <input
                type="number"
                min="1"
                max="31"
                value={cutDay}
                onChange={(e) => setCutDay(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Día de Pago *</label>
              <input
                type="number"
                min="1"
                max="31"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Últimos 4 Dígitos *</label>
            <input
              type="text"
              maxLength={4}
              value={ultimos4}
              onChange={(e) => setUltimos4(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 w-full h-10 rounded-lg border border-border cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Cuenta para Pago *</label>
            <select
              value={paymentAccount}
              onChange={(e) => setPaymentAccount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="">Selecciona una cuenta</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre} ({cuenta.saldo ?? cuenta.balance ?? 0})
                </option>
              ))}
            </select>
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
              {isSubmitting ? 'Creando...' : 'Crear Tarjeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
