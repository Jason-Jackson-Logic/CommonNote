import { notesApi } from '../services/api';

const linkRegex = /\[\[([^\]]+)\]\]/g;

export function parseWikiLinks(content) {
  const links = [];
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  return [...new Set(links)];
}

export function renderContentWithLinks(content, onLinkClick) {
  if (!content) return null;

  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  linkRegex.lastIndex = 0;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    
    const linkTitle = match[1];
    parts.push(
      <button
        key={`link-${key++}`}
        onClick={(e) => {
          e.stopPropagation();
          onLinkClick?.(linkTitle);
        }}
        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-dotted hover:decoration-solid bg-blue-50 dark:bg-blue-900/20 px-1 rounded"
      >
        {linkTitle}
      </button>
    );
    
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

export async function resolveWikiLink(title) {
  const results = await notesApi.searchTitle(title, 1);
  if (results.length > 0) {
    const exactMatch = results.find(r => r.title.toLowerCase() === title.toLowerCase());
    return exactMatch || results[0];
  }
  return null;
}
