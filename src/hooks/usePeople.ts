'use client';

import useSWR from 'swr';
import { personService } from '@/services/person.service';
import { useAuth } from '@/providers/AuthProvider';
import type { Person } from '@/types';

export function usePeople() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<Person[]>(
    user?.uid ? ['people', user.uid] : null,
    () => personService.getAll(user!.uid as string),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  return { personas: data ?? [], contacts: data ?? [], isLoading, error, mutate };
}

export function usePeopleByType(type: 'PRESTAMISTA' | 'DEUDOR') {
  const { user } = useAuth();
  const { data, isLoading, error } = useSWR<Person[]>(
    user?.uid ? ['people-type', user.uid, type] : null,
    () => personService.getByType(user!.uid as string, type),
    { revalidateOnFocus: false }
  );
  return { personas: data ?? [], contacts: data ?? [], isLoading, error };
}
