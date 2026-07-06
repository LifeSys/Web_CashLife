/**
 * Tipos de transacciones financieras
 * NO usar strings directamente, siempre usar este enum
 */
export enum TransactionType {
  EXPENSE = 'expense',      // Gasto
  INCOME = 'income',        // Ingreso
  TRANSFER = 'transfer',    // Transferencia entre cuentas
  LOAN = 'loan',            // Préstamo otorgado
  LOAN_PAYMENT = 'loan_payment', // Pago de deuda
  CREDIT_CARD_PAYMENT = 'credit_card_payment', // Pago de tarjeta
}

/**
 * Labels legibles para el usuario (en español)
 */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.EXPENSE]: 'Gasto',
  [TransactionType.INCOME]: 'Ingreso',
  [TransactionType.TRANSFER]: 'Transferencia',
  [TransactionType.LOAN]: 'Préstamo',
  [TransactionType.LOAN_PAYMENT]: 'Pago de deuda',
  [TransactionType.CREDIT_CARD_PAYMENT]: 'Pago de tarjeta',
};

/**
 * Iconos para cada tipo de transacción
 */
export const TRANSACTION_TYPE_ICONS: Record<TransactionType, string> = {
  [TransactionType.EXPENSE]: 'TrendingDown',
  [TransactionType.INCOME]: 'TrendingUp',
  [TransactionType.TRANSFER]: 'ArrowRightLeft',
  [TransactionType.LOAN]: 'Hand',
  [TransactionType.LOAN_PAYMENT]: 'CheckCircle2',
  [TransactionType.CREDIT_CARD_PAYMENT]: 'CreditCard',
};

/**
 * Colores para cada tipo de transacción
 */
export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  [TransactionType.EXPENSE]: '#EF4444',   // Rojo
  [TransactionType.INCOME]: '#22C55E',    // Verde
  [TransactionType.TRANSFER]: '#3B82F6',  // Azul
  [TransactionType.LOAN]: '#F59E0B',      // Ámbar
  [TransactionType.LOAN_PAYMENT]: '#10B981', // Verde oscuro
  [TransactionType.CREDIT_CARD_PAYMENT]: '#6366F1',
};
