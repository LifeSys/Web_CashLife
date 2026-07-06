'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useIncomes } from '@/hooks/useFinancial';
import { IncomeModal } from '@/components/modals/IncomeModal';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
const toDate = (value?: unknown) =>
  value instanceof Date ? value : value && typeof value === 'object' && 'toDate' in value ? (value as { toDate(): Date }).toDate() : new Date(String(value));

export default function Page() {
  const { incomes, mutate } = useIncomes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const total = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Ingresos</h1>
          <p className="text-muted-foreground">Registro de entradas con transacción automática</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <PlusCircle className="h-4 w-4" /> Nuevo registro
        </button>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Total consolidado</p>
        <p className="text-3xl font-bold">{formatCurrency(total)}</p>
      </div>
      <div className="grid gap-4">
        {incomes.map((item) => (
          <article key={item.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-bold">{item.description}</h2>
                <p className="text-sm text-muted-foreground">
                  Fecha: {toDate(item.date).toLocaleDateString('es-PE')}
                </p>
              </div>
              <strong>{formatCurrency(item.amount)}</strong>
            </div>
          </article>
        ))}
        {!incomes.length && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Aún no hay registros. Usa el botón "Nuevo registro" para empezar.
          </div>
        )}
      </div>

      <IncomeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => mutate()} />
    </div>
  );
}
