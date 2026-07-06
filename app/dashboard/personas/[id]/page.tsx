'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { usePeople } from '@/hooks/usePeople';
import { useAccounts } from '@/hooks/useAccounts';
import { usePayableObligations, useReceivableDebts } from '@/hooks/useFinancial';
import { useTransactions } from '@/hooks/useTransactions';
import { receivableService, payableService } from '@/services/financial.service';
import { financialEngine } from '@/services/financial-engine.service';

const money = (n: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n || 0);

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { contacts } = usePeople();
  const { cuentas } = useAccounts();
  const { debts, mutate: mutateDebts } = useReceivableDebts();
  const { obligations, mutate: mutateObligations } = usePayableObligations();
  const { transacciones, mutate: mutateTx } = useTransactions();
  const contact = contacts.find((c) => c.id === id);
  const [desc, setDesc] = useState(''); const [amount, setAmount] = useState(''); const [accountId, setAccountId] = useState('');
  const contactDebts = debts.filter((d) => (d.contactId ?? d.personId) === id);
  const contactObligations = obligations.filter((o) => (o.contactId ?? o.personId) === id);
  const receivable = contactDebts.reduce((s,d)=>s+d.pendingBalance,0); const payable = contactObligations.reduce((s,o)=>s+o.pendingBalance,0);
  const refresh = () => { mutateDebts(); mutateObligations(); mutateTx(); };
  if (!contact) return <div className="p-6">Contacto no encontrado.</div>;
  const createDebt = async () => { if (!user?.uid || !desc || !amount) return; await receivableService.createDebt(user.uid, { personId: id, contactId: id, description: desc, date: new Date(), originalAmount: Number(amount) }); setDesc(''); setAmount(''); refresh(); };
  const createObligation = async () => { if (!user?.uid || !desc || !amount) return; await payableService.createObligation(user.uid, { contactId: id, personId: id, creditorName: contact.nombre, creditorType: contact.contactType === 'bank' ? 'bank' : 'person', description: desc, date: new Date(), dueDate: new Date(), originalAmount: Number(amount) }); setDesc(''); setAmount(''); refresh(); };
  const collect = async (debtId: string, max: number) => { if (!user?.uid || !accountId) return; const value = Number(prompt('Monto a cobrar', String(max)) ?? '0'); if (value > 0) await financialEngine.collectReceivable(user.uid, { debtId, personId: id, contactId: id, amount: value, accountId, date: new Date() }); refresh(); };
  const pay = async (obligationId: string, max: number) => { if (!user?.uid || !accountId) return; const value = Number(prompt('Monto a pagar', String(max)) ?? '0'); if (value > 0) await financialEngine.payObligation(user.uid, { obligationId, personId: id, contactId: id, amount: value, accountId, date: new Date() }); refresh(); };
  return <div className="space-y-6 p-4 md:p-6"><div><h1 className="text-3xl font-bold">{contact.nombre}</h1><p className="text-muted-foreground">Ficha financiera única · Información · Balance · Me debe · Le debo · Pagos · Cobros · Historial · Notas · Archivos preparados</p></div><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Me debe</p><b className="text-2xl text-emerald-500">{money(receivable)}</b></div><div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Le debo</p><b className="text-2xl text-red-500">{money(payable)}</b></div><div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Balance</p><b className={(receivable-payable)>=0?'text-2xl text-emerald-500':'text-2xl text-red-500'}>{money(receivable-payable)}</b></div></div><section className="rounded-xl border bg-card p-4 grid gap-3 md:grid-cols-[1fr_140px_auto_auto]"><input className="rounded border bg-muted px-3 py-2" placeholder="Concepto: Celular, Sensores TPMS..." value={desc} onChange={(e)=>setDesc(e.target.value)} /><input className="rounded border bg-muted px-3 py-2" placeholder="Monto" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} /><button onClick={createDebt} className="rounded bg-emerald-600 px-3 py-2 text-white"><PlusCircle className="inline h-4 w-4" /> Me debe</button><button onClick={createObligation} className="rounded bg-red-600 px-3 py-2 text-white"><PlusCircle className="inline h-4 w-4" /> Le debo</button></section><select className="rounded border bg-muted px-3 py-2" value={accountId} onChange={(e)=>setAccountId(e.target.value)}><option value="">Cuenta para pagar/cobrar</option>{cuentas.filter(c=>c.tipo!=='credit_card').map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select><div className="grid gap-6 lg:grid-cols-2"><section className="rounded-xl border bg-card p-4"><h2 className="font-bold">Me debe</h2>{contactDebts.map(d=><div key={d.id} className="flex justify-between border-t py-3"><span>{d.description}<br/><small>{d.status}</small></span><button onClick={()=>collect(d.id,d.pendingBalance)} className="text-emerald-500 font-bold">Cobrar {money(d.pendingBalance)}</button></div>)}</section><section className="rounded-xl border bg-card p-4"><h2 className="font-bold">Le debo</h2>{contactObligations.map(o=><div key={o.id} className="flex justify-between border-t py-3"><span>{o.description}<br/><small>{o.status}</small></span><button onClick={()=>pay(o.id,o.pendingBalance)} className="text-red-500 font-bold">Pagar {money(o.pendingBalance)}</button></div>)}</section></div><section className="rounded-xl border bg-card p-4"><h2 className="font-bold">Historial financiero</h2>{transacciones.filter(t=>(t.contactId ?? t.persona ?? t.personId)===id).map(t=><div key={t.id} className="flex justify-between border-t py-2 text-sm"><span>{t.descripcion}</span><b>{money(t.monto)}</b></div>)}</section><section className="rounded-xl border bg-card p-4"><h2 className="font-bold">Notas y archivos</h2><p className="text-sm text-muted-foreground">Notas: {contact.notes || 'Sin notas.'}</p><p className="text-sm text-muted-foreground">Archivos: estructura preparada para futura integración con Storage.</p></section></div>;
}
