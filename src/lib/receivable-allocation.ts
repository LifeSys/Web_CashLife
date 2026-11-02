import { ReceivableDebt } from '@/types';

type DateLike = Date | string | { toDate(): Date } | undefined | null;

const toTime = (value: DateLike) => {
  if (!value) return Number.POSITIVE_INFINITY;
  const date = typeof value === 'object' && 'toDate' in value ? value.toDate() : new Date(value as Date | string);
  const time = date.getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
};

export interface ReceivableAllocation {
  debt: ReceivableDebt;
  amount: number;
  remaining: number;
}

/** Deudas de un contacto que entran en un abono general: pendientes y en soles. */
export function getAllocatableDebts(debts: ReceivableDebt[], contactId: string) {
  return debts
    .filter((d) => (d.contactId ?? d.personId) === contactId && d.pendingBalance > 0.001 && (d.moneda ?? 'PEN') === 'PEN')
    .sort((a, b) => toTime(a.dueDate ?? a.date) - toTime(b.dueDate ?? b.date) || toTime(a.date) - toTime(b.date));
}

/**
 * Reparte un abono "a cuenta" entre varias deudas, de la más antigua a la
 * más reciente: se van cancelando completas y la última queda con abono parcial.
 */
export function allocateReceivablePayment(debts: ReceivableDebt[], amount: number): ReceivableAllocation[] {
  let left = Math.round(amount * 100) / 100;
  const result: ReceivableAllocation[] = [];
  for (const debt of debts) {
    if (left < 0.01) break;
    const portion = Math.round(Math.min(left, debt.pendingBalance) * 100) / 100;
    if (portion < 0.01) continue;
    left = Math.round((left - portion) * 100) / 100;
    result.push({ debt, amount: portion, remaining: Math.round((debt.pendingBalance - portion) * 100) / 100 });
  }
  return result;
}
