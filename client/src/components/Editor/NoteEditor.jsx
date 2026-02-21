import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { NoteForm } from './NoteForm';
import { CodeBlock } from '../common/CodeBlock';
import { getWordStats } from '../../utils/wordStats';
import 'katex/dist/katex.min.css';

export function NoteEditor({
  editForm,
  onChange,
  categories,
  selectedNote,
  onSave,
  onCancel,
  autoSaveStatus
}) {
  const [editorMode, setEditorMode] = useState('split');
  const [tagInput, setTagInput] = useState('');

  const wordStats = getWordStats(editForm.content);

  const handleAddTag = () => {
    const tagName = tagInput.trim();
    if (tagName && !editForm.tags.includes(tagName)) {
      onChange({ ...editForm, tags: [...editForm.tags, tagName] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagName) => {
    onChange({ ...editForm, tags: editForm.tags.filter(t => t !== tagName) });
  };

  return (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        <input
          type="text"
          value={editForm.title}
          onChange={(e) => onChange({ ...editForm, title: e.target.value })}
          placeholder="输入标题..."
          className="flex-1 text-xl font-semibold bg-transparent border-none focus:outline-none dark:text-white"
        />
        
        {autoSaveStatus && (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {autoSaveStatus}
          </span>
        )}
        
        <EditorToolbar editorMode={editorMode} onModeChange={setEditorMode} />
        
        <button
          onClick={() => onSave(false)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          保存
          <span className="text-xs opacity-70">(Ctrl+S)</span>
        </button>
      </div>

      <NoteForm
        categories={categories}
        editForm={editForm}
        onChange={onChange}
        tagInput={tagInput}
        onTagInputChange={setTagInput}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />

      <div className="flex-1 flex overflow-hidden">
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div className={`${editorMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col border-r border-gray-200 dark:border-gray-700`}>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 flex justify-between">
              <span>编辑</span>
              <span>{wordStats.chars} 字符 · {wordStats.lines} 行 · 约 {wordStats.readTime} 分钟阅读</span>
            </div>
            <textarea
              value={editForm.content}
              onChange={(e) => onChange({ ...editForm, content: e.target.value })}
              placeholder="支持 Markdown 语法..."
              className="flex-1 p-4 resize-none bg-transparent border-none focus:outline-none text-gray-800 dark:text-gray-200 leading-relaxed font-mono text-sm"
            />
          </div>
        )}
        
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div className={`${editorMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              预览
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <article className="markdown-body dark:text-gray-200 max-w-3xl">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{ code: CodeBlock }}
                >
                  {editForm.content || '*暂无内容*'}
                </ReactMarkdown>
              </article>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
