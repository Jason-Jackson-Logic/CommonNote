const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');
const routes = require('./routes');
const uploadRoutes = require('./routes/upload');
const notesService = require('./services/notesService');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/upload/images', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoutes);
app.use('/api', routes);

app.get('/api/stats', (req, res) => {
  const stats = notesService.getStats();
  res.json(stats);
});

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
