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
    // Sin `limit`, el repositorio pagina a 20 por defecto — y como este
    // hook alimenta el Resumen Financiero, Reportes y el conteo de
    // Movimientos, eso hacía que todo lo calculado ignorara silenciosamente
    // cualquier transacción más allá de las 20 más recientes. Pedimos un
    // límite alto para traer prácticamente todo (uso personal, no miles
    // de movimientos por año).
    () => transactionService.getAll(user!.uid as string, { limit: 5000 }),
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
