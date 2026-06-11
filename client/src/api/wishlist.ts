import api from './index.js';
import type { Ad } from './ads.js';

/**
 * Add an advertisement to the user's wishlist.
 */
export const addToWishlist = async (adId: number): Promise<void> => {
  await api.post('/api/wishlist', { adId });
};

/**
 * Remove an advertisement from the user's wishlist.
 */
export const removeFromWishlist = async (adId: number): Promise<void> => {
  await api.delete(`/api/wishlist/${adId}`);
};

/**
 * Fetch all advertisements in the user's wishlist.
 */
export const getWishlist = async (): Promise<Ad[]> => {
  const res = await api.get<{ data: Ad[] }>('/api/wishlist');
  return res.data.data;
};

/**
 * Fetch just the IDs of all ads in the user's wishlist.
 */
export const getWishlistIds = async (): Promise<number[]> => {
  const res = await api.get<{ data: number[] }>('/api/wishlist/ids');
  return res.data.data;
};
