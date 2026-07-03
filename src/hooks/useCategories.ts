'use client';

import useSWR from 'swr';
import { categoryService } from '@/services/category.service';
import { useAuth } from '@/providers/AuthProvider';

export function useCategories() {
  const { user } = useAuth();
  const { data: categorias = [], isLoading, error, mutate } = useSWR(
    user?.uid ? ['categories', user.uid] : null,
    () => user?.uid ? categoryService.getAll(user.uid) : null,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    categorias,
    isLoading,
    error,
    mutate,
  };
}
