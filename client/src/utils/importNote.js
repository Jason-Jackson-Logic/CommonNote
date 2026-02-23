export function parseMarkdownFile(content, filename) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.md$/i, '');
  
  const tagMatches = content.match(/#(\w+)/g);
  const tags = tagMatches ? [...new Set(tagMatches.map(t => t.slice(1)))] : [];
  
  return {
    title,
    content,
    tags,
    category_id: 1
  };
}

export async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function importMarkdownFiles(files, createNote) {
  const results = [];
  
  for (const file of files) {
    if (!file.name.endsWith('.md')) continue;
    
    try {
      const content = await readFile(file);
      const noteData = parseMarkdownFile(content, file.name);
      const result = await createNote(noteData);
      results.push({ success: true, filename: file.name, id: result.id });
    } catch (error) {
      results.push({ success: false, filename: file.name, error: error.message });
    }
  }
  
  return results;
}
