const API_URL = 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  return res.json();
}

export const notesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notes${query ? `?${query}` : ''}`);
  },
  getOne: (id) => request(`/notes/${id}`),
  create: (data) => request('/notes', { method: 'POST', body: data }),
  update: (id, data) => request(`/notes/${id}`, { method: 'PUT', body: data }),
  delete: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
  searchTitle: (q, limit = 10) => request(`/notes/search/title?q=${encodeURIComponent(q)}&limit=${limit}`),
  getBacklinks: (id) => request(`/notes/${id}/backlinks`)
};

export const uploadApi = {
  uploadImage: async (base64Data) => {
    const res = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: base64Data
    });
    return res.json();
  }
};

export const categoriesApi = {
  getAll: () => request('/categories'),
  create: (name) => request('/categories', { method: 'POST', body: { name } }),
  update: (id, name) => request(`/categories/${id}`, { method: 'PUT', body: { name } }),
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' })
};

export const tagsApi = {
  getAll: () => request('/tags')
};

export const trashApi = {
  getAll: () => request('/trash'),
  restore: (id) => request(`/trash/${id}/restore`, { method: 'POST' }),
  delete: (id) => request(`/trash/${id}`, { method: 'DELETE' }),
  empty: () => request('/trash', { method: 'DELETE' })
};

export const statsApi = {
  get: () => request('/stats')
};
