const express = require('express');
const router = express.Router();
const categoriesService = require('../services/categoriesService');

router.get('/', (req, res) => {
  const categories = categoriesService.getAll();
  res.json(categories);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: '分类名称不能为空' });
  }

  const result = categoriesService.create(name);
  
  if (result.error) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '分类名称不能为空' });
  }

  const result = categoriesService.update(id, name);

  if (result.error) {
    if (result.error === '分类不存在') {
      return res.status(404).json(result);
    }
    return res.status(400).json(result);
  }

  res.json(result);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const result = categoriesService.remove(id);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

module.exports = router;
