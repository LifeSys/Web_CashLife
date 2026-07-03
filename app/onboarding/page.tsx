'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useSettings } from '@/hooks/useSettings';
import { useOnboarding } from '@/hooks/useOnboarding';

const money = z.coerce.number().min(0, 'Ingresa un monto válido');
const baseInput = 'w-full rounded-2xl border border-border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-primary';
const button = 'rounded-2xl px-5 py-3 font-semibold transition active:scale-[0.98] disabled:opacity-50';

type StepProps = { busy: boolean; next: () => void; back: () => void };

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { settings, isLoading } = useSettings();
  const onboarding = useOnboarding();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const totalSteps = 9;

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!isLoading && settings?.onboardingCompleted) router.replace('/dashboard');
  }, [isLoading, settings?.onboardingCompleted, router]);

  const next = () => setStep((current) => Math.min(totalSteps, current + 1));
  const back = () => setStep((current) => Math.max(1, current - 1));
  const submit = async (action: () => Promise<unknown>, advance = true) => {
    setBusy(true);
    try {
      await action();
      if (advance) next();
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || isLoading || !user || settings?.onboardingCompleted) return <LoadingSkeleton />;

  const props = { busy, next, back };

  return (
    <main className="min-h-screen bg-background p-4 text-foreground md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-2xl flex-col">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>Paso {step} de {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>

        <section className="flex flex-1 animate-in fade-in slide-in-from-right-4 duration-300 flex-col justify-center rounded-3xl border border-border bg-card p-6 shadow-2xl md:p-10">
          {step === 1 && <Welcome busy={busy} next={next} />}
          {step === 2 && <Currency {...props} submit={submit} />}
          {step === 3 && <Cash {...props} submit={submit} />}
          {step === 4 && <BankAccounts {...props} submit={submit} />}
          {step === 5 && <Wallets {...props} submit={submit} />}
          {step === 6 && <Cards {...props} submit={submit} />}
          {step === 7 && <Subscriptions {...props} submit={submit} accounts={onboarding.accounts} />}
          {step === 8 && <Loans {...props} submit={submit} />}
          {step === 9 && <Summary busy={busy} back={back} onboarding={onboarding} finish={() => submit(async () => { await onboarding.complete(); router.replace('/dashboard'); }, false)} />}
        </section>
      </div>
    </main>
  );
}

function Nav({ busy, next, back, skip }: StepProps & { skip?: boolean }) {
  return <div className="mt-8 flex gap-3"><button className={`${button} bg-muted`} onClick={back} disabled={busy}><ArrowLeft className="inline h-4 w-4" /> Anterior</button>{skip && <button className={`${button} bg-transparent text-muted-foreground`} onClick={next} disabled={busy}>Omitir</button>}</div>;
}
function Welcome({ busy, next }: { busy: boolean; next: () => void }) { return <div className="text-center"><Sparkles className="mx-auto mb-6 h-14 w-14 text-primary" /><h1 className="text-4xl font-bold">Bienvenido a CashLife</h1><p className="mt-4 text-lg text-muted-foreground">Vamos a configurar tus finanzas en menos de 2 minutos.</p><button className={`${button} mt-10 w-full bg-primary text-primary-foreground`} disabled={busy} onClick={next}>Comenzar <ArrowRight className="inline h-4 w-4" /></button></div>; }

function Currency({ busy, back, submit }: StepProps & { submit: (a:()=>Promise<unknown>)=>void }) { const o=useOnboarding(); return <div><h2 className="text-3xl font-bold">Elige tu moneda principal</h2><div className="mt-6 grid gap-3">{[['PEN','Soles (PEN)'],['USD','Dólares (USD)'],['EUR','Euros (EUR)']].map(([v,l])=><button key={v} className={`${button} border border-border bg-muted text-left`} disabled={busy} onClick={()=>submit(()=>o.saveCurrency(v))}>{l}</button>)}</div><Nav busy={busy} back={back} next={()=>{}} /></div>; }

function Cash({ busy, back, submit }: StepProps & { submit:(a:()=>Promise<unknown>)=>void }) { const o=useOnboarding(); const f=useForm({defaultValues:{saldo:0}}); return <form onSubmit={f.handleSubmit((d)=>submit(()=>o.createAccount({nombre:'Efectivo', tipo:'cash', saldo: Number(d.saldo), color:'#22C55E', icono:'Wallet'})))}><h2 className="text-3xl font-bold">Dinero disponible</h2><label className="mt-6 block text-sm text-muted-foreground">¿Cuánto dinero tienes actualmente en efectivo?</label><input className={`${baseInput} mt-2`} type="number" step="0.01" {...f.register('saldo',{valueAsNumber:true, validate:v=>money.safeParse(v).success})}/><div className="mt-8 flex gap-3"><button type="button" className={`${button} bg-muted`} onClick={back}>Anterior</button><button className={`${button} flex-1 bg-primary text-primary-foreground`} disabled={busy}>Siguiente</button></div></form>; }

function BankAccounts({ busy, back, next, submit }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void }) { const o=useOnboarding(); const f=useForm({defaultValues:{banco:'',nombre:'',saldo:0,subtipo:'savings'}}); const save=f.handleSubmit(async (d)=>{ await submit(()=>o.createAccount({banco:d.banco,nombre:d.nombre||d.banco,tipo:'bank',subtipo:d.subtipo as 'savings'|'checking',saldo:Number(d.saldo),color:'#3B82F6',icono:'Landmark'}),false); f.reset(); }); return <div><h2 className="text-3xl font-bold">¿Tienes cuentas bancarias?</h2><div className="mt-6 grid gap-3"><input className={baseInput} placeholder="Banco" {...f.register('banco',{required:true})}/><input className={baseInput} placeholder="Nombre" {...f.register('nombre')}/><input className={baseInput} type="number" step="0.01" placeholder="Saldo actual" {...f.register('saldo',{valueAsNumber:true})}/><select className={baseInput} {...f.register('subtipo')}><option value="savings">Ahorros</option><option value="checking">Corriente</option></select></div><div className="mt-8 flex flex-wrap gap-3"><button className={`${button} bg-muted`} onClick={back}>Anterior</button><button className={`${button} bg-secondary text-secondary-foreground`} disabled={busy} onClick={save}><Plus className="inline h-4 w-4"/> Agregar otra cuenta</button><button className={`${button} flex-1 bg-primary text-primary-foreground`} onClick={next}>No / Siguiente</button></div></div>; }

