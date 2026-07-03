export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income',
  TRANSFER = 'transfer',
  LOAN = 'loan',
  LOAN_PAYMENT = 'loan_payment',
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.EXPENSE]: 'Gasto',
  [TransactionType.INCOME]: 'Ingreso',
  [TransactionType.TRANSFER]: 'Transferencia',
  [TransactionType.LOAN]: 'Préstamo',
  [TransactionType.LOAN_PAYMENT]: 'Pago de Préstamo',
};
