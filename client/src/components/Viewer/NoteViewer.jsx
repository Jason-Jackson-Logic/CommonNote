import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Pin, Star, Download, Edit3, Trash2, Folder, Tag, FileText, FileDown } from 'lucide-react';
import { CodeBlock } from '../common/CodeBlock';
import { formatDate } from '../../utils/formatDate';
import { getWordStats } from '../../utils/wordStats';
import { exportAsMarkdown, exportAsPDF } from '../../utils/exportNote';
import 'katex/dist/katex.min.css';

export function NoteViewer({ note, onEdit, onDelete }) {
  const contentRef = useRef(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (!note) return null;

  const wordStats = getWordStats(note.content);

  return (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {note.is_pinned === 1 && <Pin className="w-5 h-5 text-orange-500" />}
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {note.title}
          </h1>
          {note.is_favorite === 1 && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Download className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              导出
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-40">
                <button
                  onClick={() => { exportAsMarkdown(note); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FileText className="w-4 h-4" />
                  导出为 Markdown
                </button>
                <button
                  onClick={() => { exportAsPDF(note, contentRef); setShowExportMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FileDown className="w-4 h-4" />
                  导出为 PDF
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            title="编辑"
          >
            <Edit3 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
            title="删除"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>创建于 {formatDate(note.created_at)}</span>
        <span>更新于 {formatDate(note.updated_at)}</span>
        {note.category_name && (
          <span className="flex items-center gap-1">
            <Folder className="w-4 h-4" />
            {note.category_name}
          </span>
        )}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            {note.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
        <span className="ml-auto">
          {wordStats.chars} 字符 · 约 {wordStats.readTime} 分钟阅读
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6" ref={contentRef}>
        <article className="markdown-body dark:text-gray-200 max-w-3xl pb-4 h-fit">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{ code: CodeBlock }}
          >
            {note.content || '*暂无内容*'}
          </ReactMarkdown>
        </article>
      </div>
    </>
  );
}
