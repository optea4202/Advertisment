import { 
  getPages as dbGetPages,
  getPageById,
  getPageBySlug as dbGetPageBySlug,
  createPage as dbCreatePage,
  updatePage as dbUpdatePage,
  deletePage as dbDeletePage,
  DbPage
} from '../db/pages.js';
import { uploadImage, deleteImageByUrl } from '../utils/cloudinary.js';

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
  featuredAdIds: number[] | null = null,
  bannerImages: string[] | null = null
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

  return await dbCreatePage(trimmedSlug, trimmedTitle, trimmedContent, featuredAdIds, bannerImages);
};

export const updatePage = async (
  id: number, 
  slug: string, 
  title: string, 
  content: string, 
  featuredAdIds: number[] | null = null,
  keepBanners: string[] | null = null,
  newFiles: Express.Multer.File[] = []
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

  // Handle banner updates
  let finalBanners: string[] = [];
  if (keepBanners !== null || newFiles.length > 0) {
    const currentBanners = page.banner_images || [];
    const keepBannersList = keepBanners || [];

    // Find banners to delete from Cloudinary
    const deletedBanners = currentBanners.filter(url => !keepBannersList.includes(url));
    if (deletedBanners.length > 0) {
      console.log(`🖼️ Cleaning up ${deletedBanners.length} banners from Cloudinary...`);
      await Promise.all(deletedBanners.map(url => deleteImageByUrl(url)));
    }

    // Upload new banners
    let newUrls: string[] = [];
    if (newFiles.length > 0) {
      console.log(`🖼️ Uploading ${newFiles.length} banner images to Cloudinary...`);
      newUrls = await Promise.all(newFiles.map(file => uploadImage(file.buffer, 'pages')));
    }

    finalBanners = [...keepBannersList, ...newUrls];
  } else {
    finalBanners = page.banner_images || [];
  }

  return await dbUpdatePage(id, trimmedSlug, trimmedTitle, trimmedContent, featuredAdIds, finalBanners);
};

export const deletePage = async (id: number): Promise<void> => {
  const page = await getPageById(id);
  if (!page) {
    throw new Error('Page not found');
  }

  if (page.banner_images && page.banner_images.length > 0) {
    console.log(`🖼️ Cleaning up ${page.banner_images.length} banner images from Cloudinary for page ${id}...`);
    await Promise.all(page.banner_images.map(url => deleteImageByUrl(url)));
  }

  await dbDeletePage(id);
};
