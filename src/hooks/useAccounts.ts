'use client';

import useSWR from 'swr';
import { accountService } from '@/services/account.service';
import { useAuth } from '@/providers/AuthProvider';

export function useAccounts() {
  const { user } = useAuth();
  const { data: cuentas = [], isLoading, error, mutate } = useSWR(
    user?.uid ? ['accounts', user.uid] : null,
    () => user?.uid ? accountService.getAll(user.uid) : null,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    cuentas,
    isLoading,
    error,
    mutate,
  };
}

export function useAccountBalance() {
  const { user } = useAuth();
  const { data: saldoTotal = 0, isLoading, error } = useSWR(
    user?.uid ? ['account-balance', user.uid] : null,
    () => user?.uid ? accountService.getTotalBalance(user.uid) : null,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    saldoTotal,
    isLoading,
    error,
  };
}
