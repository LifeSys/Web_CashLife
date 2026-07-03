'use client';

import useSWR from 'swr';
import { personService } from '@/services/person.service';
import { useAuth } from '@/providers/AuthProvider';

export function usePeople() {
  const { user } = useAuth();
  const { data: personas = [], isLoading, error, mutate } = useSWR(
    user?.uid ? ['people', user.uid] : null,
    () => user?.uid ? personService.getAll(user.uid) : null,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    personas,
    isLoading,
    error,
    mutate,
  };
}

export function usePeopleByType(type: 'PRESTAMISTA' | 'DEUDOR') {
  const { user } = useAuth();
  const { data: personas = [], isLoading, error } = useSWR(
    user?.uid ? ['people-type', user.uid, type] : null,
    () => user?.uid ? personService.getByType(user.uid, type) : null,
    { revalidateOnFocus: false }
  );

  return {
    personas,
    isLoading,
    error,
  };
}
