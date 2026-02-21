import { useState, useEffect, useCallback, useRef } from 'react';
import { Folder, PanelLeft, PanelRight } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/Editor/NoteEditor';
import { NoteViewer } from './components/Viewer/NoteViewer';
import { useNotes, useTrash, useStats } from './hooks/useNotes';
import { useCategories } from './hooks/useCategories';
import { useTags } from './hooks/useTags';
import { useDarkMode } from './hooks/useDarkMode';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboard } from './hooks/useKeyboard';

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const { notes, fetchNotes, createNote, updateNote, deleteNote, getNote } = useNotes();
  const { trashNotes, fetchTrash, restoreNote, permanentDelete, emptyTrash } = useTrash();
  const { stats, fetchStats } = useStats();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { tags, fetchTags } = useTags();

  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');

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

  useEffect(() => {
    if (!showTrash) {
      fetchNotes({ 
        categoryId: selectedCategory, 
        search: searchQuery, 
        tag: selectedTag, 
        favorites: showFavorites,
        sortBy,
        sortOrder
      });
    }
  }, [selectedCategory, searchQuery, selectedTag, showFavorites, showTrash, sortBy, sortOrder]);

  useEffect(() => {
    fetchStats();
    fetchTags();
    fetchTrash();
  }, [notes]);

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

  useKeyboard({
    onNew: handleNewNote,
    onSave: () => isEditing && handleSaveNote(false),
    onEscape: () => isEditing && setIsEditing(false),
    onToggleMode: () => {}
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.export-menu')) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNoteList, setShowNoteList] = useState(true);

  async function handleSelectNote(note) {
    const data = await getNote(note.id);
    setSelectedNote(data);
    setIsEditing(false);
  }

  function handleNewNote() {
    setSelectedNote(null);
    setIsEditing(true);
    setEditForm({
      title: '',
      content: '',
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
    } else {
      const result = await createNote(noteData);
      setSelectedNote({ id: result.id });
    }

    fetchStats();
    fetchTags();
    
    if (!isAutoSave) {
      setIsEditing(false);
    }
    
    if (selectedNote) {
      const data = await getNote(selectedNote.id);
      setSelectedNote(data);
    }
  }

  async function handleDeleteNote() {
    if (!selectedNote) return;
    if (!confirm('确定要删除这篇笔记吗？可以在回收站恢复。')) return;

    await deleteNote(selectedNote.id);
    setSelectedNote(null);
    fetchStats();
  }

  async function handleRestoreNote(id) {
    await restoreNote(id);
    fetchNotes({ 
      categoryId: selectedCategory, 
      search: searchQuery, 
      tag: selectedTag, 
      favorites: showFavorites,
      sortBy,
      sortOrder
    });
    fetchStats();
  }

  async function handlePermanentDelete(id) {
    if (!confirm('确定要永久删除这篇笔记吗？此操作不可恢复。')) return;
    await permanentDelete(id);
    fetchStats();
  }

  async function handleEmptyTrash() {
    if (!confirm('确定要清空回收站吗？此操作不可恢复。')) return;
    await emptyTrash();
    fetchStats();
  }

  async function handleCreateCategory(name) {
    await createCategory(name);
  }

  async function handleUpdateCategory(id, name) {
    await updateCategory(id, name);
  }

  return (
    <div className={`h-screen flex ${darkMode ? 'dark' : ''}`}>
      {showSidebar && (
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
          onNewNote={handleNewNote}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          showTrash={showTrash}
          trashCount={stats.trash}
          onShowTrash={setShowTrash}
        />
      )}

      {showNoteList && (
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
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          showFavorites={showFavorites}
          categories={categories}
        />
      )}

      <main className="flex-1 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-1.5 rounded transition-colors ${showSidebar ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            title={showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowNoteList(!showNoteList)}
            className={`p-1.5 rounded transition-colors ${showNoteList ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            title={showNoteList ? '隐藏笔记列表' : '显示笔记列表'}
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
        
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
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">选择一篇笔记或创建新笔记</p>
              <p className="text-sm mt-2">快捷键: Ctrl+N 新建 | Ctrl+S 保存 | Ctrl+/ 切换预览</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
