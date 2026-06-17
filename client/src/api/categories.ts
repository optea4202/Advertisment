import api from './index.js';

export interface Category {
  id: number;
  name: string;
  symbol: string;
  parent_id: number | null;
  created_at: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get<{ data: Category[] }>('/api/categories');
  return res.data.data;
};

export const createCategory = async (name: string, symbol: string, parentId: number | null): Promise<Category> => {
  const res = await api.post<{ data: Category }>('/api/categories', { name, symbol, parent_id: parentId });
  return res.data.data;
};

export const updateCategory = async (id: number, name: string, symbol: string, parentId: number | null): Promise<Category> => {
  const res = await api.put<{ data: Category }>(`/api/categories/${id}`, { name, symbol, parent_id: parentId });
  return res.data.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/categories/${id}`);
};
