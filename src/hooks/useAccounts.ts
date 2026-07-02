import useSWR from 'swr';
import { accountService } from '@/services/account.service';

export function useAccounts() {
  const { data: cuentas = [], isLoading, error } = useSWR(
    'accounts',
    () => accountService.getAll(),
    { revalidateOnFocus: false }
  );

  return {
    cuentas,
    isLoading,
    error,
  };
}

export function useAccountBalance() {
  const { data: saldoTotal = 0, isLoading, error } = useSWR(
    'account-balance',
    () => accountService.getTotalBalance(),
    { revalidateOnFocus: false }
  );

  return {
    saldoTotal,
    isLoading,
    error,
  };
}
