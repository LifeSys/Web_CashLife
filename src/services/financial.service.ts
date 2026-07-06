import { collection, doc, getDoc, getDocs, orderBy, query, runTransaction, setDoc, Timestamp, where } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/firebase/constants';
import { FinancialRepository } from '@/lib/repositories/financial.repository';
import { db } from '@/lib/firebase/firebase';
import { IncomeRecord, PayableObligation, PayablePayment, ReceivableDebt, ReceivablePayment, ScheduledPayment, ScheduledPaymentPeriod, Transaction } from '@/types';
import { transactionService } from './transaction.service';

const toDate = (value?: Date | { toDate(): Date }) => value && 'toDate' in value ? value.toDate() : value;
const getStatus = (pendingBalance: number, originalAmount: number, dueDate?: Date | { toDate(): Date }) => {
  if (pendingBalance <= 0) return 'paid' as const;
  const date = toDate(dueDate);
  if (date && date < new Date()) return 'overdue' as const;
  return pendingBalance < originalAmount ? 'partial' as const : 'pending' as const;
};
const periodToDate = (period: string, dueDay: number) => {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1, Math.min(dueDay, 28));
};
const nextMonthlyPeriod = (period: string) => {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

class ReceivableService {
  debts = new FinancialRepository<ReceivableDebt>(FIRESTORE_COLLECTIONS.RECEIVABLE_DEBTS, 'date');
  payments = new FinancialRepository<ReceivablePayment>(FIRESTORE_COLLECTIONS.RECEIVABLE_PAYMENTS, 'date');
  getAllDebts(uid: string) { return this.debts.getAll(uid); }
  getPaymentsByDebt(uid: string, debtId: string) { return this.payments.getByField(uid, 'debtId', debtId); }
  createDebt(uid: string, debt: Omit<ReceivableDebt, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'pendingBalance' | 'status'>) {
    return this.debts.create(uid, { ...debt, pendingBalance: debt.originalAmount, status: getStatus(debt.originalAmount, debt.originalAmount, debt.dueDate as Date) });
  }
  async registerPayment(uid: string, payment: Omit<ReceivablePayment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'transactionId'>) {
    const debt = await this.debts.getById(uid, payment.debtId);
    if (!debt) throw new Error('Cuenta por cobrar no encontrada');
    const amount = Math.min(payment.amount, debt.pendingBalance);
    const transaction = await transactionService.create(uid, { monto: amount, tipo: 'receivable_payment', descripcion: `Cobro: ${debt.description}`, fecha: payment.date, cuenta: payment.accountId, persona: payment.personId, contactId: payment.contactId ?? payment.personId, relatedDebtId: debt.id });
    const created = await this.payments.create(uid, { ...payment, amount, transactionId: transaction.id });
    const pendingBalance = Math.max(debt.pendingBalance - amount, 0);
    await this.debts.update(uid, debt.id, { pendingBalance, status: getStatus(pendingBalance, debt.originalAmount, debt.dueDate as Date) });
    return created;
  }
}

class PayableService {
  obligations = new FinancialRepository<PayableObligation>(FIRESTORE_COLLECTIONS.PAYABLE_OBLIGATIONS, 'dueDate');
  payments = new FinancialRepository<PayablePayment>(FIRESTORE_COLLECTIONS.PAYABLE_PAYMENTS, 'date');
  getAllObligations(uid: string) { return this.obligations.getAll(uid); }
  createObligation(uid: string, obligation: Omit<PayableObligation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'pendingBalance' | 'status'>) {
    return this.obligations.create(uid, { ...obligation, pendingBalance: obligation.originalAmount, status: getStatus(obligation.originalAmount, obligation.originalAmount, obligation.dueDate as Date) });
  }
  async registerPayment(uid: string, payment: Omit<PayablePayment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'transactionId'>) {
    const obligation = await this.obligations.getById(uid, payment.obligationId);
    if (!obligation) throw new Error('Cuenta por pagar no encontrada');
    const amount = Math.min(payment.amount, obligation.pendingBalance);
    const transaction = await transactionService.create(uid, { monto: amount, tipo: 'payable_payment', descripcion: `Pago: ${obligation.description}`, fecha: payment.date, cuenta: payment.accountId, contactId: payment.contactId ?? obligation.contactId, persona: payment.personId ?? obligation.personId, relatedObligationId: obligation.id });
    const created = await this.payments.create(uid, { ...payment, amount, transactionId: transaction.id });
    const pendingBalance = Math.max(obligation.pendingBalance - amount, 0);
    await this.obligations.update(uid, obligation.id, { pendingBalance, status: getStatus(pendingBalance, obligation.originalAmount, obligation.dueDate as Date) });
    return created;
  }
}

class ScheduledPaymentService {
  repo = new FinancialRepository<ScheduledPayment>(FIRESTORE_COLLECTIONS.SCHEDULED_PAYMENTS, 'dueDay');
  getAll(uid: string) { return this.repo.getAll(uid); }
  create(uid: string, payment: Omit<ScheduledPayment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) { return this.repo.create(uid, payment); }
  async getPeriods(uid: string, paymentId: string): Promise<ScheduledPaymentPeriod[]> {
    const q = query(collection(db, `users/${uid}/${FIRESTORE_COLLECTIONS.SCHEDULED_PAYMENTS}/${paymentId}/periods`), orderBy('period', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ScheduledPaymentPeriod, 'id'>) })) as ScheduledPaymentPeriod[];
  }
  async ensurePeriod(uid: string, paymentId: string, period: string) {
    const payment = await this.repo.getById(uid, paymentId);
    if (!payment) throw new Error('Pago programado no encontrado');
    const ref = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.SCHEDULED_PAYMENTS}/${paymentId}/periods/${period}`);
    const snap = await getDoc(ref);
    if (snap.exists()) return { id: snap.id, ...(snap.data() as Omit<ScheduledPaymentPeriod, 'id'>) } as ScheduledPaymentPeriod;
    const dueDate = periodToDate(period, payment.dueDay);
    const status = dueDate < new Date() ? 'overdue' : 'pending';
    const data = { paymentId, period, status, amount: payment.amount, dueDate: Timestamp.fromDate(dueDate), createdAt: Timestamp.now(), updatedAt: Timestamp.now(), createdBy: uid, updatedBy: uid };
    await setDoc(ref, data);
    return { id: period, ...data } as unknown as ScheduledPaymentPeriod;
  }
  async markPeriodAsPaid(uid: string, id: string, period: string, accountId: string, paidAt = new Date()) {
    const payment = await this.repo.getById(uid, id);
    if (!payment) throw new Error('Pago programado no encontrado');
    const periodRef = doc(db, `users/${uid}/${FIRESTORE_COLLECTIONS.SCHEDULED_PAYMENTS}/${id}/periods/${period}`);
    const tx = await transactionService.create(uid, { monto: payment.amount, tipo: 'scheduled_payment', descripcion: `Pago programado: ${payment.name} (${period})`, fecha: paidAt, cuenta: accountId, categoria: payment.category, scheduledPaymentId: id, scheduledPeriod: period });
    await runTransaction(db, async (t) => {
      t.set(periodRef, { paymentId: id, period, status: 'paid', amount: payment.amount, dueDate: Timestamp.fromDate(periodToDate(period, payment.dueDay)), paidAt: Timestamp.fromDate(paidAt), accountId, transactionId: tx.id, updatedAt: Timestamp.now(), updatedBy: uid, createdAt: Timestamp.now(), createdBy: uid }, { merge: true });
    });
    await this.ensurePeriod(uid, id, nextMonthlyPeriod(period));
    await this.repo.update(uid, id, { lastPaidAt: paidAt, nextDuePeriod: nextMonthlyPeriod(period) } as Partial<ScheduledPayment>);
    return tx;
  }
  markAsPaid(uid: string, id: string, accountId: string) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.markPeriodAsPaid(uid, id, period, accountId, now);
  }
}

class IncomeService {
  repo = new FinancialRepository<IncomeRecord>(FIRESTORE_COLLECTIONS.INCOMES, 'date');
  getAll(uid: string) { return this.repo.getAll(uid); }
  async create(uid: string, income: Omit<IncomeRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'transactionId'>) {
    const transaction: Transaction = await transactionService.create(uid, { monto: income.amount, tipo: 'income', descripcion: income.description, fecha: income.date, cuenta: income.destinationAccountId, categoria: income.category, notas: income.notes });
    return this.repo.create(uid, { ...income, transactionId: transaction.id });
  }
}

export const receivableService = new ReceivableService();
export const payableService = new PayableService();
export const scheduledPaymentService = new ScheduledPaymentService();
export const incomeService = new IncomeService();
