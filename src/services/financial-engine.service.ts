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

  collectReceivable(uid: string, input: { debtId: string; personId: string; contactId?: string; amount: number; accountId: string; date: Date; observations?: string }) {
    return receivableService.registerPayment(uid, {
      debtId: input.debtId,
      personId: input.personId,
      contactId: input.contactId,
      amount: input.amount,
      accountId: input.accountId,
      date: input.date,
      observations: input.observations,
    });
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
