import useSWR from 'swr';
import { personService } from '@/services/person.service';

export function usePeople() {
  const { data: personas = [], isLoading, error } = useSWR(
    'people',
    () => personService.getAll(),
    { revalidateOnFocus: false }
  );

  return {
    personas,
    isLoading,
    error,
  };
}

export function useDebtors() {
  const { data: deudores = [], isLoading, error } = useSWR(
    'debtors',
    () => personService.getDebtors(),
    { revalidateOnFocus: false }
  );

  return {
    deudores,
    isLoading,
    error,
  };
}

export function useLenders() {
  const { data: prestamistas = [], isLoading, error } = useSWR(
    'lenders',
    () => personService.getLenders(),
    { revalidateOnFocus: false }
  );

  return {
    prestamistas,
    isLoading,
    error,
  };
}
