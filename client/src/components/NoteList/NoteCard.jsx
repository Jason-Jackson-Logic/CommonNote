import { Pin, Star } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export function NoteCard({ note, isSelected, onClick }) {
  return (
    <li
      onClick={onClick}
      className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 dark:bg-gray-800'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-gray-800 dark:text-white line-clamp-1 flex items-center gap-2">
          {note.is_pinned === 1 && <Pin className="w-4 h-4 text-orange-500 flex-shrink-0" />}
          {note.title}
        </h3>
        {note.is_favorite === 1 && (
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
        {note.content || '无内容'}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-gray-400">{formatDate(note.updated_at)}</span>
        {note.category_name && (
          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded dark:text-gray-300">
            {note.category_name}
          </span>
        )}
        {note.tags && note.tags.length > 0 && (
          <span className="text-xs text-gray-400">
            {note.tags.slice(0, 2).map(t => `#${t}`).join(' ')}
          </span>
        )}
      </div>
    </li>
  );
}
