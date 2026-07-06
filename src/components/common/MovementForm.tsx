'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/providers/AuthProvider';
import { useCategories } from '@/hooks/useCategories';
import { useCreditCards } from '@/hooks/useCreditCards';
import { usePayableObligations, useReceivableDebts } from '@/hooks/useFinancial';
import { usePeople } from '@/hooks/usePeople';
import { financialEngine } from '@/services/financial-engine.service';

type OperationType = 'expense' | 'income' | 'transfer' | 'loan_granted' | 'loan_received' | 'receivable' | 'payable' | 'credit_card_charge' | 'credit_card_payment' | 'collect_debt' | 'pay_debt';

interface MovementFormProps { onClose: () => void; }

const labels: Record<OperationType, string> = {
  expense: 'Gasto', income: 'Ingreso', transfer: 'Transferencia', loan_granted: 'Préstamo otorgado', loan_received: 'Préstamo recibido', receivable: 'Cuenta por cobrar', payable: 'Cuenta por pagar', credit_card_charge: 'Compra con tarjeta', credit_card_payment: 'Pago tarjeta', collect_debt: 'Cobro de deuda', pay_debt: 'Pago de deuda',
};

export function MovementForm({ onClose }: MovementFormProps) {
  const { user } = useAuth();
  const { cuentas, mutate: mutateCuentas } = useAccounts();
  const { categorias } = useCategories();
  const { personas } = usePeople();
  const { creditCards, mutate: mutateCards } = useCreditCards();
  const { debts, mutate: mutateDebts } = useReceivableDebts();
  const { obligations, mutate: mutateObligations } = usePayableObligations();
  const [tipo, setTipo] = useState<OperationType>('expense');
  const [formData, setFormData] = useState({ monto: '', cuentaId: '', destinationAccountId: '', categoriaId: '', descripcion: '', personaId: '', creditCardId: '', debtId: '', obligationId: '', notas: '' });
  const montoRef = useRef<HTMLInputElement>(null);
  const cashAccounts = useMemo(() => cuentas.filter((cuenta) => cuenta.tipo !== 'credit_card'), [cuentas]);

  useEffect(() => { montoRef.current?.focus(); }, []);
  useEffect(() => {
    setFormData((prev) => ({ ...prev, cuentaId: prev.cuentaId || cashAccounts[0]?.id || '', categoriaId: prev.categoriaId || categorias[0]?.id || '', creditCardId: prev.creditCardId || creditCards[0]?.id || '', debtId: prev.debtId || debts.find((d) => d.status !== 'paid')?.id || '', obligationId: prev.obligationId || obligations.find((o) => o.status !== 'paid')?.id || '' }));
  }, [cashAccounts, categorias, creditCards, debts, obligations]);

  const refresh = () => { mutateCuentas(); mutateCards(); mutateDebts(); mutateObligations(); };
  const selectedDebt = debts.find((d) => d.id === formData.debtId);
  const selectedObligation = obligations.find((o) => o.id === formData.obligationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(formData.monto);
    if (!amount || amount <= 0 || !user?.uid) return toast.error('Ingresa un monto válido');
    if (!formData.cuentaId && !['credit_card_charge', 'receivable', 'payable'].includes(tipo)) return toast.error('Selecciona una cuenta');
    if (tipo === 'transfer' && !formData.destinationAccountId) return toast.error('Selecciona la cuenta destino');
    if (['loan_granted', 'loan_received', 'receivable', 'payable'].includes(tipo) && !formData.personaId) return toast.error('Selecciona un contacto');
    if (['credit_card_charge', 'credit_card_payment'].includes(tipo) && !formData.creditCardId) return toast.error('Selecciona una tarjeta');
    if (tipo === 'collect_debt' && !selectedDebt) return toast.error('Selecciona una deuda por cobrar');
    if (tipo === 'pay_debt' && !selectedObligation) return toast.error('Selecciona una deuda por pagar');
    try {
      const base = { monto: amount, descripcion: formData.descripcion || labels[tipo], cuenta: formData.cuentaId, categoria: formData.categoriaId || undefined, persona: formData.personaId || undefined, personId: formData.personaId || undefined, contactId: formData.personaId || undefined, notas: formData.notas || undefined, fecha: new Date() };
      if (tipo === 'income') await financialEngine.createIncome(user.uid, base);
      if (tipo === 'expense') await financialEngine.createExpense(user.uid, base);
      if (tipo === 'transfer') await financialEngine.createTransfer(user.uid, { ...base, destinationAccountId: formData.destinationAccountId });
      if (tipo === 'loan_granted') await financialEngine.grantLoan(user.uid, { personId: formData.personaId, contactId: formData.personaId, description: formData.descripcion || 'Préstamo', amount, accountId: formData.cuentaId, date: new Date(), notes: formData.notas || undefined });
      if (tipo === 'loan_received') await financialEngine.receiveLoan(user.uid, { creditorName: personas.find((p) => p.id === formData.personaId)?.nombre || 'Acreedor', personId: formData.personaId, contactId: formData.personaId, description: formData.descripcion || 'Préstamo recibido', amount, accountId: formData.cuentaId, date: new Date(), notes: formData.notas || undefined });
      if (tipo === 'receivable') await financialEngine.createReceivable(user.uid, { personId: formData.personaId, contactId: formData.personaId, description: formData.descripcion || 'Cuenta por cobrar', amount, date: new Date(), notes: formData.notas || undefined });
      if (tipo === 'payable') await financialEngine.createPayable(user.uid, { creditorName: personas.find((p) => p.id === formData.personaId)?.nombre || 'Acreedor', personId: formData.personaId, contactId: formData.personaId, description: formData.descripcion || 'Cuenta por pagar', amount, date: new Date(), notes: formData.notas || undefined });
      if (tipo === 'credit_card_charge') await financialEngine.chargeCreditCard(user.uid, { ...base, cuenta: undefined, creditCardId: formData.creditCardId });
      if (tipo === 'credit_card_payment') await financialEngine.payCreditCard(user.uid, { ...base, creditCardId: formData.creditCardId });
      if (tipo === 'collect_debt' && selectedDebt) await financialEngine.collectReceivable(user.uid, { debtId: selectedDebt.id, personId: selectedDebt.personId, contactId: selectedDebt.contactId, amount, accountId: formData.cuentaId, date: new Date(), observations: formData.notas || undefined });
      if (tipo === 'pay_debt' && selectedObligation) await financialEngine.payObligation(user.uid, { obligationId: selectedObligation.id, personId: selectedObligation.personId, contactId: selectedObligation.contactId, amount, accountId: formData.cuentaId, date: new Date(), observations: formData.notas || undefined });
      refresh(); toast.success('Operación registrada y saldos actualizados'); onClose();
    } catch (error) { console.error(error); toast.error(error instanceof Error ? error.message : 'Error al registrar operación'); }
  };

  return <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-8">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{(Object.keys(labels) as OperationType[]).map((value) => <button key={value} type="button" onClick={() => setTipo(value)} className={`rounded-lg px-3 py-3 text-sm font-semibold ${tipo === value ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>{labels[value]}</button>)}</div>
    {(tipo === 'collect_debt') && <select value={formData.debtId} onChange={(e) => setFormData((p) => ({ ...p, debtId: e.target.value, monto: String(debts.find((d) => d.id === e.target.value)?.pendingBalance ?? p.monto) }))} className="w-full rounded-lg border bg-muted px-4 py-3"><option value="">Deuda a cobrar</option>{debts.filter((d) => d.status !== 'paid').map((d) => <option key={d.id} value={d.id}>{d.description} · pendiente S/{d.pendingBalance}</option>)}</select>}
    {(tipo === 'pay_debt') && <select value={formData.obligationId} onChange={(e) => setFormData((p) => ({ ...p, obligationId: e.target.value, monto: String(obligations.find((o) => o.id === e.target.value)?.pendingBalance ?? p.monto) }))} className="w-full rounded-lg border bg-muted px-4 py-3"><option value="">Deuda a pagar</option>{obligations.filter((o) => o.status !== 'paid').map((o) => <option key={o.id} value={o.id}>{o.description} · pendiente S/{o.pendingBalance}</option>)}</select>}
    <input ref={montoRef} type="number" step="0.01" placeholder="Monto" value={formData.monto} onChange={(e) => setFormData((p) => ({ ...p, monto: e.target.value }))} className="w-full rounded-lg border bg-muted px-4 py-3 text-lg font-bold" />
    {tipo !== 'credit_card_charge' && tipo !== 'receivable' && tipo !== 'payable' && <select value={formData.cuentaId} onChange={(e) => setFormData((p) => ({ ...p, cuentaId: e.target.value }))} className="w-full rounded-lg border bg-muted px-4 py-3"><option value="">Cuenta {tipo === 'collect_debt' ? 'destino' : 'origen'}</option>{cashAccounts.map((cuenta) => <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre} · S/{cuenta.saldo ?? cuenta.balance ?? 0}</option>)}</select>}
    {tipo === 'transfer' && <select value={formData.destinationAccountId} onChange={(e) => setFormData((p) => ({ ...p, destinationAccountId: e.target.value }))} className="w-full rounded-lg border bg-muted px-4 py-3"><option value="">Cuenta destino</option>{cashAccounts.filter((c) => c.id !== formData.cuentaId).map((cuenta) => <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>)}</select>}
    {(tipo === 'credit_card_charge' || tipo === 'credit_card_payment') && <select value={formData.creditCardId} onChange={(e) => setFormData((p) => ({ ...p, creditCardId: e.target.value }))} className="w-full rounded-lg border bg-muted px-4 py-3"><option value="">Tarjeta</option>{creditCards.map((card) => <option key={card.id} value={card.id}>{card.nombre ?? card.name} · usado S/{card.usedAmount ?? card.montoUtilizado ?? 0}</option>)}</select>}
    {['loan_granted', 'loan_received', 'receivable', 'payable', 'credit_card_charge'].includes(tipo) && <select value={formData.personaId} onChange={(e) => setFormData((p) => ({ ...p, personaId: e.target.value }))} className="w-full rounded-lg border bg-muted px-4 py-3"><option value="">Contacto</option>{personas.map((persona) => <option key={persona.id} value={persona.id}>{persona.nombre}</option>)}</select>}
    <input placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData((p) => ({ ...p, descripcion: e.target.value }))} className="w-full rounded-lg border bg-muted px-4 py-3" />
    <textarea placeholder="Notas" value={formData.notas} onChange={(e) => setFormData((p) => ({ ...p, notas: e.target.value }))} rows={2} className="w-full resize-none rounded-lg border bg-muted px-4 py-3" />
    <div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-lg bg-muted px-4 py-3 font-semibold">Cancelar</button><button type="submit" className="flex-1 rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground">Guardar</button></div>
  </form>;
}
