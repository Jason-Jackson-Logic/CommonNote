import { Edit, Columns, Eye } from 'lucide-react';

export function EditorToolbar({ editorMode, onModeChange }) {
  const modes = [
    { key: 'edit', icon: Edit, title: '编辑模式' },
    { key: 'split', icon: Columns, title: '分屏模式 (Ctrl+/)' },
    { key: 'preview', icon: Eye, title: '预览模式' }
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {modes.map(({ key, icon: Icon, title }) => (
        <button
          key={key}
          onClick={() => onModeChange(key)}
          className={`p-1.5 rounded ${editorMode === key ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
          title={title}
        >
          <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      ))}
    </div>
  );
}
