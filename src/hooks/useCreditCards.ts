'use client';

import useSWR from 'swr';
import { creditCardService } from '@/services/credit-card.service';
import { useAuth } from '@/providers/AuthProvider';
import type { CreditCard } from '@/types';

export function useCreditCards() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<CreditCard[]>(
    user?.uid ? ['credit-cards', user.uid] : null,
    () => creditCardService.getAll(user!.uid as string),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  return { creditCards: data ?? [], isLoading, error, mutate };
}