function Wallets({ busy, back, next, submit }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void }) { const o=useOnboarding(); const [name,setName]=useState('Yape'); const [saldo,setSaldo]=useState(0); const save=()=>submit(()=>o.createAccount({nombre:name,tipo:'wallet',saldo,color:'#F59E0B',icono:'Smartphone'}),false); return <div><h2 className="text-3xl font-bold">¿Utilizas billeteras digitales?</h2><div className="mt-6 flex gap-2">{['Yape','Plin','Otro'].map(x=><button className={`${button} ${name===x?'bg-primary text-primary-foreground':'bg-muted'}`} onClick={()=>setName(x)} key={x}>{x}</button>)}</div><input className={`${baseInput} mt-4`} type="number" step="0.01" placeholder="Saldo actual" onChange={e=>setSaldo(Number(e.target.value))}/><div className="mt-8 flex gap-3"><button className={`${button} bg-muted`} onClick={back}>Anterior</button><button className={`${button} bg-secondary text-secondary-foreground`} disabled={busy} onClick={save}>Guardar</button><button className={`${button} flex-1 bg-primary text-primary-foreground`} onClick={next}>Siguiente</button></div></div>; }

function Cards({ busy, back, next, submit }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void }) {
  const o = useOnboarding();
  const [showForm, setShowForm] = useState(false);
  const debitCards = o.accounts.filter((account) => account.tipo === 'debit');
  const addedCards = [...debitCards, ...o.creditCards].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const f = useForm({ defaultValues: { kind: 'debit', banco: '', nombre: '', saldo: 0, linea: 0, utilizado: 0, corte: '', pago: '', minimo: 0, tasaInteres: 0, color: '', icono: '' } });
  const kind = f.watch('kind');
  const save = f.handleSubmit(async (d) => {
    await submit(() => kind === 'debit'
      ? o.createAccount({ banco: d.banco, nombre: d.nombre, tipo: 'debit', saldo: Number(d.saldo), color: d.color || '#06B6D4', icono: d.icono || 'CreditCard' })
      : o.createCreditCard({ banco: d.banco, nombre: d.nombre, lineaCredito: Number(d.linea), montoUtilizado: Number(d.utilizado), fechaCorte: d.corte, fechaMaximaPago: d.pago, pagoMinimo: Number(d.minimo || 0), tasaInteres: Number(d.tasaInteres || 0), color: d.color || '#22C55E', icono: d.icono || 'CreditCard' }),
      false
    );
    f.reset({ kind: d.kind, banco: '', nombre: '', saldo: 0, linea: 0, utilizado: 0, corte: '', pago: '', minimo: 0, tasaInteres: 0, color: '', icono: '' });
    setShowForm(false);
  });

  return <div><h2 className="text-3xl font-bold">Tarjetas</h2>{addedCards.length > 0 && <div className="mt-6 grid gap-2">{addedCards.map((card) => <div className="rounded-2xl bg-muted px-4 py-3" key={card.id}>✓ {card.nombre}</div>)}</div>}{!showForm ? <><p className="mt-6 text-muted-foreground">¿Deseas agregar una tarjeta?</p><div className="mt-6 flex flex-wrap gap-3"><button className={`${button} bg-muted`} onClick={back} disabled={busy}>Anterior</button><button className={`${button} bg-secondary text-secondary-foreground`} disabled={busy} onClick={() => setShowForm(true)}><Plus className="inline h-4 w-4"/> {addedCards.length > 0 ? 'Agregar otra tarjeta' : 'Agregar tarjeta'}</button><button className={`${button} flex-1 bg-primary text-primary-foreground`} onClick={next} disabled={busy}>{addedCards.length > 0 ? 'Continuar' : 'Omitir'}</button></div></> : <form onSubmit={save}><div className="mt-6 grid gap-3"><label className="text-sm font-semibold text-muted-foreground">Tipo de tarjeta</label><div className="flex gap-3"><label className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3"><input type="radio" value="debit" {...f.register('kind')} /> Débito</label><label className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3"><input type="radio" value="credit" {...f.register('kind')} /> Crédito</label></div><input className={baseInput} placeholder="Banco (ej. BCP, Interbank, BBVA)" {...f.register('banco', { required: true })}/><input className={baseInput} placeholder="Nombre de la tarjeta" {...f.register('nombre', { required: true })}/>{kind === 'debit' ? <input className={baseInput} type="number" step="0.01" placeholder="Saldo actual" {...f.register('saldo', { valueAsNumber: true })}/> : <><input className={baseInput} type="number" step="0.01" placeholder="Línea de crédito" {...f.register('linea', { valueAsNumber: true })}/><input className={baseInput} type="number" step="0.01" placeholder="Monto utilizado" {...f.register('utilizado', { valueAsNumber: true })}/><input className={baseInput} placeholder="Fecha de corte" {...f.register('corte')}/><input className={baseInput} placeholder="Fecha máxima de pago" {...f.register('pago')}/><input className={baseInput} type="number" step="0.01" placeholder="Pago mínimo (opcional)" {...f.register('minimo', { valueAsNumber: true })}/><input className={baseInput} type="number" step="0.01" placeholder="Tasa de interés (opcional)" {...f.register('tasaInteres', { valueAsNumber: true })}/></>}<input className={baseInput} placeholder="Color (opcional)" {...f.register('color')}/><input className={baseInput} placeholder="Icono (opcional)" {...f.register('icono')}/></div><div className="mt-8 flex flex-wrap gap-3"><button type="button" className={`${button} bg-muted`} onClick={() => setShowForm(false)} disabled={busy}>Cancelar</button><button className={`${button} bg-secondary text-secondary-foreground`} disabled={busy}>Guardar tarjeta</button><button type="button" className={`${button} flex-1 bg-primary text-primary-foreground`} onClick={next} disabled={busy}>Continuar</button></div></form>}</div>;
}
function Subscriptions({ busy, back, next, submit, accounts }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void; accounts: {id:string; nombre:string}[] }) { const o=useOnboarding(); const f=useForm({defaultValues:{nombre:'Netflix',monto:0,frecuencia:'monthly',fechaVencimiento:'',cuentaId:'',activo:true}}); const suggestions=['Netflix','Spotify','Disney+','Universidad','Internet','Agua','Luz','Celular','Alquiler','Seguro','Gimnasio','Otros']; const save=f.handleSubmit(d=>submit(()=>o.createSubscription({nombre:d.nombre,monto:Number(d.monto),frecuencia:d.frecuencia as 'monthly',fechaVencimiento:d.fechaVencimiento,cuentaId:d.cuentaId,activo:d.activo}),false)); return <div><h2 className="text-3xl font-bold">¿Qué pagos realizas todos los meses?</h2><div className="mt-5 flex flex-wrap gap-2">{suggestions.map(x=><button className="rounded-full bg-muted px-3 py-2 text-sm" onClick={()=>f.setValue('nombre',x)} key={x}>{x}</button>)}</div><div className="mt-4 grid gap-3"><input className={baseInput} {...f.register('nombre')}/><input className={baseInput} type="number" step="0.01" placeholder="Monto" {...f.register('monto',{valueAsNumber:true})}/><input className={baseInput} placeholder="Fecha de vencimiento" {...f.register('fechaVencimiento')}/><select className={baseInput} {...f.register('cuentaId')}><option value="">Cuenta de pago</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.nombre}</option>)}</select></div><div className="mt-8 flex gap-3"><button className={`${button} bg-muted`} onClick={back}>Anterior</button><button className={`${button} bg-secondary text-secondary-foreground`} disabled={busy} onClick={save}>Guardar</button><button className={`${button} flex-1 bg-primary text-primary-foreground`} onClick={next}>Omitir / Siguiente</button></div></div>; }

