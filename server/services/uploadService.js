const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function handleImageUpload(req, res) {
  let body = [];
  
  req.on('data', chunk => {
    body.push(chunk);
  });
  
  req.on('end', () => {
    try {
      const buffer = Buffer.concat(body);
      const base64Data = buffer.toString('utf-8');
      
      const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
      
      if (!matches) {
        return res.status(400).json({ error: '无效的图片格式' });
      }
      
      const ext = matches[1];
      const imageData = matches[2];
      
      if (!['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext.toLowerCase())) {
        return res.status(400).json({ error: '不支持的图片格式' });
      }
      
      const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
      const filepath = path.join(UPLOADS_DIR, filename);
      
      fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));
      
      res.json({
        url: `/api/upload/images/${filename}`,
        filename
      });
    } catch (error) {
      res.status(500).json({ error: '上传失败' });
    }
  });
}

module.exports = {
  handleImageUpload
};
