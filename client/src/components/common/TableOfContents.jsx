import { useState, useEffect } from 'react';
import { List } from 'lucide-react';

export function extractHeadings(content) {
  if (!content) return [];
  
  const headings = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        id: `heading-${index}-${match[2].trim().toLowerCase().replace(/\s+/g, '-')}`
      });
    }
  });
  
  return headings;
}

export function TableOfContents({ content, onItemClick }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setHeadings(extractHeadings(content));
  }, [content]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map(h => h.level));

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <List className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">目录</h3>
      </div>
      <nav className="space-y-1">
        {headings.map((heading, index) => {
          const indent = heading.level - minLevel;
          return (
            <button
              key={index}
              onClick={() => onItemClick?.(heading)}
              className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                activeId === heading.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              style={{ paddingLeft: `${indent * 12 + 8}px` }}
            >
              <span className="truncate">{heading.text}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
