export function getWordStats(content) {
  if (!content) return { chars: 0, words: 0, lines: 0, readTime: 0 };
  const chars = content.length;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lines = content.split('\n').length;
  const readTime = Math.ceil(chars / 500);
  return { chars, words, lines, readTime };
}
