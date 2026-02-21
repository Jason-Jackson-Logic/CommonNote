const express = require('express');
const router = express.Router();
const tagsService = require('../services/tagsService');

router.get('/', (req, res) => {
  const tags = tagsService.getAll();
  res.json(tags);
});

module.exports = router;
