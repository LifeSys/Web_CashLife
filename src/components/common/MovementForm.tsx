'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategoriesByType } from '@/hooks/useCategories';
import { usePeople } from '@/hooks/usePeople';
import type { TransactionType } from '@/types';
import { transactionService } from '@/services/transaction.service';

interface MovementFormProps {
  onClose: () => void;
}

export function MovementForm({ onClose }: MovementFormProps) {
  const { cuentas } = useAccounts();
  const { personas } = usePeople();
  const [tipo, setTipo] = useState<TransactionType>('GASTO');
  const { categorias } = useCategoriesByType(tipo === 'INGRESO' ? 'ingreso' : 'gasto');

  const [formData, setFormData] = useState({
    monto: '',
    cuentaId: cuentas[0]?.id || '',
    categoriaId: categorias[0]?.id || '',
    descripcion: '',
    personaId: '',
    notas: '',
  });

  const montoRef = useRef<HTMLInputElement>(null);

  // Focus en monto al abrir
  useEffect(() => {
    montoRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.monto) {
      alert('Por favor ingresa un monto');
      return;
    }

    try {
      await transactionService.create({
        tipo,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion || 'Sin descripción',
        cuentaId: formData.cuentaId,
        categoriaId: formData.categoriaId,
        personaId: formData.personaId || undefined,
        notas: formData.notas || undefined,
        fecha: new Date(),
      });

      onClose();
    } catch (error) {
      console.error('Error registrando movimiento:', error);
      alert('Error al registrar movimiento');
    }
  };

  const movementTypes: { value: TransactionType; label: string }[] = [
    { value: 'GASTO', label: 'Gasto' },
    { value: 'INGRESO', label: 'Ingreso' },
    { value: 'PRESTAMO', label: 'Préstamo' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
  ];

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {/* Selector de tipo (4 botones) */}
      <div className="grid grid-cols-4 gap-2">
        {movementTypes.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setTipo(t.value);
              setFormData(prev => ({ ...prev, categoriaId: '' }));
            }}
            className={`py-2 rounded-lg font-medium text-sm transition-colors ${
              tipo === t.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Monto - CAMPO MÁS IMPORTANTE */}
      <div>
        <label className="text-sm font-medium">Monto *</label>
        <input
          ref={montoRef}
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.monto}
          onChange={e => setFormData(prev => ({ ...prev, monto: e.target.value }))}
          className="w-full mt-1 px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg font-semibold"
        />
      </div>

      {/* Cuenta */}
      <div>
        <label className="text-sm font-medium">Cuenta *</label>
        <select
          value={formData.cuentaId}
          onChange={e => setFormData(prev => ({ ...prev, cuentaId: e.target.value }))}
          className="w-full mt-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {cuentas.map(cuenta => (
            <option key={cuenta.id} value={cuenta.id}>
              {cuenta.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Categoría */}
      <div>
        <label className="text-sm font-medium">Categoría *</label>
        <select
          value={formData.categoriaId}
          onChange={e => setFormData(prev => ({ ...prev, categoriaId: e.target.value }))}
          className="w-full mt-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Descripción */}
      <div>
        <label className="text-sm font-medium">Descripción</label>
        <input
          type="text"
          placeholder="Detalles de la transacción"
          value={formData.descripcion}
          onChange={e => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
          className="w-full mt-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Persona (solo para préstamos) */}
      {tipo === 'PRESTAMO' && (
        <div>
          <label className="text-sm font-medium">Persona *</label>
          <select
            value={formData.personaId}
            onChange={e => setFormData(prev => ({ ...prev, personaId: e.target.value }))}
            className="w-full mt-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecciona una persona</option>
            {personas.map(persona => (
              <option key={persona.id} value={persona.id}>
                {persona.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Notas */}
      <div>
        <label className="text-sm font-medium">Notas (opcional)</label>
        <textarea
          placeholder="Notas adicionales"
          value={formData.notas}
          onChange={e => setFormData(prev => ({ ...prev, notas: e.target.value }))}
          rows={2}
          className="w-full mt-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-bold text-lg"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
