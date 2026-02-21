import { useState } from 'react';
import { Folder, Plus, Search, Moon, Sun, Trash, FolderPlus } from 'lucide-react';
import { SearchInput } from '../common/SearchInput';
import { CategoryList } from './CategoryList';
import { TagCloud } from './TagCloud';

export function Sidebar({ 
  darkMode, 
  onToggleDarkMode,
  categories,
  tags,
  selectedCategory,
  selectedTag,
  showFavorites,
  stats,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onSelectTag,
  onShowFavorites,
  onNewNote,
  onCreateCategory,
  onUpdateCategory,
  showTrash,
  trashCount,
  onShowTrash
}) {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    await onCreateCategory(newCategoryName.trim());
    setNewCategoryName('');
    setShowNewCategory(false);
  };

  const handleStartEdit = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveEdit = async () => {
    if (!editingCategoryName.trim()) return;
    await onUpdateCategory(editingCategoryId, editingCategoryName.trim());
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const categoriesWithEdit = categories.map(cat => ({
    ...cat,
    isEditing: editingCategoryId === cat.id,
    editName: editingCategoryName,
    setEditName: setEditingCategoryName,
    onSave: handleSaveEdit,
    onCancel: () => { setEditingCategoryId(null); setEditingCategoryName(''); }
  }));

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-800 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Folder className="w-6 h-6" />
          笔记系统
        </h1>
      </div>

      <div className="p-4">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建笔记
          <span className="text-xs opacity-70">(Ctrl+N)</span>
        </button>
      </div>

      <div className="px-4 pb-4">
        <SearchInput value={searchQuery} onChange={onSearchChange} />
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            分类
          </h2>
          <button
            onClick={() => setShowNewCategory(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <FolderPlus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {showNewCategory && (
          <div className="mb-2 space-y-1">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCategory();
                if (e.key === 'Escape') { setNewCategoryName(''); setShowNewCategory(false); }
              }}
              placeholder="分类名称"
              className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded dark:text-white"
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={handleCreateCategory}
                className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                添加
              </button>
              <button
                onClick={() => { setNewCategoryName(''); setShowNewCategory(false); }}
                className="flex-1 px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                取消
              </button>
            </div>
          </div>
        )}

        <CategoryList 
          categories={categoriesWithEdit}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          onStartEdit={handleStartEdit}
          stats={stats}
          showFavorites={showFavorites}
          onShowFavorites={onShowFavorites}
          onShowTrash={onShowTrash}
        />

        <ul className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <li>
            <button
              onClick={() => { onShowTrash(true); onSelectCategory(null); onShowFavorites(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                showTrash
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Trash className="w-4 h-4" />
                回收站
              </span>
              <span className="text-xs text-gray-400">{trashCount}</span>
            </button>
          </li>
        </ul>

        {tags.length > 0 && !showTrash && (
          <TagCloud 
            tags={tags} 
            selectedTag={selectedTag}
            onSelectTag={onSelectTag}
          />
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onToggleDarkMode(!darkMode)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {darkMode ? '浅色模式' : '深色模式'}
        </button>
      </div>
    </aside>
  );
}
