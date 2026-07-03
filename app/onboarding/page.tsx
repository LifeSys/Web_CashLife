'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, CreditCard, Landmark, Plus, Receipt, Smartphone, Sparkles, Users, X } from 'lucide-react';
import type { ReactNode } from 'react';
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
  const totalSteps = 10;

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
          {step === 9 && <Debts {...props} submit={submit} />}
          {step === 10 && <Summary busy={busy} back={back} onboarding={onboarding} finish={() => submit(async () => { await onboarding.complete(); router.replace('/dashboard'); }, false)} />}
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


type OnboardingPatternProps = StepProps & {
  title: string;
  description: string;
  items: ReactNode[];
  emptyTitle: string;
  emptyDescription: string;
  addLabel?: string;
  dialogTitle: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  children: ReactNode;
  onSave: () => void;
};

function OnboardingPattern({ busy, back, next, title, description, items, emptyTitle, emptyDescription, addLabel = '+ Agregar', dialogTitle, open, setOpen, children, onSave }: OnboardingPatternProps) {
  return <div>
    <h2 className="text-3xl font-bold">{title}</h2>
    <p className="mt-3 text-muted-foreground">{description}</p>
    <div className="mt-6 grid gap-3">
      {items.length > 0 ? items : <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-6 text-center"><Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" /><h3 className="font-semibold">{emptyTitle}</h3><p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p></div>}
    </div>
    <button type="button" className={`${button} mt-6 w-full bg-secondary text-secondary-foreground`} disabled={busy} onClick={() => setOpen(true)}><Plus className="inline h-5 w-5" /> {addLabel}</button>
    <div className="mt-8 flex gap-3"><button type="button" className={`${button} bg-muted`} onClick={back} disabled={busy}><ArrowLeft className="inline h-4 w-4" /> Anterior</button><button type="button" className={`${button} flex-1 bg-primary text-primary-foreground`} onClick={next} disabled={busy}>Continuar <ArrowRight className="inline h-4 w-4" /></button></div>
    {open && <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm md:items-center md:p-6"><form onSubmit={onSave} className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-2xl md:max-w-lg md:rounded-3xl"><div className="mb-5 flex items-center justify-between"><h3 className="text-xl font-bold">{dialogTitle}</h3><button type="button" className="rounded-full bg-muted p-2" onClick={() => setOpen(false)} disabled={busy}><X className="h-4 w-4" /></button></div><div className="grid gap-3">{children}</div><button className={`${button} mt-6 w-full bg-primary text-primary-foreground`} disabled={busy}>Guardar</button></form></div>}
  </div>;
}

function ItemCard({ icon, title, meta }: { icon: ReactNode; title: string; meta: string }) { return <div className="flex items-center gap-3 rounded-2xl bg-muted p-4"><div className="rounded-2xl bg-background p-3 text-primary">{icon}</div><div><h3 className="font-semibold">{title}</h3><p className="text-sm text-muted-foreground">{meta}</p></div></div>; }
const formatMoney = (value: number) => value.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });

