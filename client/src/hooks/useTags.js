import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '../services/api';

export function useTags() {
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll
  });

  return { tags, fetchTags: () => {} };
}
