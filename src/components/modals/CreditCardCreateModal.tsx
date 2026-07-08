'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useAccounts } from '@/hooks/useAccounts';
import { creditCardService } from '@/services/credit-card.service';
import { toast } from 'sonner';

interface CreditCardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CARD_BRANDS = ['Visa', 'Mastercard', 'American Express', 'Diners', 'Discover', 'Other'] as const;
const CURRENCIES = ['PEN', 'USD', 'EUR'] as const;

export function CreditCardCreateModal({ isOpen, onClose, onSuccess }: CreditCardCreateModalProps) {
  const { user } = useAuth();
  const { mutate: mutateCreditCards } = useCreditCards();
  const { cuentas } = useAccounts();
  
  const [step, setStep] = useState(1); // 1-6 for form sections

  // Form state
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!nombre.trim() || !banco.trim() || !lineaCredito.trim() || !cutOffDay || !duePaymentDay || !linkedAccountId || !lastDigits.trim() || !minimumPayment.trim()) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      await creditCardService.create(user.uid, {
        nombre: nombre.trim(),
        banco: banco.trim(),
        marca: marca as typeof CARD_BRANDS[number],
        lineaCredito: parseFloat(lineaCredito),
        currency: currency as typeof CURRENCIES[number],
        lastDigits: lastDigits.trim().slice(-4),
        cardColor,
        cutOffDay: parseInt(cutOffDay),
        duePaymentDay: parseInt(duePaymentDay),
        minimumPayment: parseFloat(minimumPayment),
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        linkedAccountId,
        notes: notes.trim() || undefined,
        montoUtilizado: 0,
        tasaInteres: interestRate ? parseFloat(interestRate) : undefined,
      });
      toast.success('Tarjeta creada exitosamente');
      mutateCreditCards();
      // Reset form
      setNombre('');
      setBanco('');
      setMarca('Visa');
      setLineaCredito('');
      setCurrency('PEN');
      setLastDigits('');
      setCardColor('#3B82F6');
      setCutOffDay('15');
      setDuePaymentDay('10');
      setMinimumPayment('');
      setInterestRate('');
      setLinkedAccountId('');
      setNotes('');
      setStep(1);
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear tarjeta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const banks = ['BCP', 'Interbank', 'BBVA', 'Scotiabank', 'Inbursa', 'Banco Falabella', 'Banco Azteca', 'Banco de Crédito', 'Otro'];

  const nextStep = () => {
    if (step === 1 && (!nombre.trim() || !banco.trim())) {
      toast.error('Completa el nombre y banco');
      return;
    }
    if (step === 2 && (!lineaCredito || !minimumPayment)) {
      toast.error('Completa la línea de crédito y pago mínimo');
      return;
    }
    if (step === 3 && (!cutOffDay || !duePaymentDay)) {
      toast.error('Completa los días de corte y pago');
      return;
    }
    if (step === 4 && (!lastDigits.trim() || !cardColor.trim())) {
      toast.error('Completa los dígitos y color');
      return;
    }
    if (step === 5 && !linkedAccountId) {
      toast.error('Selecciona una cuenta de pago');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(Math.max(1, step - 1));

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Nueva Tarjeta de Crédito</h2>
            <p className="text-sm text-muted-foreground mt-1">Paso {step} de 6</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información básica</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Nombre de la tarjeta *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Mi Visa Platino"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Banco *</label>
                <select
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona un banco</option>
                  {banks.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Marca *</label>
                <select
                  value={marca}
                  onChange={(e) => setMarca(e.target.value as typeof marca)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CARD_BRANDS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Limits and Rate */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Límites y tasa</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Línea de crédito *</label>
                <input
                  type="number"
                  value={lineaCredito}
                  onChange={(e) => setLineaCredito(e.target.value)}
                  placeholder="5000.00"
                  step="0.01"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Moneda *</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as typeof currency)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pago mínimo *</label>
                <input
                  type="number"
                  value={minimumPayment}
                  onChange={(e) => setMinimumPayment(e.target.value)}
                  placeholder="100.00"
                  step="0.01"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tasa de interés (opcional)</label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="18.50"
                  step="0.01"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Tasa anual en porcentaje</p>
              </div>
            </div>
          )}

          {/* Step 3: Dates */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Fechas importantes</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Día de corte (1-31) *</label>
                <input
                  type="number"
                  value={cutOffDay}
                  onChange={(e) => setCutOffDay(e.target.value)}
                  min="1"
                  max="31"
                  placeholder="15"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Día en que se cierra el ciclo de la tarjeta</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Día de pago máximo (1-31) *</label>
                <input
                  type="number"
                  value={duePaymentDay}
                  onChange={(e) => setDuePaymentDay(e.target.value)}
                  min="1"
                  max="31"
                  placeholder="10"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Día límite para pagar sin intereses</p>
              </div>
            </div>
          )}

          {/* Step 4: Card Details */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Detalles de la tarjeta</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Últimos 4 dígitos *</label>
                <input
                  type="text"
                  value={lastDigits}
                  onChange={(e) => setLastDigits(e.target.value.slice(-4))}
                  placeholder="1234"
                  maxLength="4"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color de identificación *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    className="w-16 h-12 rounded-lg cursor-pointer"
                  />
                  <div
                    className="w-24 h-12 rounded-lg border border-border"
                    style={{ backgroundColor: cardColor }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Payment Account */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Cuenta de pagos</h3>
              <p className="text-sm text-muted-foreground">Selecciona la cuenta bancaria desde donde se pagarán las transacciones de esta tarjeta</p>
              <div>
                <label className="block text-sm font-medium mb-2">Cuenta asociada *</label>
                <select
                  value={linkedAccountId}
                  onChange={(e) => setLinkedAccountId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona una cuenta</option>
                  {cuentas
                    .filter(c => c.tipo !== 'credit_card')
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 6: Additional Info */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información adicional</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Tasa especial, beneficios particulares, etc."
                  rows={4}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              
              {/* Summary */}
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="font-semibold">Resumen</p>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• Tarjeta: {nombre} ({marca})</p>
                  <p>• Banco: {banco}</p>
                  <p>• Línea: {lineaCredito} {currency}</p>
                  <p>• Corte: día {cutOffDay} | Pago: día {duePaymentDay}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 bg-muted text-foreground font-semibold py-2 rounded-lg hover:bg-muted/80 transition-colors"
              >
                Atrás
              </button>
            )}
            {step < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creando...' : 'Crear Tarjeta'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
