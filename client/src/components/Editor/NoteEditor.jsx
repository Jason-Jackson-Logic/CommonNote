import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ArrowLeft, Save, Clock, Image } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { NoteForm } from './NoteForm';
import { CodeBlock } from '../common/CodeBlock';
import { getWordStats } from '../../utils/wordStats';
import { uploadApi } from '../../services/api';
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
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const editorScrollRef = useRef(null);
  const previewScrollRef = useRef(null);
  const isSyncingRef = useRef(false);

  const wordStats = getWordStats(editForm.content);

  // 同步滚动函数
  const syncScroll = useCallback((sourceRef, targetRef) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    const source = sourceRef.current;
    const target = targetRef.current;
    
    if (!source || !target) {
      isSyncingRef.current = false;
      return;
    }
    
    const scrollRatio = source.scrollTop / (source.scrollHeight - source.clientHeight);
    const targetScrollTop = scrollRatio * (target.scrollHeight - target.clientHeight);
    
    target.scrollTop = targetScrollTop;
    
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, []);
  
  const handleEditorScroll = useCallback(() => {
    syncScroll(editorScrollRef, previewScrollRef);
  }, [syncScroll]);
  
  const handlePreviewScroll = useCallback(() => {
    syncScroll(previewScrollRef, editorScrollRef);
  }, [syncScroll]);

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

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = editForm.content || '';
    const newContent = content.slice(0, start) + text + content.slice(end);
    onChange({ ...editForm, content: newContent });
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await uploadImage(file);
        }
        break;
      }
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        const result = await uploadApi.uploadImage(base64);
        
        if (result.url) {
          const imageMarkdown = `![${file.name || 'image'}](${result.url})`;
          insertAtCursor(imageMarkdown);
        } else {
          alert('上传失败：' + (result.error || '未知错误'));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('上传失败：' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e) => {
    const files = e.dataTransfer?.files;
    if (!files) return;

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        await uploadImage(file);
      }
    }
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
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span>编辑 {uploading && <span className="text-blue-500 ml-2">上传中...</span>}</span>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-1 hover:text-blue-500">
                  <Image className="w-4 h-4" />
                  <span>图片</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0])}
                  />
                </label>
                <span>{wordStats.chars} 字符 · {wordStats.lines} 行 · 约 {wordStats.readTime} 分钟阅读</span>
              </div>
            </div>
            <div 
              ref={editorScrollRef}
              className="flex-1 min-h-0 overflow-y-auto"
              onScroll={editorMode === 'split' ? handleEditorScroll : undefined}
            >
              <textarea
                ref={textareaRef}
                value={editForm.content}
                onChange={(e) => onChange({ ...editForm, content: e.target.value })}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                placeholder="支持 Markdown 语法，可粘贴或拖拽图片..."
                className="w-full h-full p-4 resize-none bg-transparent border-none focus:outline-none text-gray-800 dark:text-gray-200 leading-relaxed font-mono text-sm"
              />
            </div>
          </div>
        )}
        
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div className={`${editorMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              预览
            </div>
            <div 
              ref={previewScrollRef}
              className="flex-1 min-h-0 overflow-y-auto p-4"
              onScroll={editorMode === 'split' ? handlePreviewScroll : undefined}
            >
              <article className="markdown-body dark:text-gray-200 max-w-3xl">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code: CodeBlock,
                    img: ({ src, alt }) => (
                      <img 
                        src={src} 
                        alt={alt || '图片'} 
                        className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          console.warn(`图片加载失败: ${src}`);
                        }}
                      />
                    )
                  }}
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