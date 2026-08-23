'use client';

import useSWR from 'swr';
import { payableService, receivableService, scheduledPaymentService, incomeService } from '@/services/financial.service';
import { useAuth } from '@/providers/AuthProvider';
import type { IncomeRecord, PayableObligation, ReceivableDebt, ScheduledPayment, ScheduledPaymentPeriod, ScheduledPaymentSplit } from '@/types';

// `data ?? []` crea un array NUEVO en cada render mientras `data` sea
// undefined (sin datos aún) — si algún componente mete ese array en las
// dependencias de un useEffect, entra en loop infinito de renders (pasó con
// useScheduledPaymentSplits + ScheduledPaymentModal). Usar esta misma
// referencia vacía evita el problema de raíz en todos los hooks de abajo.
const EMPTY_ARRAY: never[] = [];

export function useReceivableDebts() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<ReceivableDebt[]>(user?.uid ? ['receivable-debts', user.uid] : null, () => receivableService.getAllDebts(user!.uid as string), { revalidateOnFocus: false, dedupingInterval: 60000 });
  return { debts: data ?? EMPTY_ARRAY, isLoading, error, mutate };
}
export function usePayableObligations() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<PayableObligation[]>(user?.uid ? ['payable-obligations', user.uid] : null, () => payableService.getAllObligations(user!.uid as string), { revalidateOnFocus: false, dedupingInterval: 60000 });
  return { obligations: data ?? EMPTY_ARRAY, isLoading, error, mutate };
}
export function useScheduledPayments() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<ScheduledPayment[]>(user?.uid ? ['scheduled-payments', user.uid] : null, () => scheduledPaymentService.getAll(user!.uid as string), { revalidateOnFocus: false, dedupingInterval: 60000 });
  return { scheduledPayments: data ?? EMPTY_ARRAY, isLoading, error, mutate };
}
export function useScheduledPaymentPeriods(paymentId?: string) {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<ScheduledPaymentPeriod[]>(user?.uid && paymentId ? ['scheduled-payment-periods', user.uid, paymentId] : null, () => scheduledPaymentService.getPeriods(user!.uid as string, paymentId!), { revalidateOnFocus: false, dedupingInterval: 30000 });
  return { periods: data ?? EMPTY_ARRAY, isLoading, error, mutate };
}
export function useScheduledPaymentSplits(scheduledPaymentId?: string) {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<ScheduledPaymentSplit[]>(
    user?.uid && scheduledPaymentId ? ['scheduled-payment-splits', user.uid, scheduledPaymentId] : null,
    () => scheduledPaymentService.getSplits(user!.uid as string, scheduledPaymentId!),
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );
  return { splits: data ?? EMPTY_ARRAY, isLoading, error, mutate };
}
export function useIncomes() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<IncomeRecord[]>(user?.uid ? ['incomes', user.uid] : null, () => incomeService.getAll(user!.uid as string), { revalidateOnFocus: false, dedupingInterval: 60000 });
  return { incomes: data ?? EMPTY_ARRAY, isLoading, error, mutate };
}
