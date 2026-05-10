const BASE_URL = 'https://localhost:7280/api/partcategory';

export const categoryService = {
  getAll: async () => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },
};