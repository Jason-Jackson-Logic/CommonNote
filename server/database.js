const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'notes.db');

let db;
let SQL;

// 初始化数据库
async function initDatabase() {
  SQL = await initSqlJs();
  
  // 尝试加载现有数据库
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 检查并添加 is_deleted 字段（兼容旧数据库）
  try {
    db.run('ALTER TABLE notes ADD COLUMN is_deleted INTEGER DEFAULT 0');
  } catch (e) {}
  try {
    db.run('ALTER TABLE notes ADD COLUMN deleted_at DATETIME');
  } catch (e) {}

  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      category_id INTEGER,
      is_pinned INTEGER DEFAULT 0,
      is_favorite INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS note_tags (
      note_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (note_id, tag_id),
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  // 创建索引以优化查询性能
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category_id)',
    'CREATE INDEX IF NOT EXISTS idx_notes_deleted ON notes(is_deleted)',
    'CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at)',
    'CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned)',
    'CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(is_favorite)',
    'CREATE INDEX IF NOT EXISTS idx_notetags_note ON note_tags(note_id)',
    'CREATE INDEX IF NOT EXISTS idx_notetags_tag ON note_tags(tag_id)',
    'CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)'
  ];
  createIndexes.forEach(sql => {
    try { db.run(sql); } catch (e) {}
  });

  // 插入默认分类
  const defaultCategories = ['默认', '工作', '学习', '生活'];
  defaultCategories.forEach(name => {
    try {
      db.run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [name]);
    } catch (e) {}
  });

  saveDatabase();
  return db;
}

// 保存数据库到文件
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// 执行查询并返回所有结果
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
}

// 执行查询并返回单个结果
function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

// 执行 SQL 语句
function runSql(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
  return { lastInsertRowid: getLastInsertRowId(), changes: getChanges() };
}

// 获取最后插入的 ID
function getLastInsertRowId() {
  const result = queryOne('SELECT last_insert_rowid() as id');
  return result ? result.id : 0;
}

// 获取影响的行数
function getChanges() {
  const result = queryOne('SELECT changes() as count');
  return result ? result.count : 0;
}

module.exports = {
  initDatabase,
  queryAll,
  queryOne,
  runSql,
  saveDatabase
};