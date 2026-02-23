import { useState } from 'react';
import { ArrowUp, ArrowDown, CheckSquare, Square, Trash2, X, Download } from 'lucide-react';
import { NoteCard } from './NoteCard';
import { TrashList } from './TrashList';
import { Pagination } from '../common/Pagination';
import { exportAsMarkdown } from '../../utils/exportNote';

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
  categories,
  pagination,
  onPageChange,
  onDeleteNote
}) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

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

  const noteCount = showTrash ? trashNotes.length : (pagination?.total || notes.length);

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    setSelectedIds(new Set(notes.map(n => n.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 篇笔记吗？`)) return;
    
    for (const id of selectedIds) {
      await onDeleteNote(id);
    }
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleBatchExport = () => {
    const selectedNotes = notes.filter(n => selectedIds.has(n.id));
    selectedNotes.forEach(note => exportAsMarkdown(note));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

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
              {!selectMode ? (
                <>
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
                    {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                  </button>
                  <button
                    onClick={() => setSelectMode(true)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    title="批量选择"
                  >
                    <CheckSquare className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </>
              ) : (
                <button
                  onClick={exitSelectMode}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="取消选择"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {selectMode && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <button
              onClick={selectedIds.size === notes.length ? deselectAll : selectAll}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400"
            >
              {selectedIds.size === notes.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {selectedIds.size === notes.length ? '取消全选' : '全选'}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              已选 {selectedIds.size} 项
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleBatchExport}
              disabled={selectedIds.size === 0}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded disabled:opacity-50"
              title="批量导出"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={selectedIds.size === 0}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded disabled:opacity-50"
              title="批量删除"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}
      
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
                isSelectMode={selectMode}
                checked={selectedIds.has(note.id)}
                onClick={() => onSelectNote(note)}
                onCheck={toggleSelect}
              />
            ))}
          </ul>
        )}
      </div>

      {!showTrash && pagination && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}
