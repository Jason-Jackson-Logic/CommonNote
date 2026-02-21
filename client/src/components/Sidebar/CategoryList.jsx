import { FolderPlus, Folder, Heart } from 'lucide-react';

export function CategoryList({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  onStartEdit,
  stats,
  showFavorites,
  onShowFavorites,
  onShowTrash
}) {
  return (
    <ul className="space-y-1">
      <li>
        <button
          onClick={() => { onSelectCategory(null); onShowFavorites(false); onShowTrash(false); }}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
            selectedCategory === null && !showFavorites
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <span>全部笔记</span>
          <span className="text-xs text-gray-400">{stats.total}</span>
        </button>
      </li>
      <li>
        <button
          onClick={() => { onShowFavorites(true); onSelectCategory(null); onShowTrash(false); }}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
            showFavorites
              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            收藏
          </span>
          <span className="text-xs text-gray-400">{stats.favorites}</span>
        </button>
      </li>
      {categories.map((category) => (
        <li key={category.id}>
          {category.isEditing ? (
            <div className="px-3 py-2 bg-blue-50 dark:bg-gray-700 rounded-lg space-y-2">
              <input
                type="text"
                value={category.editName}
                onChange={(e) => category.setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') category.onSave();
                  if (e.key === 'Escape') category.onCancel();
                }}
                className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-blue-300 dark:border-gray-500 rounded dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-1">
                <button
                  onClick={category.onSave}
                  className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  保存
                </button>
                <button
                  onClick={category.onCancel}
                  className="flex-1 px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onSelectCategory(category.id); onShowFavorites(false); onShowTrash(false); }}
              onDoubleClick={() => onStartEdit(category)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                selectedCategory === category.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="双击可重命名"
            >
              <span>{category.name}</span>
              <span className="text-xs text-gray-400">{category.note_count}</span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
