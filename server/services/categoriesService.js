const { queryAll, queryOne, runSql } = require('../database');

function getAll() {
  return queryAll(`
    SELECT c.id, c.name, c.created_at, COUNT(n.id) as note_count
    FROM categories c
    LEFT JOIN notes n ON c.id = n.category_id AND n.is_deleted = 0
    GROUP BY c.id
    ORDER BY c.id
  `);
}

function getOne(id) {
  return queryOne('SELECT * FROM categories WHERE id = ?', [id]);
}

function create(name) {
  try {
    const result = runSql('INSERT INTO categories (name) VALUES (?)', [name]);
    return { id: result.lastInsertRowid, message: '创建成功' };
  } catch (err) {
    return { error: '分类已存在' };
  }
}

function update(id, name) {
  const category = queryOne('SELECT * FROM categories WHERE id = ?', [id]);
  if (!category) return { error: '分类不存在' };

  try {
    runSql('UPDATE categories SET name = ? WHERE id = ?', [name.trim(), id]);
    return { message: '重命名成功' };
  } catch (err) {
    return { error: '分类名称已存在' };
  }
}

function remove(id) {
  const notes = queryOne('SELECT COUNT(*) as count FROM notes WHERE category_id = ? AND is_deleted = 0', [id]);
  if (notes.count > 0) {
    return { error: '该分类下有笔记，无法删除' };
  }

  runSql('DELETE FROM categories WHERE id = ?', [id]);
  return { message: '删除成功' };
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove
};