function BankAccounts({ busy, back, next, submit }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void }) { const o=useOnboarding(); const [open,setOpen]=useState(false); const f=useForm({defaultValues:{bank:'',name:'',balance:0,currency:'PEN',hasDebitCard:false}}); const save=f.handleSubmit(async (d)=>{ await submit(()=>o.createAccount({bank:d.bank,name:d.name,balance:Number(d.balance),currency:d.currency,hasDebitCard:d.hasDebitCard,banco:d.bank,nombre:d.name||d.bank,saldo:Number(d.balance),tipo:'bank',color:'#3B82F6',icono:'Landmark'}),false); f.reset(); setOpen(false); }); const items=o.accounts.filter(a=>a.tipo==='bank').map(a=><ItemCard key={a.id} icon={<Landmark className="h-5 w-5" />} title={a.name || a.nombre} meta={`${a.bank || a.banco || 'Cuenta bancaria'} · ${formatMoney(a.balance ?? a.saldo)}${a.hasDebitCard ? ' · débito' : ''}`} />); return <OnboardingPattern busy={busy} back={back} next={next} title="Cuentas bancarias" description="El dinero vive en tus cuentas. Puedes registrar varias y marcar si operan con tarjeta de débito sin crear una tarjeta aparte." items={items} emptyTitle="No tienes cuentas registradas." emptyDescription="Agrega tu primera cuenta para evitar duplicar saldos en billeteras o tarjetas de débito." addLabel="+ Agregar cuenta" dialogTitle="Agregar cuenta bancaria" open={open} setOpen={setOpen} onSave={save}><input className={baseInput} placeholder="Banco" {...f.register('bank',{required:true})}/><input className={baseInput} placeholder="Nombre personalizado (Cuenta Principal)" {...f.register('name')}/><input className={baseInput} type="number" step="0.01" placeholder="Saldo actual" {...f.register('balance',{valueAsNumber:true})}/><select className={baseInput} {...f.register('currency')}><option value="PEN">PEN</option><option value="USD">USD</option><option value="EUR">EUR</option></select><label className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm font-medium"><input type="checkbox" {...f.register('hasDebitCard')} /> Esta cuenta tiene tarjeta de débito</label></OnboardingPattern>; }

function Wallets({ busy, back, next, submit }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void }) { const o=useOnboarding(); const [open,setOpen]=useState(false); const bankAccounts=o.accounts.filter(a=>a.tipo==='bank'); const f=useForm({defaultValues:{type:'Yape',linkedAccountId:''}}); const save=f.handleSubmit(async(d)=>{ await submit(()=>o.createWallet({type:d.type as 'Yape'|'Plin'|'Otra',linkedAccountId:d.linkedAccountId}),false); f.reset({type:'Yape',linkedAccountId:''}); setOpen(false); }); const items=o.wallets.map(w=>{ const account=bankAccounts.find(a=>a.id===w.linkedAccountId); return <ItemCard key={w.id} icon={<Smartphone className="h-5 w-5" />} title={w.type} meta={`Vinculada a ${account?.bank || account?.banco || account?.name || account?.nombre || 'cuenta bancaria'}`} />; }); return <OnboardingPattern busy={busy} back={back} next={next} title="Billeteras digitales" description="Las billeteras no guardan saldo propio: solo son un medio para usar una cuenta bancaria vinculada." items={items} emptyTitle="No tienes billeteras registradas." emptyDescription="Agrega Yape, Plin u otra billetera solo si está vinculada a una cuenta." addLabel="+ Agregar billetera" dialogTitle="Agregar billetera digital" open={open} setOpen={setOpen} onSave={save}><select className={baseInput} {...f.register('type')}><option>Yape</option><option>Plin</option><option>Otra</option></select><select className={baseInput} {...f.register('linkedAccountId',{required:true})}><option value="">¿A qué cuenta está vinculada?</option>{bankAccounts.map(a=><option key={a.id} value={a.id}>{a.bank || a.banco} {a.name || a.nombre}</option>)}</select></OnboardingPattern>; }

