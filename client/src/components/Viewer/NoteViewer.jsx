import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Pin, Star, Download, Edit3, Trash2, Folder, Tag, FileText, FileDown, ExternalLink, List, X, GripVertical } from 'lucide-react';
import { CodeBlock } from '../common/CodeBlock';
import { formatDate } from '../../utils/formatDate';
import { getWordStats } from '../../utils/wordStats';
import { exportAsMarkdown, exportAsPDF } from '../../utils/exportNote';
import { Backlinks } from '../common/Backlinks';
import { resolveWikiLink } from '../../utils/wikiLinks.jsx';
import { TableOfContents, extractHeadings } from '../common/TableOfContents';
import 'katex/dist/katex.min.css';

function WikiLink({ title, onNavigate }) {
  const [exists, setExists] = useState(null);

  useEffect(() => {
    resolveWikiLink(title).then(result => setExists(!!result));
  }, [title]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onNavigate?.(title);
      }}
      className={`inline-flex items-center gap-0.5 px-1 rounded ${
        exists === false 
          ? 'text-orange-500 hover:text-orange-600 bg-orange-50 dark:bg-orange-900/20' 
          : 'text-blue-500 hover:text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      } underline decoration-dotted hover:decoration-solid`}
    >
      {title}
      {exists === false && <ExternalLink className="w-3 h-3" />}
    </button>
  );
}

function MarkdownContent({ content, onLinkClick }) {
  const WikiLinkComponent = ({ title }) => <WikiLink title={title} onNavigate={onLinkClick} />;

  return (
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
        ),
        p: ({ children }) => {
          if (typeof children === 'string') {
            const parts = [];
            const regex = /\[\[([^\]]+)\]\]/g;
            let lastIndex = 0;
            let match;
            let key = 0;

            while ((match = regex.exec(children)) !== null) {
              if (match.index > lastIndex) {
                parts.push(children.slice(lastIndex, match.index));
              }
              parts.push(<WikiLinkComponent key={key++} title={match[1]} />);
              lastIndex = match.index + match[0].length;
            }

            if (lastIndex < children.length) {
              parts.push(children.slice(lastIndex));
            }

            return parts.length > 0 ? <p>{parts}</p> : <p>{children}</p>;
          }
          return <p>{children}</p>;
        }
      }}
    >
      {content || '*暂无内容*'}
    </ReactMarkdown>
  );
}

export function NoteViewer({ note, onEdit, onDelete, onNavigateToNote }) {
  const contentRef = useRef(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showToc, setShowToc] = useState(false);
  
  // 目录侧边栏宽度状态
  const [tocWidth, setTocWidth] = useState(224); // 默认224px
  const [isTocResizing, setIsTocResizing] = useState(false);
  const tocResizeRef = useRef(null);
  
  // 目录侧边栏拖拽调整宽度
  const startTocResizing = useCallback((e) => {
    e.preventDefault();
    setIsTocResizing(true);
  }, []);
  
  const stopTocResizing = useCallback(() => {
    setIsTocResizing(false);
  }, []);
  
  const resizeToc = useCallback((e) => {
    if (isTocResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 180 && newWidth <= 400) {
        setTocWidth(newWidth);
      }
    }
  }, [isTocResizing]);
  
  useEffect(() => {
    if (isTocResizing) {
      document.addEventListener('mousemove', resizeToc);
      document.addEventListener('mouseup', stopTocResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', resizeToc);
      document.removeEventListener('mouseup', stopTocResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isTocResizing, resizeToc, stopTocResizing]);

  if (!note) return null;

  const wordStats = getWordStats(note.content);
  const headings = useMemo(() => extractHeadings(note.content), [note.content]);
  const hasToc = headings.length > 0;
  
  const handleTocItemClick = useCallback((heading) => {
    const headingElements = contentRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headingElements) {
      const targetIndex = headings.findIndex(h => h.text === heading.text && h.level === heading.level);
      if (targetIndex >= 0 && headingElements[targetIndex]) {
        headingElements[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [headings]);

  const handleLinkClick = async (titleOrId) => {
    if (typeof titleOrId === 'number') {
      onNavigateToNote?.(titleOrId);
      return;
    }
    
    const result = await resolveWikiLink(titleOrId);
    if (result) {
      onNavigateToNote?.(result.id);
    }
  };

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

      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 items-center">
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
        <span className="flex-1">
          {wordStats.chars} 字符 · 约 {wordStats.readTime} 分钟阅读
        </span>
        {hasToc && (
          <button
            onClick={() => setShowToc(!showToc)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              showToc 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={showToc ? '隐藏目录' : '显示目录'}
          >
            <List className="w-4 h-4" />
            目录
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto p-6" ref={contentRef}>
          <article className="markdown-body dark:text-gray-200 max-w-3xl pb-4 h-fit">
            <MarkdownContent content={note.content} onLinkClick={handleLinkClick} />
          </article>
          <Backlinks noteId={note.id} onLinkClick={handleLinkClick} />
        </div>
        
        {/* 目录侧边栏 */}
        {showToc && hasToc && (
          <div 
            className="flex-shrink-0 overflow-hidden border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 relative"
            style={{ width: `${tocWidth}px` }}
          >
            <div className="h-full flex flex-col">
              <div className="overflow-y-auto p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">目录</h3>
                  </div>
                  <button
                    onClick={() => setShowToc(false)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                <TableOfContents 
                  content={note.content} 
                  onItemClick={handleTocItemClick}
                />
              </div>
            </div>
            
            {/* 拖拽调整宽度的分隔条 */}
            <div
              ref={tocResizeRef}
              onMouseDown={startTocResizing}
              className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors z-10 group"
              style={{ backgroundColor: isTocResizing ? 'rgb(96, 165, 250)' : 'transparent' }}
            >
              <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-3 h-6 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}