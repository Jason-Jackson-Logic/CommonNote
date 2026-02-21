import { useState, useEffect } from 'react';
import { tagsApi } from '../services/api';

export function useTags() {
  const [tags, setTags] = useState([]);

  const fetchTags = async () => {
    const data = await tagsApi.getAll();
    setTags(data);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return { tags, fetchTags };
}
