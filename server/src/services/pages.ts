import { 
  getPages as dbGetPages,
  getPageById,
  getPageBySlug as dbGetPageBySlug,
  createPage as dbCreatePage,
  updatePage as dbUpdatePage,
  deletePage as dbDeletePage,
  DbPage
} from '../db/pages.js';

export const getPages = async (): Promise<DbPage[]> => {
  return await dbGetPages();
};

export const getPageBySlug = async (slug: string): Promise<DbPage | null> => {
  if (!slug || !slug.trim()) {
    throw new Error('Page slug cannot be empty');
  }
  return await dbGetPageBySlug(slug.trim());
};

export const createPage = async (
  slug: string, 
  title: string, 
  content: string, 
  featuredAdIds: number[] | null = null
): Promise<DbPage> => {
  const trimmedSlug = slug.trim().toLowerCase();
  if (!trimmedSlug) {
    throw new Error('Page slug cannot be empty');
  }

  const slugRegex = /^[a-z0-9-_]+$/;
  if (!slugRegex.test(trimmedSlug)) {
    throw new Error('Page slug must only contain alphanumeric characters, dashes, and underscores');
  }

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error('Page title cannot be empty');
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error('Page content cannot be empty');
  }

  const existing = await dbGetPageBySlug(trimmedSlug);
  if (existing) {
    throw new Error('Page slug already exists');
  }

  return await dbCreatePage(trimmedSlug, trimmedTitle, trimmedContent, featuredAdIds);
};

export const updatePage = async (
  id: number, 
  slug: string, 
  title: string, 
  content: string, 
  featuredAdIds: number[] | null = null
): Promise<DbPage> => {
  const trimmedSlug = slug.trim().toLowerCase();
  if (!trimmedSlug) {
    throw new Error('Page slug cannot be empty');
  }

  const slugRegex = /^[a-z0-9-_]+$/;
  if (!slugRegex.test(trimmedSlug)) {
    throw new Error('Page slug must only contain alphanumeric characters, dashes, and underscores');
  }

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error('Page title cannot be empty');
  }

  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error('Page content cannot be empty');
  }

  const page = await getPageById(id);
  if (!page) {
    throw new Error('Page not found');
  }

  const existing = await dbGetPageBySlug(trimmedSlug);
  if (existing && existing.id !== id) {
    throw new Error('Page slug already exists');
  }

  return await dbUpdatePage(id, trimmedSlug, trimmedTitle, trimmedContent, featuredAdIds);
};

export const deletePage = async (id: number): Promise<void> => {
  const page = await getPageById(id);
  if (!page) {
    throw new Error('Page not found');
  }

  await dbDeletePage(id);
};
