'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Users, PlusCircle, X } from 'lucide-react';
import { EventFormModal } from '@/components/events/EventFormModal';
import { useAuth } from '@/providers/AuthProvider';
import { usePeople } from '@/hooks/usePeople';
import { usePayableObligations, useReceivableDebts } from '@/hooks/useFinancial';
import { personService } from '@/services/person.service';
import type { ContactKind, ContactRole } from '@/types';

const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);

export default function ContactosPage() {
  const { user } = useAuth();
  const { contacts, mutate } = usePeople();
  const { debts } = useReceivableDebts();
  const { obligations } = usePayableObligations();
  const [nombre, setNombre] = useState('');
  const [contactType, setContactType] = useState<ContactKind>('person');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createContact = async () => {
    if (!user?.uid || !nombre.trim()) return;
    const roles: ContactRole[] = contactType === 'bank' ? ['bank'] : ['other'];
    await personService.create(user.uid, { nombre: nombre.trim(), deuda: 0, tipo: 'DEUDOR', fecha: new Date(), contactType, roles, active: true });
    setNombre('');
    mutate();
  };

  return <>
    {/* Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
        <div className="w-full md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl bg-card shadow-2xl animate-slide-up md:animate-scale-in">
          <div className="sticky top-0 bg-card border-b border-border p-4 md:p-6 rounded-t-lg flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Nueva Persona</h2>
              <p className="text-sm text-muted-foreground mt-1">Registra una nueva persona para gestionar transacciones</p>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 md:p-6">
            <EventFormModal onClose={() => setIsModalOpen(false)} />
          </div>
        </div>
      </div>
    )}

    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Contactos</h1>
        <p className="text-muted-foreground">Personas, empresas, bancos, clientes, proveedores y entidades.</p>
      </div>

      {/* Botón Principal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
      >
        <PlusCircle className="w-5 h-5" /> Nueva Persona
      </button>

      <section className="rounded-xl border border-border bg-card p-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input className="rounded-lg border border-border bg-muted px-3 py-2" placeholder="Nombre del contacto" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <select className="rounded-lg border border-border bg-muted px-3 py-2" value={contactType} onChange={(e) => setContactType(e.target.value as ContactKind)}>
          <option value="person">Persona</option>
          <option value="company">Empresa</option>
          <option value="bank">Banco</option>
          <option value="client">Cliente</option>
          <option value="provider">Proveedor</option>
          <option value="entity">Entidad</option>
        </select>
        <button onClick={createContact} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">
          <PlusCircle className="h-4 w-4" /> Crear
        </button>
      </section>

      <div className="grid gap-4">
        {contacts.map((c) => {
          const receivable = debts.filter((d) => (d.contactId ?? d.personId) === c.id).reduce((s, d) => s + d.pendingBalance, 0);
          const payable = obligations.filter((o) => (o.contactId ?? o.personId) === c.id).reduce((s, o) => s + o.pendingBalance, 0);
          const balance = receivable - payable;
          return (
            <Link key={c.id} href={`/dashboard/personas/${c.id}`} className="rounded-xl border border-border bg-card p-4 hover:bg-muted/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold">{c.nombre}</h2>
                    <p className="text-sm text-muted-foreground">{c.contactType ?? 'person'} · roles: {(c.roles ?? []).join(', ') || 'sin roles'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={balance >= 0 ? 'font-bold text-green-600' : 'font-bold text-red-600'}>{formatCurrency(balance)}</p>
                  <p className="text-xs text-muted-foreground">{receivable > 0 ? `+${formatCurrency(receivable)}` : ''} {payable > 0 ? `-${formatCurrency(payable)}` : ''}</p>
                </div>
              </div>
            </Link>
          );
        })}
        {contacts.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Sin contactos aún. Crea uno para empezar.
          </div>
        )}
      </div>
    </div>
  </>;
}
