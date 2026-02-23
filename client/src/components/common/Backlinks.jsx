import { useQuery } from '@tanstack/react-query';
import { notesApi } from '../../services/api';
import { Link2 } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export function Backlinks({ noteId, onLinkClick }) {
  const { data: backlinks = [] } = useQuery({
    queryKey: ['backlinks', noteId],
    queryFn: () => notesApi.getBacklinks(noteId),
    enabled: !!noteId
  });

  if (backlinks.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          反向链接 ({backlinks.length})
        </h3>
      </div>
      <ul className="space-y-2">
        {backlinks.map(link => (
          <li key={link.id}>
            <button
              onClick={() => onLinkClick(link.id)}
              className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                {link.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                更新于 {formatDate(link.updated_at)}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
