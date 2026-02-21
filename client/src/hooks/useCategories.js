import { useState, useEffect } from 'react';
import { categoriesApi } from '../services/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    const data = await categoriesApi.getAll();
    setCategories(data);
  };

  const createCategory = async (name) => {
    await categoriesApi.create(name);
    await fetchCategories();
  };

  const updateCategory = async (id, name) => {
    await categoriesApi.update(id, name);
    await fetchCategories();
  };

  const deleteCategory = async (id) => {
    await categoriesApi.delete(id);
    await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
