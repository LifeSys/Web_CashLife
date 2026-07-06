import { FIRESTORE_COLLECTIONS } from '@/firebase/constants';
import { FinancialRepository } from '@/lib/repositories/financial.repository';
import { IncomeRecord, PayableObligation, PayablePayment, ReceivableDebt, ReceivablePayment, ScheduledPayment, Transaction } from '@/types';
import { transactionService } from './transaction.service';

const getStatus = (pendingBalance: number, originalAmount: number, dueDate?: Date | { toDate(): Date }) => {
  if (pendingBalance <= 0) return 'paid' as const;
  const date = dueDate && 'toDate' in dueDate ? dueDate.toDate() : dueDate;
  if (date && date < new Date()) return 'overdue' as const;
  return pendingBalance < originalAmount ? 'partial' as const : 'pending' as const;
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
    const transaction = await transactionService.create(uid, { monto: amount, tipo: 'loan_payment', descripcion: `Cobro: ${debt.description}`, fecha: payment.date, cuenta: payment.accountId, persona: payment.personId });
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
    const transaction = await transactionService.create(uid, { monto: amount, tipo: 'expense', descripcion: `Pago: ${obligation.description}`, fecha: payment.date, cuenta: payment.accountId });
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
  async markAsPaid(uid: string, id: string, accountId: string) {
    const payment = await this.repo.getById(uid, id);
    if (!payment) throw new Error('Pago programado no encontrado');
    await transactionService.create(uid, { monto: payment.amount, tipo: 'expense', descripcion: `Pago programado: ${payment.name}`, fecha: new Date(), cuenta: accountId, categoria: payment.category });
    return this.repo.update(uid, id, { lastPaidAt: new Date() } as Partial<ScheduledPayment>);
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
