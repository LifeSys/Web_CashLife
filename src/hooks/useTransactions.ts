'use client';

import useSWR from 'swr';
import { transactionService } from '@/services/transaction.service';
import { useAuth } from '@/providers/AuthProvider';
import type { Transaction } from '@/types';

export function useTransactions() {
  const { user } = useAuth();
  const { data: transacciones = [], isLoading, error, mutate } = useSWR(
    user?.uid ? ['transactions', user.uid] : null,
    () => user?.uid ? transactionService.getAll(user.uid) : null,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    transacciones: transacciones?.items || [],
    isLoading,
    error,
    mutate,
  };
}

export function useTransactionsByDateRange(startDate: Date, endDate: Date) {
  const { user } = useAuth();
  const { data: transacciones = [], isLoading, error } = useSWR(
    user?.uid ? ['transactions-range', user.uid, startDate.toISOString(), endDate.toISOString()] : null,
    () => user?.uid ? transactionService.getByDateRange(user.uid, startDate, endDate) : null,
    { revalidateOnFocus: false }
  );

  return {
    transacciones,
    isLoading,
    error,
  };
}

export function useTransactionsByAccount(accountId: string) {
  const { user } = useAuth();
  const { data: transacciones = [], isLoading, error } = useSWR(
    user?.uid ? ['transactions-account', user.uid, accountId] : null,
    () => user?.uid ? transactionService.getByAccount(user.uid, accountId) : null,
    { revalidateOnFocus: false }
  );

  return {
    transacciones,
    isLoading,
    error,
  };
}
