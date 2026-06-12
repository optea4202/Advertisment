import api from './index.js';

export interface AdImage {
  id: number;
  ad_id: number;
  cloudinary_url: string;
  display_order: number;
}

export interface Ad {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  contact_info: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  images: AdImage[];
  owner_name?: string;
  owner_photo?: string;
}

export const createAd = async (formData: FormData): Promise<Ad> => {
  const res = await api.post<{ data: Ad }>('/api/ads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
};

export const getAds = async (params: { category?: string; search?: string }): Promise<Ad[]> => {
  const res = await api.get<{ data: Ad[] }>('/api/ads', { params });
  return res.data.data;
};

export const getMyAds = async (): Promise<Ad[]> => {
  const res = await api.get<{ data: Ad[] }>('/api/ads/mine');
  return res.data.data;
};

// Placeholder API calls for Unit 4 edit/delete
export const deleteAd = async (id: number): Promise<void> => {
  await api.delete(`/api/ads/${id}`);
};

export const getAdById = async (id: number): Promise<Ad> => {
  const res = await api.get<{ data: Ad }>(`/api/ads/${id}`);
  return res.data.data;
};

export const updateAd = async (id: number, formData: FormData): Promise<Ad> => {
  const res = await api.put<{ data: Ad }>(`/api/ads/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
};
