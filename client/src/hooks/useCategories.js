import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../services/api';

export function useCategories() {
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => categoriesApi.update(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  });

  return {
    categories,
    fetchCategories: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
    createCategory: createMutation.mutateAsync,
    updateCategory: (id, name) => updateMutation.mutateAsync({ id, name }),
    deleteCategory: deleteMutation.mutateAsync
  };
}
