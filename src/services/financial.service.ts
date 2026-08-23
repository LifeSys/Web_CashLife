import { IncomeRecord, PayableObligation, PayablePayment, ReceivableDebt, ReceivablePayment, ScheduledPayment, ScheduledPaymentPeriod, ScheduledPaymentSplit } from '@/types';
import {
  getAllReceivableDebtsAction,
  getReceivablePaymentsByDebtAction,
  createReceivableDebtAction,
  updateReceivableDebtAction,
  registerReceivablePaymentAction,
  getAllPayableObligationsAction,
  createPayableObligationAction,
  updatePayableObligationAction,
  registerPayablePaymentAction,
  getAllScheduledPaymentsAction,
  createScheduledPaymentAction,
  getScheduledPaymentPeriodsAction,
  ensureScheduledPaymentPeriodAction,
  markScheduledPaymentPeriodAsPaidAction,
  markScheduledPaymentAsPaidAction,
  getScheduledPaymentSplitsAction,
  setScheduledPaymentSplitsAction,
  getAllIncomesAction,
  createIncomeRecordAction,
} from '@/lib/actions/financial.actions';

/**
 * Estos servicios son wrappers client-safe: toda la lógica y el acceso a
 * Postgres viven en las Server Actions de '@/lib/actions/financial.actions'.
 */
class ReceivableService {
  getAllDebts(uid: string) {
    return getAllReceivableDebtsAction(uid);
  }
  getPaymentsByDebt(uid: string, debtId: string) {
    return getReceivablePaymentsByDebtAction(uid, debtId);
  }
  createDebt(uid: string, debt: Omit<ReceivableDebt, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'pendingBalance' | 'status'>) {
    return createReceivableDebtAction(uid, debt);
  }
  updateDebt(uid: string, id: string, updates: Partial<Pick<ReceivableDebt, 'description' | 'originalAmount' | 'date' | 'dueDate' | 'notes' | 'moneda' | 'tipoCambio'>>) {
    return updateReceivableDebtAction(uid, id, updates);
  }
  registerPayment(uid: string, payment: Omit<ReceivablePayment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'transactionId'>) {
    return registerReceivablePaymentAction(uid, payment);
  }
}

class PayableService {
  getAllObligations(uid: string) {
    return getAllPayableObligationsAction(uid);
  }
  createObligation(uid: string, obligation: Omit<PayableObligation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'pendingBalance' | 'status'>) {
    return createPayableObligationAction(uid, obligation);
  }
  updateObligation(uid: string, id: string, updates: Partial<Pick<PayableObligation, 'description' | 'originalAmount' | 'date' | 'dueDate' | 'notes' | 'creditorName' | 'creditorType' | 'moneda' | 'tipoCambio'>>) {
    return updatePayableObligationAction(uid, id, updates);
  }
  registerPayment(uid: string, payment: Omit<PayablePayment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'transactionId'>) {
    return registerPayablePaymentAction(uid, payment);
  }
}

class ScheduledPaymentService {
  getAll(uid: string) {
    return getAllScheduledPaymentsAction(uid);
  }
  create(uid: string, payment: Omit<ScheduledPayment, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) {
    return createScheduledPaymentAction(uid, payment);
  }
  getPeriods(uid: string, paymentId: string): Promise<ScheduledPaymentPeriod[]> {
    return getScheduledPaymentPeriodsAction(uid, paymentId);
  }
  ensurePeriod(uid: string, paymentId: string, period: string): Promise<ScheduledPaymentPeriod> {
    return ensureScheduledPaymentPeriodAction(uid, paymentId, period);
  }
  markPeriodAsPaid(uid: string, id: string, period: string, accountId: string, paidAt = new Date()) {
    return markScheduledPaymentPeriodAsPaidAction(uid, id, period, accountId, paidAt);
  }
  markAsPaid(uid: string, id: string, accountId: string) {
    return markScheduledPaymentAsPaidAction(uid, id, accountId);
  }
  getSplits(uid: string, scheduledPaymentId: string): Promise<ScheduledPaymentSplit[]> {
    return getScheduledPaymentSplitsAction(uid, scheduledPaymentId);
  }
  setSplits(uid: string, scheduledPaymentId: string, splits: { personId: string; amount: number }[]): Promise<ScheduledPaymentSplit[]> {
    return setScheduledPaymentSplitsAction(uid, scheduledPaymentId, splits);
  }
}

class IncomeService {
  getAll(uid: string) {
    return getAllIncomesAction(uid);
  }
  create(uid: string, income: Omit<IncomeRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'transactionId'>) {
    return createIncomeRecordAction(uid, income);
  }
}

export const receivableService = new ReceivableService();
export const payableService = new PayableService();
export const scheduledPaymentService = new ScheduledPaymentService();
export const incomeService = new IncomeService();
