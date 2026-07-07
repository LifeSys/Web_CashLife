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

export function CreditCardCreateModal({ isOpen, onClose, onSuccess }: CreditCardCreateModalProps) {
  const { user } = useAuth();
  const { mutate: mutateCreditCards } = useCreditCards();
  const { cuentas } = useAccounts();
  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState('');
  const [lineaCredito, setLineaCredito] = useState('');
  const [moneda, setMoneda] = useState('PEN');
  const [fechaCorte, setFechaCorte] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [ultimos4, setUltimos4] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [cuentaPago, setCuentaPago] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!nombre.trim() || !banco.trim() || !lineaCredito.trim() || !fechaCorte || !fechaPago || !cuentaPago) {
      toast.error('Completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    try {
      await creditCardService.create(user.uid, {
        nombre: nombre.trim(),
        banco: banco.trim(),
        lineaCredito: parseFloat(lineaCredito),
        moneda,
        fechaCorte: parseInt(fechaCorte),
        fechaPago: parseInt(fechaPago),
        ultimos4: ultimos4.trim(),
        color,
        cuentaPagoId: cuentaPago,
        saldoUtilizado: 0,
      });
      toast.success('Tarjeta creada');
      mutateCreditCards();
      setNombre('');
      setBanco('');
      setLineaCredito('');
      setMoneda('PEN');
      setFechaCorte('');
      setFechaPago('');
      setUltimos4('');
      setColor('#3B82F6');
      setCuentaPago('');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear tarjeta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4">
      <div className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-card shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Nueva Tarjeta de Crédito</h2>
            <p className="text-sm text-muted-foreground mt-1">Registra tu tarjeta de crédito</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Mi Visa" className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Banco</label>
            <select value={banco} onChange={(e) => setBanco(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2">
              <option value="">Selecciona banco</option>
              <option value="BCP">BCP</option>
              <option value="Interbank">Interbank</option>
              <option value="BBVA">BBVA</option>
              <option value="Scotiabank">Scotiabank</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Línea de Crédito</label>
            <input type="number" value={lineaCredito} onChange={(e) => setLineaCredito(e.target.value)} placeholder="5000.00" step="0.01" className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Moneda</label>
            <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2">
              <option value="PEN">Soles</option>
              <option value="USD">Dólares</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Día de Corte</label>
              <input type="number" min="1" max="31" value={fechaCorte} onChange={(e) => setFechaCorte(e.target.value)} placeholder="15" className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Día de Pago</label>
              <input type="number" min="1" max="31" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} placeholder="10" className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Últimos 4 Dígitos</label>
            <input type="text" value={ultimos4} onChange={(e) => setUltimos4(e.target.value.slice(0, 4))} placeholder="1234" maxLength="4" className="w-full rounded-lg border border-border bg-muted px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cuenta Bancaria para Pagos</label>
            <select value={cuentaPago} onChange={(e) => setCuentaPago(e.target.value)} className="w-full rounded-lg border border-border bg-muted px-3 py-2">
              <option value="">Selecciona cuenta</option>
              {cuentas.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
            {isSubmitting ? 'Creando...' : 'Crear Tarjeta'}
          </button>
        </form>
      </div>
    </div>
  );
}
