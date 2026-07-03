import api from './index.js';
import { type Ad } from './ads.js';
import { type Review } from './reviews.js';
import { type UserProfile } from './users.js';

export const adminGetAds = async (): Promise<Ad[]> => {
  const res = await api.get<{ data: Ad[] }>('/api/admin/ads');
  return res.data.data;
};

export const adminDeleteAd = async (id: number): Promise<void> => {
  await api.delete(`/api/admin/ads/${id}`);
};

export const adminGetReviews = async (): Promise<Review[]> => {
  const res = await api.get<{ data: Review[] }>('/api/admin/reviews');
  return res.data.data;
};

export const adminDeleteReview = async (id: number): Promise<void> => {
  await api.delete(`/api/admin/reviews/${id}`);
};

export const adminGetUsers = async (): Promise<UserProfile[]> => {
  const res = await api.get<{ data: UserProfile[] }>('/api/admin/users');
  return res.data.data;
};

export const adminBanUser = async (id: number, isBanned: boolean): Promise<void> => {
  await api.post(`/api/admin/users/${id}/ban`, { is_banned: isBanned });
};

export const adminGetVisits = async (): Promise<number> => {
  const res = await api.get<{ data: { count: number } }>('/api/admin/visits');
  return res.data.data.count;
};
