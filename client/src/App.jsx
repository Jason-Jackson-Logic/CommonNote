import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Folder, PanelLeft, PanelRight, ChevronRight, ChevronLeft, GripVertical } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/Editor/NoteEditor';
import { NoteViewer } from './components/Viewer/NoteViewer';
import { TemplatePicker } from './components/Template/TemplatePicker';
import { useNotes, useTrash, useStats } from './hooks/useNotes';
import { useCategories } from './hooks/useCategories';
import { useTags } from './hooks/useTags';
import { useDarkMode } from './hooks/useDarkMode';
import { useKeyboard } from './hooks/useKeyboard';

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const notesOptions = useMemo(() => ({
    categoryId: selectedCategory,
    search: searchQuery,
    tag: selectedTag,
    favorites: showFavorites,
    sortBy,
    sortOrder,
    page: currentPage,
    pageSize: 20
  }), [selectedCategory, searchQuery, selectedTag, showFavorites, sortBy, sortOrder, currentPage]);

  const { notes, pagination, loading, createNote, updateNote, deleteNote, getNote } = useNotes(showTrash ? {} : notesOptions);
  const { trashNotes, fetchTrash, restoreNote, permanentDelete, emptyTrash } = useTrash();
  const { stats } = useStats();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { tags } = useTags();

  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    category_id: 1,
    tags: [],
    is_pinned: false,
    is_favorite: false
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const autoSaveTimerRef = useRef(null);

  // 面板显示状态
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNoteList, setShowNoteList] = useState(true);
  
  // 侧边栏宽度状态
  const [sidebarWidth, setSidebarWidth] = useState(256); // 默认256px (w-64)
  const [isResizing, setIsResizing] = useState(false);
  const sidebarResizeRef = useRef(null);
  
  // 侧边栏拖拽调整宽度
  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);
  
  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);
  
  const resize = useCallback((e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 180 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);
  
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResizing]);

  useKeyboard({
    onNew: () => setShowTemplatePicker(true),
    onSave: () => isEditing && handleSaveNote(false),
    onEscape: () => {
      if (showTemplatePicker) {
        setShowTemplatePicker(false);
      } else if (isEditing) {
        setIsEditing(false);
      }
    },
    onToggleMode: () => {}
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedTag, showFavorites]);

  useEffect(() => {
    if (!isEditing || !editForm.title.trim()) return;
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('正在保存...');
      await handleSaveNote(true);
      setAutoSaveStatus('已自动保存');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 30000);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [editForm, isEditing]);

  async function handleSelectNote(note) {
    const data = await getNote(note.id);
    setSelectedNote(data);
    setIsEditing(false);
  }

  async function handleSelectNoteById(id) {
    const data = await getNote(id);
    setSelectedNote(data);
    setIsEditing(false);
    setCurrentPage(1);
  }

  function handleNewNote(template) {
    setSelectedNote(null);
    setIsEditing(true);
    setEditForm({
      title: '',
      content: template?.content || '',
      category_id: selectedCategory || 1,
      tags: [],
      is_pinned: false,
      is_favorite: false
    });
    setAutoSaveStatus('');
  }

  function handleEditNote() {
    if (!selectedNote) return;
    setEditForm({
      title: selectedNote.title,
      content: selectedNote.content || '',
      category_id: selectedNote.category_id,
      tags: selectedNote.tags ? selectedNote.tags.map(t => t.name) : [],
      is_pinned: selectedNote.is_pinned === 1,
      is_favorite: selectedNote.is_favorite === 1
    });
    setIsEditing(true);
    setAutoSaveStatus('');
  }

  async function handleSaveNote(isAutoSave = false) {
    if (!editForm.title.trim()) {
      if (!isAutoSave) alert('请输入标题');
      return;
    }

    const noteData = {
      title: editForm.title,
      content: editForm.content,
      category_id: editForm.category_id,
      tags: editForm.tags,
      is_pinned: editForm.is_pinned,
      is_favorite: editForm.is_favorite
    };

    if (selectedNote) {
      await updateNote(selectedNote.id, noteData);
      const data = await getNote(selectedNote.id);
      setSelectedNote(data);
    } else {
      const result = await createNote(noteData);
      setSelectedNote({ id: result.id });
    }
    
    if (!isAutoSave) {
      setIsEditing(false);
    }
  }

  async function handleDeleteNote() {
    if (!selectedNote) return;
    if (!confirm('确定要删除这篇笔记吗？可以在回收站恢复。')) return;

    await deleteNote(selectedNote.id);
    setSelectedNote(null);
  }

  async function handleRestoreNote(id) {
    await restoreNote(id);
  }

  async function handlePermanentDelete(id) {
    if (!confirm('确定要永久删除这篇笔记吗？此操作不可恢复。')) return;
    await permanentDelete(id);
  }

  async function handleEmptyTrash() {
    if (!confirm('确定要清空回收站吗？此操作不可恢复。')) return;
    await emptyTrash();
  }

  async function handleCreateCategory(name) {
    await createCategory(name);
  }

  async function handleUpdateCategory(id, name) {
    await updateCategory(id, name);
  }

  return (
    <div className={`h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* 侧边栏 */}
      <div 
        className={`h-full flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 relative`}
        style={{ width: showSidebar ? `${sidebarWidth}px` : '0px' }}
      >
        <div className="h-full w-full flex flex-col overflow-hidden">
          <Sidebar
          darkMode={darkMode}
          onToggleDarkMode={setDarkMode}
          categories={categories}
          tags={tags}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          showFavorites={showFavorites}
          stats={stats}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectCategory={setSelectedCategory}
          onSelectTag={setSelectedTag}
          onShowFavorites={setShowFavorites}
          onNewNote={() => setShowTemplatePicker(true)}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          showTrash={showTrash}
          trashCount={stats.trash}
          onShowTrash={setShowTrash}
          onImportNotes={createNote}
        />
        </div>
        
        {/* 拖拽调整宽度的分隔条 */}
        {showSidebar && (
          <div
            ref={sidebarResizeRef}
            onMouseDown={startResizing}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors z-10 group"
            style={{ backgroundColor: isResizing ? 'rgb(96, 165, 250)' : 'transparent' }}
          >
            <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-6 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        )}
      </div>

      {/* 侧边栏折叠按钮 */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="w-6 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-r border-gray-200 dark:border-gray-700"
        title={showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
      >
        {showSidebar ? (
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* 笔记列表 */}
      <div 
        className={`${showNoteList ? 'w-80' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900`}
      >
        <NoteList
          notes={notes}
          trashNotes={trashNotes}
          showTrash={showTrash}
          selectedNote={selectedNote}
          onSelectNote={handleSelectNote}
          onRestoreNote={handleRestoreNote}
          onPermanentDelete={handlePermanentDelete}
          onEmptyTrash={handleEmptyTrash}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={(v) => { setSortBy(v); setCurrentPage(1); }}
          onSortOrderChange={(v) => { setSortOrder(v); setCurrentPage(1); }}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          showFavorites={showFavorites}
          categories={categories}
          pagination={pagination}
          onPageChange={setCurrentPage}
          onDeleteNote={deleteNote}
        />
      </div>

      {/* 笔记列表折叠按钮 */}
      <button
        onClick={() => setShowNoteList(!showNoteList)}
        className="w-6 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-r border-gray-200 dark:border-gray-700"
        title={showNoteList ? '隐藏笔记列表' : '显示笔记列表'}
      >
        {showNoteList ? (
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* 主内容区 */}
      <main className="flex-1 bg-white dark:bg-gray-900 flex flex-col overflow-hidden min-w-0">
        {isEditing ? (
          <NoteEditor
            editForm={editForm}
            onChange={setEditForm}
            categories={categories}
            selectedNote={selectedNote}
            onSave={handleSaveNote}
            onCancel={() => setIsEditing(false)}
            autoSaveStatus={autoSaveStatus}
          />
        ) : selectedNote ? (
          <NoteViewer
            note={selectedNote}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onNavigateToNote={handleSelectNoteById}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">选择一篇笔记或创建新笔记</p>
              <p className="text-sm mt-2">快捷键: Ctrl+N 新建 | Ctrl+S 保存 | Esc 取消</p>
            </div>
          </div>
        )}
      </main>

      {showTemplatePicker && (
        <TemplatePicker
          onSelect={handleNewNote}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}

export default App;