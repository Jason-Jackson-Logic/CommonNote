import { useState, useEffect, useCallback, useRef } from 'react';
import { notesApi, trashApi, statsApi } from '../services/api';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const optionsRef = useRef({});

  const fetchNotes = useCallback(async (options = {}) => {
    optionsRef.current = options;
    setLoading(true);
    try {
      const params = {};
      if (options.categoryId) params.category_id = options.categoryId;
      if (options.search) params.search = options.search;
      if (options.tag) params.tag = options.tag;
      if (options.favorites) params.favorites = 'true';
      
      const data = await notesApi.getAll(params);
      
      const sortedData = [...data].sort((a, b) => {
        let aVal, bVal;
        switch (options.sortBy) {
          case 'title':
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case 'created_at':
            aVal = new Date(a.created_at).getTime();
            bVal = new Date(b.created_at).getTime();
            break;
          case 'updated_at':
          default:
            aVal = new Date(a.updated_at).getTime();
            bVal = new Date(b.updated_at).getTime();
        }
        if (options.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
      
      setNotes(sortedData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNote = async (data) => {
    const result = await notesApi.create(data);
    await fetchNotes(optionsRef.current);
    return result;
  };

  const updateNote = async (id, data) => {
    const result = await notesApi.update(id, data);
    await fetchNotes(optionsRef.current);
    return result;
  };

  const deleteNote = async (id) => {
    const result = await notesApi.delete(id);
    await fetchNotes(optionsRef.current);
    return result;
  };

  const getNote = async (id) => {
    return notesApi.getOne(id);
  };

  return {
    notes,
    loading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    getNote
  };
}

export function useTrash() {
  const [trashNotes, setTrashNotes] = useState([]);

  const fetchTrash = async () => {
    const data = await trashApi.getAll();
    setTrashNotes(data);
  };

  const restoreNote = async (id) => {
    await trashApi.restore(id);
    await fetchTrash();
  };

  const permanentDelete = async (id) => {
    await trashApi.delete(id);
    await fetchTrash();
  };

  const emptyTrash = async () => {
    await trashApi.empty();
    await fetchTrash();
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  return {
    trashNotes,
    fetchTrash,
    restoreNote,
    permanentDelete,
    emptyTrash
  };
}

export function useStats() {
  const [stats, setStats] = useState({ total: 0, favorites: 0, trash: 0 });

  const fetchStats = async () => {
    const data = await statsApi.get();
    setStats(data);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, fetchStats };
}
