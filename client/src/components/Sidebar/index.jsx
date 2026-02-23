import { useState, useRef } from 'react';
import { Folder, Plus, Search, Moon, Sun, Trash, FolderPlus, FileUp } from 'lucide-react';
import { SearchInput } from '../common/SearchInput';
import { CategoryList } from './CategoryList';
import { TagCloud } from './TagCloud';
import { importMarkdownFiles } from '../../utils/importNote';

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
  onShowTrash,
  onImportNotes
}) {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImporting(true);
    try {
      const results = await importMarkdownFiles(files, onImportNotes);
      const success = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (failed > 0) {
        alert(`导入完成：成功 ${success} 个，失败 ${failed} 个`);
      } else if (success > 0) {
        alert(`成功导入 ${success} 篇笔记`);
      }
    } catch (error) {
      alert('导入失败：' + error.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
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
    <aside className="h-full bg-gray-100 dark:bg-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Folder className="w-6 h-6" />
          笔记系统
        </h1>
      </div>

      <div className="p-4 space-y-2">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建笔记
          <span className="text-xs opacity-70">(Ctrl+N)</span>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".md"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <FileUp className="w-5 h-5" />
          {importing ? '导入中...' : '导入 Markdown'}
        </button>
      </div>

      <div className="px-4 pb-4">
        <SearchInput value={searchQuery} onChange={onSearchChange} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 min-h-0">
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
