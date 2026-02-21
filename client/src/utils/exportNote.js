export function exportAsMarkdown(note) {
  if (!note) return;
  
  let content = `# ${note.title}\n\n`;
  if (note.tags && note.tags.length > 0) {
    content += `标签: ${note.tags.map(t => t.name || t).join(', ')}\n\n`;
  }
  content += note.content || '';
  
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${note.title}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsPDF(note, contentRef) {
  if (!note || !contentRef?.current) return;
  
  const printWindow = window.open('', '_blank');
  const content = contentRef.current.innerHTML;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${note.title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        h1 { border-bottom: 1px solid #eee; padding-bottom: 10px; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
        pre code { background: none; padding: 0; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      </style>
    </head>
    <body>
      <h1>${note.title}</h1>
      ${content}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
