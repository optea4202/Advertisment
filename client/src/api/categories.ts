import api from './index.js';

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get<{ data: Category[] }>('/api/categories');
  return res.data.data;
};

export const createCategory = async (name: string): Promise<Category> => {
  const res = await api.post<{ data: Category }>('/api/categories', { name });
  return res.data.data;
};

export const updateCategory = async (id: number, name: string): Promise<Category> => {
  const res = await api.put<{ data: Category }>(`/api/categories/${id}`, { name });
  return res.data.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/categories/${id}`);
};
