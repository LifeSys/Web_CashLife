'use server';

import { prisma } from '@/lib/db/prisma';
import { FinancialRepository } from '@/lib/repositories/financial.repository';
import { transactionService } from '@/services/transaction.service';
import { clampDueDay } from '@/lib/date';
import { IncomeRecord, PayableObligation, PayablePayment, ReceivableDebt, ReceivablePayment, ScheduledPayment, ScheduledPaymentPeriod, ScheduledPaymentSplit } from '@/types';

const toDate = (value?: Date | { toDate(): Date }) => (value && 'toDate' in value ? value.toDate() : value);
const getStatus = (pendingBalance: number, originalAmount: number, dueDate?: Date | { toDate(): Date }) => {
  if (pendingBalance <= 0) return 'paid' as const;
  const date = toDate(dueDate);
  if (date && date < new Date()) return 'overdue' as const;
  return pendingBalance < originalAmount ? ('partial' as const) : ('pending' as const);
};
// El servidor (Vercel) corre en UTC, no en hora de Perú (UTC-5, sin horario
// de verano). `new Date(year, month-1, day)` sin hora usa medianoche en la
// zona horaria del PROCESO — en producción eso es medianoche UTC, que en
// Lima son recién las 7pm del día ANTERIOR. Resultado: un pago programado
// se marcaba como pagado/gasto desde las 7pm de un día antes de lo que el
// usuario esperaba, sin ningún horario predecible.
// Ahora el corte es explícito: mediodía (12pm) hora de Perú del día de
// vencimiento, calculado directamente como el instante UTC equivalente
// (17:00 UTC = 12:00 Lima), sin depender de la zona horaria del servidor.
const PERU_UTC_OFFSET_HOURS = 5;
const periodToDate = (period: string, dueDay: number) => {
  const [year, month] = period.split('-').map(Number);
  // clampDueDay recorta al último día REAL de ese mes (28/29/30/31 según
  // corresponda) — antes esto usaba un 28 fijo, así que un pago con "día
  // 31" (ej. IPC360 Home) se marcaba como vencido/pagado 3 días antes de
  // lo real en cualquier mes.
  const day = clampDueDay(year, month, dueDay);
  return new Date(Date.UTC(year, month - 1, day, 12 + PERU_UTC_OFFSET_HOURS, 0, 0));
};
const nextMonthlyPeriod = (period: string) => {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * El "método de pago" elegido para un pago programado puede ser una cuenta
 * (banco/efectivo) o una tarjeta de crédito — ambas comparten el mismo
 * selector en la UI. Aquí se resuelve a cuál de las dos corresponde el id,
 * para pasarle el campo correcto a la transacción (cuenta vs creditCardId).
 */
async function resolvePaymentDestination(uid: string, id: string): Promise<{ cuenta?: string; creditCardId?: string }> {
  const account = await prisma.account.findFirst({ where: { id, userId: uid } });
  if (account) return { cuenta: id };
  const card = await prisma.creditCard.findFirst({ where: { id, userId: uid } });
  if (card) return { creditCardId: id };
  throw new Error('Cuenta o tarjeta no encontrada');
}

const debtsRepo = new FinancialRepository<ReceivableDebt>(prisma.receivableDebt, 'date');
const receivablePaymentsRepo = new FinancialRepository<ReceivablePayment>(prisma.receivablePayment, 'date');
const obligationsRepo = new FinancialRepository<PayableObligation>(prisma.payableObligation, 'dueDate');
const payablePaymentsRepo = new FinancialRepository<PayablePayment>(prisma.payablePayment, 'date');
const scheduledRepo = new FinancialRepository<ScheduledPayment>(prisma.scheduledPayment, 'dueDay');
const splitsRepo = new FinancialRepository<ScheduledPaymentSplit>(prisma.scheduledPaymentSplit, 'createdAt');
const incomeRepo = new FinancialRepository<IncomeRecord>(prisma.incomeRecord, 'date');

// ---- Cuentas por cobrar ----
export async function getAllReceivableDebtsAction(uid: string) {
  return debtsRepo.getAll(uid);
}

export async function getReceivablePaymentsByDebtAction(uid: string, debtId: string) {
  return receivablePaymentsRepo.getByField(uid, 'debtId', debtId);
}

export async function createReceivableDebtAction(
  uid: string,
  debt: Omit<ReceivableDebt, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'pendingBalance' | 'status'>
) {
  return debtsRepo.create(uid, {
    ...debt,
    pendingBalance: debt.originalAmount,
    status: getStatus(debt.originalAmount, debt.originalAmount, debt.dueDate as Date),
  });
}

export async function updateReceivableDebtAction(
  uid: string,
  id: string,
  updates: Partial<Pick<ReceivableDebt, 'description' | 'originalAmount' | 'date' | 'dueDate' | 'notes' | 'moneda' | 'tipoCambio'>>
) {
  const existing = await debtsRepo.getById(uid, id);
  if (!existing) throw new Error('Cuenta por cobrar no encontrada');
  // El monto ya cobrado no se toca; solo se recalcula lo pendiente contra
  // el monto original corregido.
  const paidSoFar = existing.originalAmount - existing.pendingBalance;
  const newOriginalAmount = updates.originalAmount ?? existing.originalAmount;
  const pendingBalance = Math.max(newOriginalAmount - paidSoFar, 0);
  const dueDate = updates.dueDate ?? existing.dueDate;
  return debtsRepo.update(uid, id, {
    ...updates,
    pendingBalance,
    status: getStatus(pendingBalance, newOriginalAmount, dueDate as Date),
  });
}

/** Borra una cuenta por cobrar y revierte todos los cobros ya registrados contra ella. */
export async function deleteReceivableDebtAction(uid: string, id: string): Promise<boolean> {
  const existing = await debtsRepo.getById(uid, id);
  if (!existing) return false;

  const payments = await receivablePaymentsRepo.getByField(uid, 'debtId', id);
  for (const payment of payments) {
    if (payment.transactionId) {
      await transactionService.delete(uid, payment.transactionId);
    }
  }
  await prisma.receivablePayment.deleteMany({ where: { userId: uid, debtId: id } });

  // Al crearla se registró también una transacción "Cuenta por cobrar: X"
  // solo para que apareciera en Movimientos (cuenta especial que no mueve
  // saldo real) — hay que borrarla también o queda un fantasma huérfano.
  const creationTx = await prisma.transaction.findFirst({ where: { userId: uid, relatedDebtId: id, isDeleted: false } });
  if (creationTx) await transactionService.delete(uid, creationTx.id);

  await prisma.receivableDebt.delete({ where: { id } });
  return true;
}

export async function registerReceivablePaymentAction(
  uid: string,
  payment: Omit<ReceivablePayment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'transactionId'>
) {
  const debt = await debtsRepo.getById(uid, payment.debtId);
  if (!debt) throw new Error('Cuenta por cobrar no encontrada');
  const amount = Math.min(payment.amount, debt.pendingBalance);
  const transaction = await transactionService.create(uid, {
    monto: amount,
    tipo: 'receivable_payment',
    descripcion: `Cobro: ${debt.description}`,
    fecha: payment.date,
    cuenta: payment.accountId,
    persona: payment.personId,
    contactId: payment.contactId ?? payment.personId,
    relatedDebtId: debt.id,
  });
  const created = await receivablePaymentsRepo.create(uid, { ...payment, amount, transactionId: transaction.id });
  const pendingBalance = Math.max(debt.pendingBalance - amount, 0);
  await debtsRepo.update(uid, debt.id, { pendingBalance, status: getStatus(pendingBalance, debt.originalAmount, debt.dueDate as Date) });
  return created;
}

// ---- Cuentas por pagar ----
export async function getAllPayableObligationsAction(uid: string) {
  return obligationsRepo.getAll(uid);
}

export async function createPayableObligationAction(
  uid: string,
  obligation: Omit<PayableObligation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'pendingBalance' | 'status'>
) {
  return obligationsRepo.create(uid, {
    ...obligation,
    pendingBalance: obligation.originalAmount,
    status: getStatus(obligation.originalAmount, obligation.originalAmount, obligation.dueDate as Date),
  });
}

export async function updatePayableObligationAction(
  uid: string,
  id: string,
  updates: Partial<Pick<PayableObligation, 'description' | 'originalAmount' | 'date' | 'dueDate' | 'notes' | 'creditorName' | 'creditorType' | 'moneda' | 'tipoCambio'>>
) {
  const existing = await obligationsRepo.getById(uid, id);
  if (!existing) throw new Error('Cuenta por pagar no encontrada');
  const paidSoFar = existing.originalAmount - existing.pendingBalance;
  const newOriginalAmount = updates.originalAmount ?? existing.originalAmount;
  const pendingBalance = Math.max(newOriginalAmount - paidSoFar, 0);
  const dueDate = updates.dueDate ?? existing.dueDate;
  return obligationsRepo.update(uid, id, {
    ...updates,
    pendingBalance,
    status: getStatus(pendingBalance, newOriginalAmount, dueDate as Date),
  });
}

export async function getPayablePaymentsByObligationAction(uid: string, obligationId: string) {
  return payablePaymentsRepo.getByField(uid, 'obligationId', obligationId);
}

/** Borra una cuenta por pagar y revierte todos los pagos ya registrados contra ella. */
export async function deletePayableObligationAction(uid: string, id: string): Promise<boolean> {
  const existing = await obligationsRepo.getById(uid, id);
  if (!existing) return false;

  const payments = await payablePaymentsRepo.getByField(uid, 'obligationId', id);
  for (const payment of payments) {
    if (payment.transactionId) {
      await transactionService.delete(uid, payment.transactionId);
    }
  }
  await prisma.payablePayment.deleteMany({ where: { userId: uid, obligationId: id } });

  // Igual que con las cuentas por cobrar: la transacción "Cuenta por pagar: X"
  // que se creó junto con la obligación (solo para Movimientos) también hay
  // que borrarla, si no queda un fantasma huérfano.
  const creationTx = await prisma.transaction.findFirst({ where: { userId: uid, relatedObligationId: id, isDeleted: false } });
  if (creationTx) await transactionService.delete(uid, creationTx.id);

  await prisma.payableObligation.delete({ where: { id } });
  return true;
}

export async function registerPayablePaymentAction(
  uid: string,
  payment: Omit<PayablePayment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'transactionId'>
) {
  const obligation = await obligationsRepo.getById(uid, payment.obligationId);
  if (!obligation) throw new Error('Cuenta por pagar no encontrada');
  const amount = Math.min(payment.amount, obligation.pendingBalance);
  const transaction = await transactionService.create(uid, {
    monto: amount,
    tipo: 'payable_payment',
    descripcion: `Pago: ${obligation.description}`,
    fecha: payment.date,
    cuenta: payment.accountId,
    contactId: payment.contactId ?? obligation.contactId,
    persona: payment.personId ?? obligation.personId,
    relatedObligationId: obligation.id,
  });
  const created = await payablePaymentsRepo.create(uid, { ...payment, amount, transactionId: transaction.id });
  const pendingBalance = Math.max(obligation.pendingBalance - amount, 0);
  await obligationsRepo.update(uid, obligation.id, { pendingBalance, status: getStatus(pendingBalance, obligation.originalAmount, obligation.dueDate as Date) });
  return created;
}

// ---- Pagos programados ----
export async function getAllScheduledPaymentsAction(uid: string) {
  return scheduledRepo.getAll(uid);
}

export async function createScheduledPaymentAction(uid: string, payment: Omit<ScheduledPayment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) {
  return scheduledRepo.create(uid, payment);
}

export async function updateScheduledPaymentAction(uid: string, id: string, data: Partial<ScheduledPayment>) {
  return scheduledRepo.update(uid, id, data);
}

export async function deleteScheduledPaymentAction(uid: string, id: string): Promise<boolean> {
  const existing = await prisma.scheduledPayment.findFirst({ where: { id, userId: uid } });
  if (!existing) return false;
  await prisma.scheduledPayment.delete({ where: { id } });
  return true;
}

export async function getScheduledPaymentSplitsAction(uid: string, scheduledPaymentId: string): Promise<ScheduledPaymentSplit[]> {
  return splitsRepo.getByField(uid, 'scheduledPaymentId', scheduledPaymentId);
}

/** Reemplaza toda la lista de participantes de un pago programado. */
export async function setScheduledPaymentSplitsAction(
  uid: string,
  scheduledPaymentId: string,
  splits: { personId: string; amount: number }[]
): Promise<ScheduledPaymentSplit[]> {
  await prisma.scheduledPaymentSplit.deleteMany({ where: { userId: uid, scheduledPaymentId } });
  for (const split of splits) {
    if (split.amount <= 0) continue;
    await splitsRepo.create(uid, { scheduledPaymentId, personId: split.personId, amount: split.amount });
  }
  return splitsRepo.getByField(uid, 'scheduledPaymentId', scheduledPaymentId);
}

export async function getScheduledPaymentPeriodsAction(uid: string, paymentId: string): Promise<ScheduledPaymentPeriod[]> {
  const rows = await prisma.scheduledPaymentPeriod.findMany({ where: { userId: uid, paymentId }, orderBy: { period: 'desc' } });
  return rows as unknown as ScheduledPaymentPeriod[];
}

export async function ensureScheduledPaymentPeriodAction(uid: string, paymentId: string, period: string): Promise<ScheduledPaymentPeriod> {
  const payment = await scheduledRepo.getById(uid, paymentId);
  if (!payment) throw new Error('Pago programado no encontrado');
  const existing = await prisma.scheduledPaymentPeriod.findUnique({ where: { paymentId_period: { paymentId, period } } });
  if (existing) return existing as unknown as ScheduledPaymentPeriod;
  const dueDate = periodToDate(period, payment.dueDay);

  // Pagos con cargo/débito automático: si ya llegó (o pasó) la fecha de cobro,
  // se registran solos como pagados — el usuario no tiene que marcarlos.
  if (payment.autoPay && payment.suggestedAccountId && dueDate <= new Date()) {
    await markScheduledPaymentPeriodAsPaidAction(uid, paymentId, period, payment.suggestedAccountId, dueDate);
    const created = await prisma.scheduledPaymentPeriod.findUnique({ where: { paymentId_period: { paymentId, period } } });
    return created as unknown as ScheduledPaymentPeriod;
  }

  const status = dueDate < new Date() ? 'overdue' : 'pending';
  const created = await prisma.scheduledPaymentPeriod.create({
    data: { userId: uid, paymentId, period, status, amount: payment.amount, dueDate, createdBy: uid, updatedBy: uid },
  });
  return created as unknown as ScheduledPaymentPeriod;
}

export async function markScheduledPaymentPeriodAsPaidAction(uid: string, id: string, period: string, accountId: string, paidAt: Date = new Date()) {
  const payment = await scheduledRepo.getById(uid, id);
  if (!payment) throw new Error('Pago programado no encontrado');

  // Si ya estaba pagado, no volver a generar las cuentas por cobrar de los
  // participantes (evita duplicarlas si se aprieta "marcar pagado" dos veces).
  const existingPeriod = await prisma.scheduledPaymentPeriod.findUnique({ where: { paymentId_period: { paymentId: id, period } } });
  const wasAlreadyPaid = existingPeriod?.status === 'paid';

  const destination = await resolvePaymentDestination(uid, accountId);
  const tx = await transactionService.create(uid, {
    monto: payment.amount,
    tipo: 'scheduled_payment',
    descripcion: `Pago programado: ${payment.name} (${period})`,
    fecha: paidAt,
    categoria: payment.category,
    scheduledPaymentId: id,
    scheduledPeriod: period,
    ...destination,
  });
  await prisma.scheduledPaymentPeriod.upsert({
    where: { paymentId_period: { paymentId: id, period } },
    create: { userId: uid, paymentId: id, period, status: 'paid', amount: payment.amount, dueDate: periodToDate(period, payment.dueDay), paidAt, accountId, transactionId: tx.id, createdBy: uid, updatedBy: uid },
    update: { status: 'paid', paidAt, accountId, transactionId: tx.id, updatedBy: uid },
  });

  // Si este pago se divide con otras personas, generar automáticamente una
  // cuenta por cobrar por cada una con su parte de este periodo.
  if (!wasAlreadyPaid) {
    const splits = await splitsRepo.getByField(uid, 'scheduledPaymentId', id);
    for (const split of splits) {
      await createReceivableDebtAction(uid, {
        personId: split.personId,
        contactId: split.personId,
        description: `${payment.name} (${period}) — tu parte`,
        date: paidAt,
        originalAmount: split.amount,
        moneda: 'PEN',
        tipoCambio: 1,
        sourceScheduledPaymentId: id,
      });
    }
  }

  await ensureScheduledPaymentPeriodAction(uid, id, nextMonthlyPeriod(period));
  await scheduledRepo.update(uid, id, { lastPaidAt: paidAt, nextDuePeriod: nextMonthlyPeriod(period) } as Partial<ScheduledPayment>);
  return tx;
}

export async function markScheduledPaymentAsPaidAction(uid: string, id: string, accountId: string) {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return markScheduledPaymentPeriodAsPaidAction(uid, id, period, accountId, now);
}

// ---- Ingresos ----
export async function getAllIncomesAction(uid: string) {
  return incomeRepo.getAll(uid);
}

export async function createIncomeRecordAction(
  uid: string,
  income: Omit<IncomeRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'transactionId'>
) {
  const transaction = await transactionService.create(uid, {
    monto: income.amount,
    tipo: 'income',
    descripcion: income.description,
    fecha: income.date,
    cuenta: income.destinationAccountId,
    categoria: income.category,
    notas: income.notes,
  });
  return incomeRepo.create(uid, { ...income, transactionId: transaction.id });
}
