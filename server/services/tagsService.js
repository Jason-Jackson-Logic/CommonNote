const { queryAll } = require('../database');

function getAll() {
  return queryAll(`
    SELECT t.id, t.name, COUNT(nt.note_id) as note_count
    FROM tags t
    LEFT JOIN note_tags nt ON t.id = nt.tag_id
    LEFT JOIN notes n ON nt.note_id = n.id AND n.is_deleted = 0
    GROUP BY t.id
    ORDER BY note_count DESC
  `);
}

module.exports = {
  getAll
};
