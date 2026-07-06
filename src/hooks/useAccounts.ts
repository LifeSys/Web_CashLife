'use client';

import useSWR from 'swr';
import { accountService } from '@/services/account.service';
import { useAuth } from '@/providers/AuthProvider';
import type { Account } from '@/types';

export function useAccounts() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<Account[]>(
    user?.uid ? ['accounts', user.uid] : null,
    () => accountService.getAll(user!.uid as string),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  return { cuentas: data ?? [], isLoading, error, mutate };
}

export function useAccountBalance() {
  const { user } = useAuth();
  const { data, isLoading, error } = useSWR<number>(
    user?.uid ? ['account-balance', user.uid] : null,
    () => accountService.getTotalBalance(user!.uid as string),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  return { saldoTotal: data ?? 0, isLoading, error };
}