function Loans({ busy, back, next, submit }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void }) { const o=useOnboarding(); const f=useForm({defaultValues:{tipo:'DEUDOR',nombre:'',monto:0,fecha:'',descripcion:''}}); const save=f.handleSubmit(d=>submit(()=>o.createPerson({nombre:d.nombre,deuda:Number(d.monto),tipo:d.tipo as 'DEUDOR'|'PRESTAMISTA',fecha: d.fecha ? new Date(d.fecha) : new Date()}),false)); return <div><h2 className="text-3xl font-bold">Préstamos y deudas</h2><p className="mt-2 text-muted-foreground">Registra si alguien te debe dinero o si debes dinero a alguien.</p><select className={`${baseInput} mt-6`} {...f.register('tipo')}><option value="DEUDOR">Alguien me debe dinero</option><option value="PRESTAMISTA">Debo dinero a alguien</option></select><div className="mt-4 grid gap-3"><input className={baseInput} placeholder="Nombre" {...f.register('nombre')}/><input className={baseInput} type="number" step="0.01" placeholder="Monto" {...f.register('monto',{valueAsNumber:true})}/><input className={baseInput} type="date" {...f.register('fecha')}/><input className={baseInput} placeholder="Descripción" {...f.register('descripcion')}/></div><div className="mt-8 flex gap-3"><button className={`${button} bg-muted`} onClick={back}>Anterior</button><button className={`${button} bg-secondary text-secondary-foreground`} disabled={busy} onClick={save}>Guardar</button><button className={`${button} flex-1 bg-primary text-primary-foreground`} onClick={next}>Omitir / Siguiente</button></div></div>; }

