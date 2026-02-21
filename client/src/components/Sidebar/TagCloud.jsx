export function TagCloud({ tags, selectedTag, onSelectTag }) {
  if (tags.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        标签
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onSelectTag(selectedTag === tag.name ? null : tag.name)}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              selectedTag === tag.name
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            #{tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
