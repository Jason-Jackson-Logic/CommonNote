const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const uploadService = require('../services/uploadService');

router.post('/image', (req, res) => {
  uploadService.handleImageUpload(req, res);
});

router.get('/images/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: '图片不存在' });
  }
});

module.exports = router;
