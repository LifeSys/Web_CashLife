import useSWR from 'swr';
import { transactionService } from '@/services/transaction.service';
import type { Transaction } from '@/types';

export function useTransactions() {
  const { data: transacciones = [], isLoading, error } = useSWR(
    'transactions',
    () => transactionService.getAll(),
    { revalidateOnFocus: false }
  );

  return {
    transacciones,
    isLoading,
    error,
  };
}

export function useTransactionsByDateRange(startDate: Date, endDate: Date) {
  const { data: transacciones = [], isLoading, error } = useSWR(
    ['transactions-range', startDate.toISOString(), endDate.toISOString()],
    () => transactionService.getByDateRange(startDate, endDate),
    { revalidateOnFocus: false }
  );

  return {
    transacciones,
    isLoading,
    error,
  };
}

export function useTransactionsByAccount(accountId: string) {
  const { data: transacciones = [], isLoading, error } = useSWR(
    ['transactions-account', accountId],
    () => transactionService.getByAccount(accountId),
    { revalidateOnFocus: false }
  );

  return {
    transacciones,
    isLoading,
    error,
  };
}
