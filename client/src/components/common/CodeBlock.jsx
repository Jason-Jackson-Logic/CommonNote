import { useEffect } from 'react';
import hljs from 'highlight.js';

export function CodeBlock({ node, inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  
  useEffect(() => {
    if (!inline && language) {
      hljs.highlightAll();
    }
  });
  
  if (!inline) {
    return (
      <div className="relative group">
        {language && (
          <span className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
            {language}
          </span>
        )}
        <pre className="!p-4 rounded-lg overflow-x-auto bg-gray-100 dark:bg-gray-800">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  }
  
  return <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded" {...props}>{children}</code>;
}
