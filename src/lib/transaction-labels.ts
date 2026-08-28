/**
 * Traducción de `Transaction.tipo` a texto legible en español.
 *
 * El tipo oficial declarado en `src/types/index.ts` no coincide con todos
 * los valores que de verdad se guardan en la base de datos (distintas
 * partes del código fueron agregando variantes con el tiempo: 'card_payment'
 * vs 'credit_card_payment', 'card_purchase' vs 'credit_card_charge', etc.),
 * así que este mapa cubre TODOS los valores reales encontrados en el
 * código y en la base — cualquier tipo nuevo que se agregue debe sumarse
 * aquí también, o se mostrará el texto crudo (ej. "credit_card_charge") en
 * vez de una etiqueta legible.
 */
const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  expense: 'Gasto',
  gasto: 'Gasto',
  income: 'Ingreso',
  ingreso: 'Ingreso',
  transfer: 'Transferencia',
  card_purchase: 'Compra con tarjeta',
  credit_card_charge: 'Compra con tarjeta',
  card_payment: 'Pago de tarjeta',
  credit_card_payment: 'Pago de tarjeta',
  credit_card_refund: 'Devolución de tarjeta',
  loan: 'Préstamo otorgado',
  loan_payment: 'Cobro de préstamo',
  receivable_created: 'Cuenta por cobrar creada',
  receivable_debt: 'Cuenta por cobrar',
  receivable_paid: 'Cobro recibido',
  receivable_payment: 'Cobro recibido',
  payable_created: 'Cuenta por pagar creada',
  payable_obligation: 'Cuenta por pagar',
  payable_paid: 'Pago realizado',
  payable_payment: 'Pago realizado',
  scheduled_execution: 'Pago programado',
  scheduled_payment: 'Pago programado',
};

export function getTransactionTypeLabel(tipo: string): string {
  return TRANSACTION_TYPE_LABELS[tipo] ?? 'Movimiento';
}