function Summary({ busy, back, onboarding, finish }: { busy:boolean; back:()=>void; onboarding: ReturnType<typeof useOnboarding>; finish:()=>void }) { const summary = useMemo(() => { const saldo=onboarding.accounts.reduce((s,a)=>s+a.saldo,0); const used=onboarding.creditCards.reduce((s,c)=>s+c.montoUtilizado,0); const monthly=onboarding.subscriptions.filter(s=>s.activo).reduce((s,p)=>s+p.monto,0); const loans=onboarding.people.filter(p=>p.tipo==='DEUDOR').reduce((s,p)=>s+p.deuda,0); const debts=onboarding.people.filter(p=>p.tipo==='PRESTAMISTA').reduce((s,p)=>s+p.deuda,0); return { saldo, used, monthly, loans, debts, net:sadoFix(saldo + loans - debts - used) }; }, [onboarding.accounts,onboarding.creditCards,onboarding.subscriptions,onboarding.people]); const rows=[['Saldo total',summary.saldo,'money'],['Número de cuentas',onboarding.accounts.length,'count'],['Número de tarjetas',onboarding.creditCards.length,'count'],['Total utilizado en tarjetas',summary.used,'money'],['Pagos mensuales',summary.monthly,'money'],['Préstamos',summary.loans,'money'],['Deudas',summary.debts,'money'],['Patrimonio estimado',summary.net,'money']] as const; return <div><h2 className="text-3xl font-bold">Resumen inicial</h2><div className="mt-6 grid gap-3">{rows.map(([k,v,t])=><div className="flex justify-between rounded-2xl bg-muted p-4" key={k}><span className="text-muted-foreground">{k}</span><strong>{t==='money'?v.toLocaleString('es-PE',{style:'currency',currency:'PEN'}):v}</strong></div>)}</div><div className="mt-8 flex gap-3"><button className={`${button} bg-muted`} onClick={back}>Anterior</button><button className={`${button} flex-1 bg-primary text-primary-foreground`} disabled={busy || onboarding.loading} onClick={finish}><Check className="inline h-4 w-4"/> Finalizar</button></div></div>; }
function sadoFix(n:number){ return Math.round(n*100)/100; }
