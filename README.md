# 普通笔记 (CommonNote)

一个基于 React + Express + sql.js 的个人笔记管理系统，支持 Markdown 编辑、双向链接、图片上传等功能。

## 功能特性

### 核心功能
- **Markdown 编辑器** - 支持实时预览、代码高亮、数学公式 (KaTeX)
- **笔记分类** - 自定义分类，支持增删改
- **标签系统** - 为笔记添加标签，支持标签云展示
- **搜索功能** - 按标题/内容搜索笔记
- **收藏与置顶** - 收藏重要笔记，置顶常用笔记
- **回收站** - 软删除机制，可恢复误删笔记

### 增强功能 (v2.0)
- **笔记模板** - 6 种预设模板（工作日志、会议记录、读书笔记等）
- **分页加载** - 后端分页 API，优化大数据量性能
- **批量操作** - 多选模式，批量删除/导出
- **Markdown 导入** - 批量导入 .md 文件

### 高级功能 (v2.0)
- **双向链接** - 使用 `[[笔记标题]]` 语法链接笔记，自动显示反向链接
- **图片上传** - 粘贴/拖拽图片自动上传，支持 jpg/png/gif/webp
- **大纲目录** - 自动提取标题生成目录 (TOC)
- **深色模式** - 支持浅色/深色主题切换

### 性能优化
- **数据库索引** - 8 个关键索引优化查询
- **React Query** - 智能缓存，减少重复请求
- **分页加载** - 避免一次加载大量数据

## 技术栈

### 前端
- React 18
- Vite 5
- Tailwind CSS
- React Query (@tanstack/react-query)
- React Markdown + remark/rehype 插件
- KaTeX (数学公式)
- highlight.js (代码高亮)
- Lucide React (图标)

### 后端
- Express.js
- sql.js (SQLite in-memory)
- CORS

## 项目结构

```
notes-app/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── components/     # React 组件
│   │   │   ├── common/     # 通用组件
│   │   │   ├── Editor/     # 编辑器组件
│   │   │   ├── NoteList/   # 笔记列表组件
│   │   │   ├── Sidebar/    # 侧边栏组件
│   │   │   ├── Template/   # 模板选择器
│   │   │   └── Viewer/     # 笔记查看器
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── services/       # API 服务
│   │   ├── utils/          # 工具函数
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                 # 后端项目
│   ├── controllers/
│   ├── routes/
│   │   ├── notes.js        # 笔记路由
│   │   ├── categories.js   # 分类路由
│   │   ├── tags.js         # 标签路由
│   │   ├── trash.js        # 回收站路由
│   │   └── upload.js       # 上传路由
│   ├── services/
│   │   ├── notesService.js
│   │   ├── categoriesService.js
│   │   ├── tagsService.js
│   │   └── uploadService.js
│   ├── database.js
│   ├── index.js
│   ├── uploads/            # 上传图片存储
│   └── notes.db            # SQLite 数据库
├── package.json
└── README.md
```

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd client && npm install

# 安装后端依赖
cd ../server && npm install
```

### 开发模式

```bash
# 在根目录运行（同时启动前后端）
npm run dev
```

前后端将同时启动：
- 前端: http://localhost:5173
- 后端: http://localhost:3001

### 生产构建

```bash
npm run build
```

## API 接口

### 笔记接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notes` | 获取笔记列表（支持分页、搜索、筛选） |
| GET | `/api/notes/:id` | 获取单篇笔记 |
| POST | `/api/notes` | 创建笔记 |
| PUT | `/api/notes/:id` | 更新笔记 |
| DELETE | `/api/notes/:id` | 删除笔记（移入回收站） |
| GET | `/api/notes/search/title?q=keyword` | 按标题搜索笔记 |
| GET | `/api/notes/:id/backlinks` | 获取反向链接 |

### 分类接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取所有分类 |
| POST | `/api/categories` | 创建分类 |
| PUT | `/api/categories/:id` | 更新分类 |
| DELETE | `/api/categories/:id` | 删除分类 |

### 标签接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tags` | 获取所有标签 |

### 回收站接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/trash` | 获取回收站笔记 |
| POST | `/api/trash/:id/restore` | 恢复笔记 |
| DELETE | `/api/trash/:id` | 永久删除 |
| DELETE | `/api/trash` | 清空回收站 |

### 上传接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload/image` | 上传图片 |
| GET | `/api/upload/images/:filename` | 获取图片 |

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + N | 新建笔记 |
| Ctrl + S | 保存笔记 |
| Escape | 关闭编辑器 |

## 双向链接使用

在笔记中使用 `[[笔记标题]]` 语法可以创建指向其他笔记的链接：

```markdown
今天学习了 React，详见 [[React 学习笔记]]

参考 [[项目文档]] 了解更多细节
```

- 蓝色链接：目标笔记存在，点击可跳转
- 橙色链接：目标笔记不存在，显示创建提示

## 更新日志

### v2.0.0 (2026-02-21)

**新功能**
- 笔记模板系统（6 种模板）
- 双向链接支持
- 图片粘贴/拖拽上传
- 大纲目录 (TOC)
- Markdown 文件导入
- 批量操作（多选、批量删除、批量导出）

**性能优化**
- 数据库索引优化
- React Query 缓存
- 分页加载 API

**改进**
- 重构所有 Hooks 使用 React Query
- 优化编辑器体验

### v1.0.0
- 基础笔记 CRUD
- Markdown 编辑器
- 分类和标签
- 收藏和置顶
- 回收站
- 深色模式

## License

MIT
