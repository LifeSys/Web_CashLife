'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { creditCardService } from '@/services/credit-card.service';
import { toast } from 'sonner';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreditCardModal({ isOpen, onClose, onSuccess }: CreditCardModalProps) {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState('');
  const [lineaCredito, setLineaCredito] = useState('');
  const [cutDay, setCutDay] = useState('15');
  const [paymentDay, setPaymentDay] = useState('25');
  const [brand, setBrand] = useState<'Visa' | 'Mastercard' | 'American Express' | 'Diners' | 'Otra'>('Visa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !nombre || !lineaCredito) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    const parsedLimit = Number(lineaCredito);
    if (parsedLimit <= 0) {
      toast.error('La línea de crédito debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await creditCardService.create(user.uid, {
        nombre,
        name: nombre,
        banco: banco || 'No especificado',
        bank: banco || 'No especificado',
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
      });
      toast.success('Tarjeta creada correctamente');
      setNombre('');
      setBanco('');
      setLineaCredito('');
      setCutDay('15');
      setPaymentDay('25');
      setBrand('Visa');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Error al crear la tarjeta');
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
            <label className="text-sm font-medium">Banco</label>
            <input
              type="text"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              placeholder="Ej: BCP, Scotiabank..."
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Marca</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2"
            >
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="American Express">American Express</option>
              <option value="Diners">Diners</option>
              <option value="Otra">Otra</option>
            </select>
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
              <label className="text-sm font-medium">Día de Corte</label>
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
              <label className="text-sm font-medium">Día de Pago</label>
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
