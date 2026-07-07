'use client';

import useSWR from 'swr';
import { transactionService } from '@/services/transaction.service';
import { useAuth } from '@/providers/AuthProvider';
import type { Transaction } from '@/types';
import { useEffect } from 'react';

export function useTransactions() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR(
    user?.uid ? ['transactions', user.uid] : null,
    () => transactionService.getAll(user!.uid as string),
    { 
      revalidateOnFocus: true, 
      revalidateOnReconnect: true,
      dedupingInterval: 5000 
    }
  );

  // Refetch every 10 seconds to stay in sync with Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const interval = setInterval(() => {
      mutate();
    }, 10000);
    return () => clearInterval(interval);
  }, [user?.uid, mutate]);

  return { transacciones: data?.items ?? [], hasMore: data?.hasMore ?? false, isLoading, error, mutate };
}

export function useTransactionsByDateRange(startDate: Date, endDate: Date) {
  const { user } = useAuth();
  const { data, isLoading, error } = useSWR<Transaction[]>(
    user?.uid ? ['transactions-range', user.uid, startDate.toISOString(), endDate.toISOString()] : null,
    () => transactionService.getByDateRange(user!.uid as string, startDate, endDate),
    { revalidateOnFocus: false }
  );
  return { transacciones: data ?? [], isLoading, error };
}

export function useTransactionsByAccount(accountId: string) {
  const { user } = useAuth();
  const { data, isLoading, error } = useSWR<Transaction[]>(
    user?.uid && accountId ? ['transactions-account', user.uid, accountId] : null,
    () => transactionService.getByAccount(user!.uid as string, accountId),
    { revalidateOnFocus: false }
  );
  return { transacciones: data ?? [], isLoading, error };
}