function Cards({ busy, back, next, submit }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void }) { const o=useOnboarding(); const [open,setOpen]=useState(false); const f=useForm({defaultValues:{bank:'',name:'',brand:'Visa',creditLimit:0,usedAmount:0,cutDay:1,paymentDay:1,minimumPayment:0,interestRate:0,color:'',icono:''}}); const save=f.handleSubmit(async(d)=>{ await submit(()=>o.createCreditCard({bank:d.bank,name:d.name,brand:d.brand as 'Visa'|'Mastercard'|'American Express'|'Diners'|'Otra',creditLimit:Number(d.creditLimit),usedAmount:Number(d.usedAmount),availableAmount:Number(d.creditLimit)-Number(d.usedAmount),cutDay:Number(d.cutDay),paymentDay:Number(d.paymentDay),minimumPayment:Number(d.minimumPayment||0),interestRate:Number(d.interestRate||0),banco:d.bank,nombre:d.name,lineaCredito:Number(d.creditLimit),montoUtilizado:Number(d.usedAmount),fechaCorte:String(d.cutDay),fechaMaximaPago:String(d.paymentDay),pagoMinimo:Number(d.minimumPayment||0),tasaInteres:Number(d.interestRate||0),color:d.color||'#22C55E',icono:d.icono||'CreditCard'}),false); f.reset(); setOpen(false); }); const items=o.creditCards.map(c=><ItemCard key={c.id} icon={<CreditCard className="h-5 w-5" />} title={c.name || c.nombre} meta={`${c.brand || 'Crédito'} · disponible ${formatMoney((c.creditLimit ?? c.lineaCredito) - (c.usedAmount ?? c.montoUtilizado))}`} />); return <OnboardingPattern busy={busy} back={back} next={next} title="Tarjetas de crédito" description="Solo registra tarjetas de crédito. Las de débito pertenecen a una cuenta bancaria y no duplican saldo." items={items} emptyTitle="No tienes tarjetas registradas." emptyDescription="Agrega una tarjeta de crédito para representar deuda y línea disponible." addLabel="+ Agregar tarjeta" dialogTitle="Agregar tarjeta de crédito" open={open} setOpen={setOpen} onSave={save}><input className={baseInput} placeholder="Banco" {...f.register('bank',{required:true})}/><input className={baseInput} placeholder="Nombre (Visa Platinum)" {...f.register('name',{required:true})}/><select className={baseInput} {...f.register('brand')}><option>Visa</option><option>Mastercard</option><option>American Express</option><option>Diners</option><option>Otra</option></select><input className={baseInput} type="number" step="0.01" placeholder="Línea de crédito" {...f.register('creditLimit',{valueAsNumber:true})}/><input className={baseInput} type="number" step="0.01" placeholder="Monto utilizado" {...f.register('usedAmount',{valueAsNumber:true})}/><input className={baseInput} type="number" min="1" max="31" placeholder="Día de corte (15)" {...f.register('cutDay',{valueAsNumber:true})}/><input className={baseInput} type="number" min="1" max="31" placeholder="Día máximo de pago (05)" {...f.register('paymentDay',{valueAsNumber:true})}/><input className={baseInput} type="number" step="0.01" placeholder="Pago mínimo (opcional)" {...f.register('minimumPayment',{valueAsNumber:true})}/><input className={baseInput} type="number" step="0.01" placeholder="Tasa de interés (opcional)" {...f.register('interestRate',{valueAsNumber:true})}/><input className={baseInput} placeholder="Color (opcional)" {...f.register('color')}/><input className={baseInput} placeholder="Icono (opcional)" {...f.register('icono')}/></OnboardingPattern>; }

function Subscriptions({ busy, back, next, submit, accounts }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void; accounts: {id:string; nombre:string}[] }) { const o=useOnboarding(); const [open,setOpen]=useState(false); const f=useForm({defaultValues:{nombre:'Netflix',monto:0,frecuencia:'monthly',fechaVencimiento:'',cuentaId:'',activo:true}}); const save=f.handleSubmit(async d=>{ await submit(()=>o.createSubscription({nombre:d.nombre,monto:Number(d.monto),frecuencia:d.frecuencia as 'monthly',fechaVencimiento:d.fechaVencimiento,cuentaId:d.cuentaId,activo:d.activo}),false); f.reset(); setOpen(false); }); const items=o.subscriptions.map(s=><ItemCard key={s.id} icon={<Receipt className="h-5 w-5" />} title={s.nombre} meta={`${formatMoney(s.monto)} · ${s.frecuencia}`} />); return <OnboardingPattern busy={busy} back={back} next={next} title="Pagos recurrentes" description="Lista suscripciones, servicios o pagos fijos para anticipar tu mes." items={items} emptyTitle="Sin pagos recurrentes" emptyDescription="Puedes agregarlos ahora o hacerlo más tarde desde el dashboard." dialogTitle="Agregar pago recurrente" open={open} setOpen={setOpen} onSave={save}><input className={baseInput} placeholder="Nombre" {...f.register('nombre')}/><input className={baseInput} type="number" step="0.01" placeholder="Monto" {...f.register('monto',{valueAsNumber:true})}/><input className={baseInput} placeholder="Fecha de vencimiento" {...f.register('fechaVencimiento')}/><select className={baseInput} {...f.register('cuentaId')}><option value="">Cuenta de pago</option>{accounts.map(a=><option key={a.id} value={a.id}>{a.nombre}</option>)}</select></OnboardingPattern>; }

