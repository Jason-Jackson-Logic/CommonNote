import { ArrowUp, ArrowDown } from 'lucide-react';
import { NoteCard } from './NoteCard';
import { TrashList } from './TrashList';

export function NoteList({ 
  notes, 
  trashNotes,
  showTrash,
  selectedNote,
  onSelectNote,
  onRestoreNote,
  onPermanentDelete,
  onEmptyTrash,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  selectedCategory,
  selectedTag,
  showFavorites,
  categories
}) {
  const getTitle = () => {
    if (showTrash) return '回收站';
    if (showFavorites) return '收藏的笔记';
    if (selectedTag) return `#${selectedTag}`;
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory);
      return cat ? cat.name : '分类';
    }
    return '全部笔记';
  };

  const noteCount = showTrash ? trashNotes.length : notes.length;

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">
              {getTitle()}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {noteCount} 篇笔记
            </p>
          </div>
          
          {!showTrash && notes.length > 0 && (
            <div className="flex items-center gap-1">
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="text-xs bg-gray-100 dark:bg-gray-800 border-none rounded px-2 py-1 dark:text-white"
              >
                <option value="updated_at">更新时间</option>
                <option value="created_at">创建时间</option>
                <option value="title">标题</option>
              </select>
              <button
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title={sortOrder === 'asc' ? '升序' : '降序'}
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {showTrash && trashNotes.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onEmptyTrash}
            className="text-sm text-red-500 hover:text-red-600"
          >
            清空回收站
          </button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {showTrash ? (
          <TrashList 
            notes={trashNotes}
            onRestore={onRestoreNote}
            onPermanentDelete={onPermanentDelete}
          />
        ) : notes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            暂无笔记
          </div>
        ) : (
          <ul>
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedNote?.id === note.id}
                onClick={() => onSelectNote(note)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
