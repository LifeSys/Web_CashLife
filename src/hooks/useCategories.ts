'use client';

import useSWR from 'swr';
import { categoryService } from '@/services/category.service';
import { useAuth } from '@/providers/AuthProvider';
import type { Category } from '@/types';

export function useCategories() {
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useSWR<Category[]>(
    user?.uid ? ['categories', user.uid] : null,
    () => categoryService.getAll(user!.uid as string),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );
  return { categorias: data ?? [], isLoading, error, mutate };
}
