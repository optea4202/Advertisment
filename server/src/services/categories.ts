import { 
  getCategories as dbGetCategories,
  getCategoryById,
  getCategoryByName,
  createCategory as dbCreateCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  DbCategory
} from '../db/categories.js';

const isAncestor = async (potentialAncestorId: number, targetParentId: number | null): Promise<boolean> => {
  let currentParentId = targetParentId;
  while (currentParentId !== null) {
    if (currentParentId === potentialAncestorId) {
      return true;
    }
    const parent = await getCategoryById(currentParentId);
    currentParentId = parent ? parent.parent_id : null;
  }
  return false;
};

export const getCategories = async (): Promise<DbCategory[]> => {
  return await dbGetCategories();
};

export const createCategory = async (name: string, symbol: string, parentId: number | null): Promise<DbCategory> => {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Category name cannot be empty');
  }

  const trimmedSymbol = symbol ? symbol.trim() : 'category';
  if (!trimmedSymbol) {
    throw new Error('Category symbol cannot be empty');
  }

  if (parentId !== null) {
    const parent = await getCategoryById(parentId);
    if (!parent) {
      throw new Error('Parent category not found');
    }
  }

  const existing = await getCategoryByName(trimmed);
  if (existing) {
    throw new Error('Category already exists');
  }

  return await dbCreateCategory(trimmed, trimmedSymbol, parentId);
};

export const updateCategory = async (id: number, name: string, symbol: string, parentId: number | null): Promise<DbCategory> => {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Category name cannot be empty');
  }

  const trimmedSymbol = symbol ? symbol.trim() : 'category';
  if (!trimmedSymbol) {
    throw new Error('Category symbol cannot be empty');
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

  if (parentId !== null) {
    if (parentId === id) {
      throw new Error('A category cannot be its own parent');
    }
    const parent = await getCategoryById(parentId);
    if (!parent) {
      throw new Error('Parent category not found');
    }
    const cyclic = await isAncestor(id, parentId);
    if (cyclic) {
      throw new Error('Cyclic dependency: parent category is a child of this category');
    }
  }

  return await dbUpdateCategory(id, trimmed, trimmedSymbol, parentId);
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
