const BASE_URL = 'https://localhost:7280/api/vendor';

export const vendorService = {
  getAll: async () => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create vendor');
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete vendor');
  },
};