import { Transaction } from '@/types';
import { transactionService } from './transaction.service';
import { receivableService, payableService, scheduledPaymentService } from './financial.service';

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isDeleted'>;

class FinancialEngineService {
  createIncome(uid: string, input: Omit<TransactionInput, 'tipo'>) {
    return transactionService.create(uid, { ...input, tipo: 'income' });
  }

  createExpense(uid: string, input: Omit<TransactionInput, 'tipo'>) {
    return transactionService.create(uid, { ...input, tipo: 'expense' });
  }

  createTransfer(uid: string, input: Omit<TransactionInput, 'tipo'> & { destinationAccountId: string }) {
    return transactionService.create(uid, { ...input, tipo: 'transfer' });
  }

  async grantLoan(uid: string, input: { personId: string; contactId?: string; description: string; amount: number; accountId: string; date: Date; dueDate?: Date; notes?: string }) {
    const debt = await receivableService.createDebt(uid, {
      personId: input.personId,
      contactId: input.contactId ?? input.personId,
      description: input.description,
      date: input.date,
      dueDate: input.dueDate,
      originalAmount: input.amount,
      notes: input.notes,
    });
    await transactionService.create(uid, {
      monto: input.amount,
      tipo: 'loan',
      descripcion: `Préstamo otorgado: ${input.description}`,
      fecha: input.date,
      cuenta: input.accountId,
      persona: input.personId,
      personId: input.personId,
      contactId: input.contactId ?? input.personId,
      relatedDebtId: debt.id,
      notas: input.notes,
    });
    return debt;
  }

  async receiveLoan(uid: string, input: { creditorName: string; creditorType?: 'person' | 'bank' | 'company' | 'sunat' | 'other'; contactId?: string; personId?: string; description: string; amount: number; accountId: string; date: Date; dueDate?: Date; notes?: string }) {
    const obligation = await payableService.createObligation(uid, {
      creditorName: input.creditorName,
      creditorType: input.creditorType ?? 'person',
      contactId: input.contactId,
      personId: input.personId,
      description: input.description,
      date: input.date,
      dueDate: input.dueDate ?? input.date,
      originalAmount: input.amount,
      notes: input.notes,
    });
    await transactionService.create(uid, {
      monto: input.amount,
      tipo: 'income',
      descripcion: `Préstamo recibido: ${input.description}`,
      fecha: input.date,
      cuenta: input.accountId,
      persona: input.personId,
      personId: input.personId,
      contactId: input.contactId ?? input.personId,
      relatedObligationId: obligation.id,
      notas: input.notes,
    });
    return obligation;
  }

  createReceivable(uid: string, input: { personId: string; contactId?: string; description: string; amount: number; date: Date; dueDate?: Date; notes?: string }) {
    return receivableService.createDebt(uid, { personId: input.personId, contactId: input.contactId ?? input.personId, description: input.description, date: input.date, dueDate: input.dueDate, originalAmount: input.amount, notes: input.notes });
  }

  createPayable(uid: string, input: { creditorName: string; creditorType?: 'person' | 'bank' | 'company' | 'sunat' | 'other'; contactId?: string; personId?: string; description: string; amount: number; date: Date; dueDate?: Date; notes?: string }) {
    return payableService.createObligation(uid, { creditorName: input.creditorName, creditorType: input.creditorType ?? 'person', contactId: input.contactId, personId: input.personId, description: input.description, date: input.date, dueDate: input.dueDate ?? input.date, originalAmount: input.amount, notes: input.notes });
  }

  collectReceivable(uid: string, input: { debtId: string; personId: string; contactId?: string; amount: number; accountId: string; date: Date; observations?: string }) {
    return receivableService.registerPayment(uid, input);
  }

  payObligation(uid: string, input: { obligationId: string; contactId?: string; personId?: string; amount: number; accountId: string; date: Date; observations?: string }) {
    return payableService.registerPayment(uid, input);
  }

  chargeCreditCard(uid: string, input: Omit<TransactionInput, 'tipo' | 'cuenta'> & { creditCardId: string; cuenta?: string }) {
    return transactionService.create(uid, { ...input, cuenta: input.cuenta ?? 'credit-card', tipo: 'credit_card_charge' });
  }

  payCreditCard(uid: string, input: Omit<TransactionInput, 'tipo'> & { creditCardId: string }) {
    return transactionService.create(uid, { ...input, tipo: 'credit_card_payment' });
  }

  payScheduledPayment(uid: string, input: { paymentId: string; period: string; accountId: string; paidAt?: Date }) {
    return scheduledPaymentService.markPeriodAsPaid(uid, input.paymentId, input.period, input.accountId, input.paidAt ?? new Date());
  }
}

export const financialEngine = new FinancialEngineService();
