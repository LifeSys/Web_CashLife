import useSWR from 'swr';
import { categoryService } from '@/services/category.service';

export function useCategories() {
  const { data: categorias = [], isLoading, error } = useSWR(
    'categories',
    () => categoryService.getAll(),
    { revalidateOnFocus: false }
  );

  return {
    categorias,
    isLoading,
    error,
  };
}

export function useCategoriesByType(type: 'gasto' | 'ingreso') {
  const { data: categorias = [], isLoading, error } = useSWR(
    ['categories', type],
    () => categoryService.getByType(type),
    { revalidateOnFocus: false }
  );

  return {
    categorias,
    isLoading,
    error,
  };
}
