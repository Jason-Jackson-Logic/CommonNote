const express = require('express');
const router = express.Router();
const notesService = require('../services/notesService');

router.get('/', (req, res) => {
  const notes = notesService.getTrash();
  res.json(notes);
});

router.post('/:id/restore', (req, res) => {
  const result = notesService.restore(req.params.id);
  
  if (result.error) {
    return res.status(404).json(result);
  }

  res.json(result);
});

router.delete('/:id', (req, res) => {
  const result = notesService.permanentDelete(req.params.id);
  
  if (result.error) {
    return res.status(404).json(result);
  }

  res.json(result);
});

router.delete('/', (req, res) => {
  const result = notesService.emptyTrash();
  res.json(result);
});

module.exports = router;
