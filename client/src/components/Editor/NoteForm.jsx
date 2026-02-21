import { Pin, Star, X } from 'lucide-react';

export function NoteForm({ 
  categories, 
  editForm, 
  onChange,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag
}) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-500 dark:text-gray-400">分类：</label>
        <select
          value={editForm.category_id}
          onChange={(e) => onChange({ ...editForm, category_id: parseInt(e.target.value) })}
          className="px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onChange({ ...editForm, is_pinned: !editForm.is_pinned })}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
          editForm.is_pinned
            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}
      >
        <Pin className="w-4 h-4" />
        置顶
      </button>

      <button
        onClick={() => onChange({ ...editForm, is_favorite: !editForm.is_favorite })}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
          editForm.is_favorite
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}
      >
        <Star className={`w-4 h-4 ${editForm.is_favorite ? 'fill-current' : ''}`} />
        收藏
      </button>

      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm text-gray-500 dark:text-gray-400">标签：</label>
        {editForm.tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs"
          >
            #{tag}
            <button onClick={() => onRemoveTag(tag)}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddTag())}
            placeholder="添加标签"
            className="w-20 px-2 py-1 text-xs bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
