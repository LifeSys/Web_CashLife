'use client';

import useSWR from 'swr';
import { payableService, receivableService, scheduledPaymentService, incomeService } from '@/services/financial.service';
import { useAuth } from '@/providers/AuthProvider';

export function useReceivableDebts() {
  const { user } = useAuth();
  const { data = [], isLoading, error, mutate } = useSWR(user?.uid ? ['receivable-debts', user.uid] : null, () => user?.uid ? receivableService.getAllDebts(user.uid) : [], { revalidateOnFocus: false, dedupingInterval: 60000 });
  return { debts: data, isLoading, error, mutate };
}
export function usePayableObligations() {
  const { user } = useAuth();
  const { data = [], isLoading, error, mutate } = useSWR(user?.uid ? ['payable-obligations', user.uid] : null, () => user?.uid ? payableService.getAllObligations(user.uid) : [], { revalidateOnFocus: false, dedupingInterval: 60000 });
  return { obligations: data, isLoading, error, mutate };
}
export function useScheduledPayments() {
  const { user } = useAuth();
  const { data = [], isLoading, error, mutate } = useSWR(user?.uid ? ['scheduled-payments', user.uid] : null, () => user?.uid ? scheduledPaymentService.getAll(user.uid) : [], { revalidateOnFocus: false, dedupingInterval: 60000 });
  return { scheduledPayments: data, isLoading, error, mutate };
}
export function useIncomes() {
  const { user } = useAuth();
  const { data = [], isLoading, error, mutate } = useSWR(user?.uid ? ['incomes', user.uid] : null, () => user?.uid ? incomeService.getAll(user.uid) : [], { revalidateOnFocus: false, dedupingInterval: 60000 });
  return { incomes: data, isLoading, error, mutate };
}
