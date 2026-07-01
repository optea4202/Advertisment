import api from './index.js';
import { type Ad } from './ads.js';

export interface PageContent {
  id: number;
  slug: string;
  title: string;
  content: string;
  featured_ad_ids?: number[] | null;
  featured_ads?: Ad[] | null;
  banner_images?: string[] | null;
  created_at: string;
  updated_at: string;
}

export const getPages = async (): Promise<PageContent[]> => {
  const res = await api.get<{ data: PageContent[] }>('/api/pages');
  return res.data.data;
};

export const getPageBySlug = async (slug: string): Promise<PageContent> => {
  const res = await api.get<{ data: PageContent }>(`/api/pages/${slug}`);
  return res.data.data;
};

export const createPage = async (
  slug: string, 
  title: string, 
  content: string, 
  featuredAdIds?: number[] | null
): Promise<PageContent> => {
  const res = await api.post<{ data: PageContent }>('/api/pages', { 
    slug, 
    title, 
    content, 
    featured_ad_ids: featuredAdIds 
  });
  return res.data.data;
};

export const updatePage = async (
  id: number, 
  slug: string, 
  title: string, 
  content: string, 
  featuredAdIds?: number[] | null,
  keepBanners?: string[] | null,
  bannerFiles?: File[] | null
): Promise<PageContent> => {
  const formData = new FormData();
  formData.append('slug', slug);
  formData.append('title', title);
  formData.append('content', content);
  
  if (featuredAdIds) {
    formData.append('featured_ad_ids', JSON.stringify(featuredAdIds));
  }
  
  if (keepBanners) {
    formData.append('keep_banners', JSON.stringify(keepBanners));
  }
  
  if (bannerFiles && bannerFiles.length > 0) {
    bannerFiles.forEach((file) => {
      formData.append('banners', file);
    });
  }

  const res = await api.put<{ data: PageContent }>(`/api/pages/${id}`, formData, { 
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data.data;
};

export const deletePage = async (id: number): Promise<void> => {
  await api.delete(`/api/pages/${id}`);
};
