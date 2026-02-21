import { RotateCcw, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export function TrashList({ notes, onRestore, onPermanentDelete }) {
  if (notes.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        回收站是空的
      </div>
    );
  }

  return (
    <ul>
      {notes.map((note) => (
        <li
          key={note.id}
          className="p-4 border-b border-gray-100 dark:border-gray-800"
        >
          <h3 className="font-medium text-gray-800 dark:text-white line-clamp-1">
            {note.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {note.content || '无内容'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">删除于 {formatDate(note.deleted_at)}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onRestore(note.id)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded"
            >
              <RotateCcw className="w-3 h-3" />
              恢复
            </button>
            <button
              onClick={() => onPermanentDelete(note.id)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded"
            >
              <Trash2 className="w-3 h-3" />
              永久删除
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
