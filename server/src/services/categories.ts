import { 
  getCategories as dbGetCategories,
  getCategoryById,
  getCategoryByName,
  createCategory as dbCreateCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  DbCategory
} from '../db/categories.js';

export const getCategories = async (): Promise<DbCategory[]> => {
  return await dbGetCategories();
};

export const createCategory = async (name: string): Promise<DbCategory> => {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Category name cannot be empty');
  }

  const existing = await getCategoryByName(trimmed);
  if (existing) {
    throw new Error('Category already exists');
  }

  return await dbCreateCategory(trimmed);
};

export const updateCategory = async (id: number, name: string): Promise<DbCategory> => {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Category name cannot be empty');
  }

  const category = await getCategoryById(id);
  if (!category) {
    throw new Error('Category not found');
  }

  if (category.name.toLowerCase() === 'other') {
    throw new Error('Cannot edit the Other category');
  }

  if (trimmed.toLowerCase() === 'other') {
    throw new Error('Cannot rename a category to Other');
  }

  const existing = await getCategoryByName(trimmed);
  if (existing && existing.id !== id) {
    throw new Error('Category name already exists');
  }

  return await dbUpdateCategory(id, trimmed);
};

export const deleteCategory = async (id: number): Promise<void> => {
  const category = await getCategoryById(id);
  if (!category) {
    throw new Error('Category not found');
  }

  if (category.name.toLowerCase() === 'other') {
    throw new Error('Cannot delete the Other category');
  }

  await dbDeleteCategory(id);
};
