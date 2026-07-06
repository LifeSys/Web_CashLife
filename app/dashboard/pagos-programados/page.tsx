'use client';

import { PlusCircle } from 'lucide-react';
import { useScheduledPayments } from '@/hooks/useFinancial';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);

export default function Page() {
  const { scheduledPayments } = useScheduledPayments();
  const total = scheduledPayments.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pagos Programados</h1>
          <p className="text-muted-foreground">Recordatorios locales sin descuento automático</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><PlusCircle className="h-4 w-4" /> Nuevo registro</button>
      </div>
      <div className="rounded-xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Total consolidado</p><p className="text-3xl font-bold">{formatCurrency(total)}</p></div>
      <div className="grid gap-4">
        {scheduledPayments.map((item) => (
          <article key={item.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4"><div><h2 className="font-bold">{item.name}</h2><p className="text-sm text-muted-foreground">{'status' in item ? `Estado: ${item.status}` : 'Registro financiero'}</p></div><strong>{formatCurrency(item.amount)}</strong></div>
          </article>
        ))}
        {!scheduledPayments.length && <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">Aún no hay registros. Usa el botón “Nuevo registro” para empezar.</div>}
      </div>
    </div>
  );
}
