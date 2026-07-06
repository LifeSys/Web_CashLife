'use client';

import { CheckCircle2, ClipboardList, Edit, History, PlusCircle, Trash2 } from 'lucide-react';
import { useReceivableDebts } from '@/hooks/useFinancial';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);

export default function Page() {
  const { debts } = useReceivableDebts();
  const total = debts.reduce((sum, item) => sum + (item.pendingBalance || 0), 0);
  const paid = debts.reduce((sum, item) => sum + Math.max((item.originalAmount || 0) - (item.pendingBalance || 0), 0), 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cuentas por Cobrar</h1>
          <p className="text-muted-foreground">Personas y deudas pendientes por cobrar</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><PlusCircle className="h-4 w-4" /> Nuevo registro</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Pendiente por cobrar</p><p className="text-3xl font-bold">{formatCurrency(total)}</p></div><div className="rounded-xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Ya cobrado</p><p className="text-3xl font-bold text-emerald-500">{formatCurrency(paid)}</p></div></div>
      <div className="grid gap-4">
        {debts.map((item) => (
          <article key={item.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0"><h2 className="font-bold">{item.description}</h2><p className="text-sm text-muted-foreground">Persona: {item.contactId ?? item.personId} · Estado: {item.status}</p><p className="text-xs text-muted-foreground">Fecha: {String(item.date instanceof Date ? item.date.toLocaleDateString() : '')}</p></div>
              <div className="grid grid-cols-3 gap-2 text-right text-sm"><span>Original<br/><b>{formatCurrency(item.originalAmount)}</b></span><span>Pagado<br/><b className="text-emerald-500">{formatCurrency(Math.max(item.originalAmount - item.pendingBalance, 0))}</b></span><span>Pendiente<br/><b className="text-orange-500">{formatCurrency(item.pendingBalance)}</b></span></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2"><button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"><ClipboardList className="inline h-4 w-4" /> Registrar pago</button><button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><CheckCircle2 className="inline h-4 w-4" /> Marcar pagado</button><button className="rounded-lg bg-muted px-3 py-2 text-sm"><Edit className="inline h-4 w-4" /> Editar</button><button className="rounded-lg bg-muted px-3 py-2 text-sm"><History className="inline h-4 w-4" /> Historial</button><button className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"><Trash2 className="inline h-4 w-4" /> Eliminar</button></div>
          </article>
        ))}
        {!debts.length && <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">Aún no hay registros. Usa el botón “Nuevo registro” para empezar.</div>}
      </div>
    </div>
  );
}
