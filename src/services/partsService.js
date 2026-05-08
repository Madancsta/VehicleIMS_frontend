const BASE_URL = 'https://localhost:7001/api/parts'; 

export const partsService = {
  getAll: async () => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch parts');
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch part');
    return res.json();
  },

  create: async (partData) => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partData),
    });
    if (!res.ok) throw new Error('Failed to create part');
    return res.json();
  },

  update: async (id, partData) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partData),
    });
    if (!res.ok) throw new Error('Failed to update part');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete part');
  },
};