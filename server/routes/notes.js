const express = require('express');
const router = express.Router();
const notesService = require('../services/notesService');

router.get('/', (req, res) => {
  const { category_id, search, tag, favorites } = req.query;
  const notes = notesService.getAll({ category_id, search, tag, favorites });
  res.json(notes);
});

router.get('/:id', (req, res) => {
  const note = notesService.getOne(req.params.id);
  if (!note) {
    return res.status(404).json({ error: '笔记不存在' });
  }
  res.json(note);
});

router.post('/', (req, res) => {
  const { title, content, category_id, tags, is_pinned, is_favorite } = req.body;

  if (!title) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  const result = notesService.create({
    title,
    content,
    category_id,
    tags,
    is_pinned,
    is_favorite
  });

  res.status(201).json(result);
});

router.put('/:id', (req, res) => {
  const { title, content, category_id, tags, is_pinned, is_favorite } = req.body;
  const noteId = req.params.id;

  const result = notesService.update(noteId, {
    title,
    content,
    category_id,
    tags,
    is_pinned,
    is_favorite
  });

  if (result.error) {
    return res.status(404).json(result);
  }

  res.json(result);
});

router.delete('/:id', (req, res) => {
  const result = notesService.softDelete(req.params.id);
  
  if (result.error) {
    return res.status(404).json(result);
  }

  res.json(result);
});

module.exports = router;