function Loans({ busy, back, next, submit }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void }) { const o=useOnboarding(); const [open,setOpen]=useState(false); const f=useForm({defaultValues:{nombre:'',monto:0,fecha:''}}); const save=f.handleSubmit(async d=>{ await submit(()=>o.createPerson({nombre:d.nombre,deuda:Number(d.monto),tipo:'DEUDOR',fecha:d.fecha?new Date(d.fecha):new Date()}),false); f.reset(); setOpen(false); }); const items=o.people.filter(p=>p.tipo==='DEUDOR').map(p=><ItemCard key={p.id} icon={<Users className="h-5 w-5" />} title={p.nombre} meta={`Te debe ${formatMoney(p.deuda)}`} />); return <OnboardingPattern busy={busy} back={back} next={next} title="Préstamos" description="Registra dinero que prestaste y esperas recuperar." items={items} emptyTitle="Sin préstamos" emptyDescription="Si nadie te debe dinero, simplemente continúa." dialogTitle="Agregar préstamo" open={open} setOpen={setOpen} onSave={save}><input className={baseInput} placeholder="Nombre" {...f.register('nombre')}/><input className={baseInput} type="number" step="0.01" placeholder="Monto" {...f.register('monto',{valueAsNumber:true})}/><input className={baseInput} type="date" {...f.register('fecha')}/></OnboardingPattern>; }

function Debts({ busy, back, next, submit }: StepProps & { submit:(a:()=>Promise<unknown>, adv?:boolean)=>void }) { const o=useOnboarding(); const [open,setOpen]=useState(false); const f=useForm({defaultValues:{nombre:'',monto:0,fecha:''}}); const save=f.handleSubmit(async d=>{ await submit(()=>o.createPerson({nombre:d.nombre,deuda:Number(d.monto),tipo:'PRESTAMISTA',fecha:d.fecha?new Date(d.fecha):new Date()}),false); f.reset(); setOpen(false); }); const items=o.people.filter(p=>p.tipo==='PRESTAMISTA').map(p=><ItemCard key={p.id} icon={<Users className="h-5 w-5" />} title={p.nombre} meta={`Debes ${formatMoney(p.deuda)}`} />); return <OnboardingPattern busy={busy} back={back} next={next} title="Deudas" description="Añade dinero que debes para que tu panorama financiero sea realista." items={items} emptyTitle="Sin deudas" emptyDescription="Si no tienes deudas, puedes continuar sin agregar nada." dialogTitle="Agregar deuda" open={open} setOpen={setOpen} onSave={save}><input className={baseInput} placeholder="Nombre" {...f.register('nombre')}/><input className={baseInput} type="number" step="0.01" placeholder="Monto" {...f.register('monto',{valueAsNumber:true})}/><input className={baseInput} type="date" {...f.register('fecha')}/></OnboardingPattern>; }

function Summary({ busy, back, onboarding, finish }: { busy:boolean; back:()=>void; onboarding: ReturnType<typeof useOnboarding>; finish:()=>void }) { const summary = useMemo(() => { const saldo=onboarding.accounts.reduce((s,a)=>s+a.saldo,0); const used=onboarding.creditCards.reduce((s,c)=>s+(c.usedAmount ?? c.montoUtilizado),0); const monthly=onboarding.subscriptions.filter(s=>s.activo).reduce((s,p)=>s+p.monto,0); const loans=onboarding.people.filter(p=>p.tipo==='DEUDOR').reduce((s,p)=>s+p.deuda,0); const debts=onboarding.people.filter(p=>p.tipo==='PRESTAMISTA').reduce((s,p)=>s+p.deuda,0); return { saldo, used, monthly, loans, debts, net:sadoFix(saldo + loans - debts - used) }; }, [onboarding.accounts,onboarding.creditCards,onboarding.subscriptions,onboarding.people]); const rows=[['Saldo total',summary.saldo,'money'],['Número de cuentas',onboarding.accounts.length,'count'],['Número de tarjetas',onboarding.creditCards.length,'count'],['Total utilizado en tarjetas',summary.used,'money'],['Pagos mensuales',summary.monthly,'money'],['Préstamos',summary.loans,'money'],['Deudas',summary.debts,'money'],['Patrimonio estimado',summary.net,'money']] as const; return <div><h2 className="text-3xl font-bold">Resumen inicial</h2><div className="mt-6 grid gap-3">{rows.map(([k,v,t])=><div className="flex justify-between rounded-2xl bg-muted p-4" key={k}><span className="text-muted-foreground">{k}</span><strong>{t==='money'?v.toLocaleString('es-PE',{style:'currency',currency:'PEN'}):v}</strong></div>)}</div><div className="mt-8 flex gap-3"><button className={`${button} bg-muted`} onClick={back}>Anterior</button><button className={`${button} flex-1 bg-primary text-primary-foreground`} disabled={busy || onboarding.loading} onClick={finish}><Check className="inline h-4 w-4"/> Finalizar</button></div></div>; }
function sadoFix(n:number){ return Math.round(n*100)/100; }
