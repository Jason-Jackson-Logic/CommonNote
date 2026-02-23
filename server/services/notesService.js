const { queryAll, queryOne, runSql } = require('../database');

function handleTags(noteId, tags) {
  for (const tagName of tags) {
    runSql('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName]);
    const tag = queryOne('SELECT id FROM tags WHERE name = ?', [tagName]);
    if (tag) {
      runSql('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)', [noteId, tag.id]);
    }
  }
}

function processNotes(notes) {
  return notes.map(note => ({
    ...note,
    is_pinned: note.is_pinned || 0,
    is_favorite: note.is_favorite || 0,
    tags: note.tags ? note.tags.split(',') : []
  }));
}

function buildNotesQuery(options = {}) {
  const { category_id, search, tag, favorites, page = 1, pageSize = 20 } = options;
  
  let sql = `
    SELECT DISTINCT n.id, n.title, n.content, n.category_id, n.is_pinned, n.is_favorite,
      n.is_deleted, n.created_at, n.updated_at, c.name as category_name,
      GROUP_CONCAT(t.name) as tags
    FROM notes n
    LEFT JOIN categories c ON n.category_id = c.id
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
  `;
  
  const conditions = ['n.is_deleted = 0'];
  const params = [];

  if (category_id) {
    conditions.push('n.category_id = ?');
    params.push(category_id);
  }

  if (search) {
    conditions.push('(n.title LIKE ? OR n.content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (tag) {
    conditions.push('t.name = ?');
    params.push(tag);
  }

  if (favorites === 'true') {
    conditions.push('n.is_favorite = 1');
  }

  sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' GROUP BY n.id ORDER BY n.is_pinned DESC, n.updated_at DESC';

  return { sql, params, page: parseInt(page), pageSize: parseInt(pageSize) };
}

function getAll(options = {}) {
  const { sql, params, page, pageSize } = buildNotesQuery(options);
  
  const countSql = `SELECT COUNT(DISTINCT n.id) as total FROM notes n 
    LEFT JOIN note_tags nt ON n.id = nt.note_id 
    LEFT JOIN tags t ON nt.tag_id = t.id 
    WHERE n.is_deleted = 0${options.category_id ? ' AND n.category_id = ?' : ''}${
      options.search ? ' AND (n.title LIKE ? OR n.content LIKE ?)' : ''
    }${options.tag ? ' AND t.name = ?' : ''}${
      options.favorites === 'true' ? ' AND n.is_favorite = 1' : ''
    }`;
  
  const countParams = [];
  if (options.category_id) countParams.push(options.category_id);
  if (options.search) countParams.push(`%${options.search}%`, `%${options.search}%`);
  if (options.tag) countParams.push(options.tag);
  
  const countResult = queryOne(countSql, countParams);
  const total = countResult ? countResult.total : 0;
  
  const offset = (page - 1) * pageSize;
  const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
  
  const notes = queryAll(paginatedSql, [...params, pageSize, offset]);
  
  return {
    data: processNotes(notes),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

function getOne(id) {
  const note = queryOne(`
    SELECT n.*, c.name as category_name
    FROM notes n
    LEFT JOIN categories c ON n.category_id = c.id
    WHERE n.id = ?
  `, [id]);

  if (!note) return null;

  const tags = queryAll(`
    SELECT t.id, t.name
    FROM tags t
    JOIN note_tags nt ON t.id = nt.tag_id
    WHERE nt.note_id = ?
  `, [id]);

  return { 
    ...note, 
    is_pinned: note.is_pinned || 0,
    is_favorite: note.is_favorite || 0,
    tags 
  };
}

function create(data) {
  const { title, content, category_id, tags, is_pinned, is_favorite } = data;
  
  const result = runSql(
    'INSERT INTO notes (title, content, category_id, is_pinned, is_favorite) VALUES (?, ?, ?, ?, ?)',
    [title, content || '', category_id || 1, is_pinned ? 1 : 0, is_favorite ? 1 : 0]
  );

  const noteId = result.lastInsertRowid;

  if (tags && tags.length > 0) {
    handleTags(noteId, tags);
  }

  return { id: noteId };
}

function update(id, data) {
  const { title, content, category_id, tags, is_pinned, is_favorite } = data;
  
  const note = queryOne('SELECT * FROM notes WHERE id = ?', [id]);
  if (!note) return { error: '笔记不存在' };

  runSql(`
    UPDATE notes 
    SET title = ?, content = ?, category_id = ?, is_pinned = ?, is_favorite = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    title || note.title,
    content !== undefined ? content : note.content,
    category_id !== undefined ? category_id : note.category_id,
    is_pinned !== undefined ? (is_pinned ? 1 : 0) : note.is_pinned,
    is_favorite !== undefined ? (is_favorite ? 1 : 0) : note.is_favorite,
    id
  ]);

  if (tags !== undefined) {
    runSql('DELETE FROM note_tags WHERE note_id = ?', [id]);
    if (tags.length > 0) {
      handleTags(id, tags);
    }
  }

  return { message: '更新成功' };
}

function softDelete(id) {
  const note = queryOne('SELECT * FROM notes WHERE id = ?', [id]);
  if (!note) return { error: '笔记不存在' };

  runSql(
    'UPDATE notes SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id]
  );

  return { message: '已移入回收站' };
}

function getTrash() {
  return queryAll(`
    SELECT n.id, n.title, n.content, n.category_id, n.deleted_at, 
      n.created_at, n.updated_at, c.name as category_name
    FROM notes n
    LEFT JOIN categories c ON n.category_id = c.id
    WHERE n.is_deleted = 1
    ORDER BY n.deleted_at DESC
  `);
}

function restore(id) {
  const note = queryOne('SELECT * FROM notes WHERE id = ? AND is_deleted = 1', [id]);
  if (!note) return { error: '笔记不存在' };

  runSql(
    'UPDATE notes SET is_deleted = 0, deleted_at = NULL WHERE id = ?',
    [id]
  );

  return { message: '恢复成功' };
}

function permanentDelete(id) {
  const note = queryOne('SELECT * FROM notes WHERE id = ? AND is_deleted = 1', [id]);
  if (!note) return { error: '笔记不存在' };

  runSql('DELETE FROM note_tags WHERE note_id = ?', [id]);
  runSql('DELETE FROM notes WHERE id = ?', [id]);

  return { message: '永久删除成功' };
}

function emptyTrash() {
  const deletedNotes = queryAll('SELECT id FROM notes WHERE is_deleted = 1');
  deletedNotes.forEach(note => {
    runSql('DELETE FROM note_tags WHERE note_id = ?', [note.id]);
  });
  runSql('DELETE FROM notes WHERE is_deleted = 1');
  return { message: '回收站已清空' };
}

function getStats() {
  const total = queryOne('SELECT COUNT(*) as count FROM notes WHERE is_deleted = 0');
  const favorites = queryOne('SELECT COUNT(*) as count FROM notes WHERE is_favorite = 1 AND is_deleted = 0');
  const trash = queryOne('SELECT COUNT(*) as count FROM notes WHERE is_deleted = 1');
  
  return {
    total: total.count,
    favorites: favorites.count,
    trash: trash.count
  };
}

function searchByTitle(keyword, limit = 10) {
  if (!keyword) return [];
  return queryAll(
    `SELECT id, title FROM notes 
     WHERE is_deleted = 0 AND title LIKE ? 
     ORDER BY updated_at DESC 
     LIMIT ?`,
    [`%${keyword}%`, limit]
  );
}

function findLinks(content) {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  return [...new Set(links)];
}

function getBacklinks(noteId) {
  const note = queryOne('SELECT title FROM notes WHERE id = ? AND is_deleted = 0', [noteId]);
  if (!note) return [];

  return queryAll(
    `SELECT n.id, n.title, n.content, n.updated_at
     FROM notes n
     WHERE n.is_deleted = 0 
     AND n.id != ?
     AND n.content LIKE ?`,
    [noteId, `%[[${note.title}]]%`]
  );
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  softDelete,
  getTrash,
  restore,
  permanentDelete,
  emptyTrash,
  getStats,
  searchByTitle,
  getBacklinks
};
