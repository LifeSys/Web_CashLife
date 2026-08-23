'use client';

import { useMemo } from 'react';
import { usePeople } from './usePeople';
import { useReceivableDebts, usePayableObligations } from './useFinancial';
import { toPenEquivalent } from '@/lib/currency';
import type { Person } from '@/types';

/** Días sin recordatorio antes de considerar que "toca seguirle". */
export const FOLLOW_UP_DAYS = 7;

export interface CollectionRow {
  contact: Person;
  /** meDebe - leDebo. Solo se listan los > 0 (te deben en neto). */
  netBalance: number;
  /** null = nunca se le mandó recordatorio. */
  daysSinceReminder: number | null;
  needsFollowUp: boolean;
}

/**
 * Agrega deudas/obligaciones por persona para saber quién te debe en neto
 * y a quién le toca escribirle. Compartido entre el dashboard, Cuentas por
 * Cobrar y la ficha de contacto para no repetir el cálculo tres veces.
 */
export function useCollectionReminders() {
  const { contacts, mutate: mutatePeople, isLoading: loadingPeople } = usePeople();
  const { debts, isLoading: loadingDebts } = useReceivableDebts();
  const { obligations, isLoading: loadingObligations } = usePayableObligations();

  const rows = useMemo<CollectionRow[]>(() => {
    return contacts
      .map((contact) => {
        const receivable = debts.filter((d) => (d.contactId ?? d.personId) === contact.id).reduce((s, d) => s + toPenEquivalent(d.pendingBalance, d.tipoCambio), 0);
        const payable = obligations.filter((o) => (o.contactId ?? o.personId) === contact.id).reduce((s, o) => s + toPenEquivalent(o.pendingBalance, o.tipoCambio), 0);
        const netBalance = receivable - payable;
        const lastReminder = contact.lastReminderAt ? new Date(contact.lastReminderAt as unknown as string) : null;
        const daysSinceReminder = lastReminder
          ? Math.floor((Date.now() - lastReminder.getTime()) / (1000 * 60 * 60 * 24))
          : null;
        const needsFollowUp = netBalance > 0 && (daysSinceReminder === null || daysSinceReminder >= FOLLOW_UP_DAYS);
        return { contact, netBalance, daysSinceReminder, needsFollowUp };
      })
      .filter((row) => row.netBalance > 0)
      .sort((a, b) => (b.daysSinceReminder ?? Infinity) - (a.daysSinceReminder ?? Infinity));
  }, [contacts, debts, obligations]);

  return {
    rows,
    followUpRows: rows.filter((r) => r.needsFollowUp),
    isLoading: loadingPeople || loadingDebts || loadingObligations,
    mutatePeople,
  };
}
