import api from './index.js';

export interface UserProfile {
  id: number;
  clerk_id: string;
  username: string;
  email: string;
  photo_url: string | null;
  phone: string | null;
  bio: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicUserProfile {
  id: number;
  username: string;
  photo_url: string | null;
  bio: string | null;
  created_at: string;
  is_banned: boolean;
}

export interface PublicProfileData {
  user: PublicUserProfile;
  ads: import('./ads.js').Ad[];
}

export const fetchMe = async (): Promise<UserProfile> => {
  const res = await api.get<{ data: UserProfile }>('/api/users/me');
  return res.data.data;
};

export const updateProfile = async (formData: FormData): Promise<UserProfile> => {
  const res = await api.put<{ data: UserProfile }>('/api/users/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
};

export const getPublicProfile = async (userId: number): Promise<PublicProfileData> => {
  const res = await api.get<{ data: PublicProfileData }>(`/api/users/${userId}`);
  return res.data.data;
};
