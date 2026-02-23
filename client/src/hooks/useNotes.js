import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, trashApi, statsApi } from '../services/api';

export function useNotes(options = {}) {
  const queryClient = useQueryClient();

  const queryKey = ['notes', options];

  const { data: result, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = {};
      if (options.categoryId) params.category_id = options.categoryId;
      if (options.search) params.search = options.search;
      if (options.tag) params.tag = options.tag;
      if (options.favorites) params.favorites = 'true';
      if (options.page) params.page = options.page;
      if (options.pageSize) params.pageSize = options.pageSize;

      const response = await notesApi.getAll(params);

      if (response.data && response.pagination) {
        const sortedData = [...response.data].sort((a, b) => {
          // 优先按置顶排序：置顶的笔记永远在前面
          if(a.is_pinned !== b.is_pinned) {
            return b.is_pinned - a.is_pinned;
          }
          
          let aVal, bVal;
          switch (options.sortBy) {
            case 'title':
              aVal = a.title.toLowerCase();
              bVal = b.title.toLowerCase();
              break;
            case 'created_at':
              aVal = new Date(a.created_at).getTime();
              bVal = new Date(b.created_at).getTime();
              break;
              break;
            case 'updated_at':
            default:
              aVal = new Date(a.updated_at).getTime();
              bVal = new Date(b.updated_at).getTime();
          }
          return options.sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
        return { data: sortedData, pagination: response.pagination };
      }

      return { data: Array.isArray(response) ? response : [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
    }
  });

  const createMutation = useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => notesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['trash'] });
    }
  });

  return {
    notes: result?.data || [],
    pagination: result?.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    loading: isLoading,
    fetchNotes: refetch,
    createNote: createMutation.mutateAsync,
    updateNote: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteNote: deleteMutation.mutateAsync,
    getNote: notesApi.getOne
  };
}

export function useTrash() {
  const queryClient = useQueryClient();

  const { data: trashNotes = [] } = useQuery({
    queryKey: ['trash'],
    queryFn: trashApi.getAll
  });

  const restoreMutation = useMutation({
    mutationFn: trashApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: trashApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  const emptyMutation = useMutation({
    mutationFn: trashApi.empty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    }
  });

  return {
    trashNotes,
    fetchTrash: () => queryClient.invalidateQueries({ queryKey: ['trash'] }),
    restoreNote: restoreMutation.mutateAsync,
    permanentDelete: deleteMutation.mutateAsync,
    emptyTrash: emptyMutation.mutateAsync
  };
}

export function useStats() {
  const { data: stats = { total: 0, favorites: 0, trash: 0 } } = useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.get
  });

  return { stats, fetchStats: () => {} };
}
