import { query } from './index.js';
import type { DbAd } from './ads.js';

/**
 * Add an advertisement to a user's wishlist.
 * Uses ON CONFLICT to avoid duplicate entries.
 */
export const addToWishlist = async (userId: number, adId: number): Promise<void> => {
  const sql = `
    INSERT INTO wishlist (user_id, ad_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, ad_id) DO NOTHING
  `;
  await query(sql, [userId, adId]);
};

/**
 * Remove an advertisement from a user's wishlist.
 */
export const removeFromWishlist = async (userId: number, adId: number): Promise<void> => {
  const sql = `
    DELETE FROM wishlist
    WHERE user_id = $1 AND ad_id = $2
  `;
  await query(sql, [userId, adId]);
};

/**
 * Get all advertisements wishlisted by a user.
 * Excludes ads published by banned users.
 * Sorted by the time they were added to the wishlist (newest first).
 */
export const getWishlistByUserId = async (userId: number): Promise<DbAd[]> => {
  const sql = `
    SELECT a.*, 
           COALESCE(
             json_agg(
               json_build_object(
                 'id', img.id,
                 'ad_id', img.ad_id,
                 'cloudinary_url', img.cloudinary_url,
                 'display_order', img.display_order
               ) ORDER BY img.display_order
             ) FILTER (WHERE img.id IS NOT NULL),
             '[]'::json
           ) as images,
           u.username as owner_name,
           u.photo_url as owner_photo
    FROM wishlist w
    JOIN ads a ON w.ad_id = a.id
    LEFT JOIN ad_images img ON a.id = img.ad_id
    LEFT JOIN users u ON a.owner_id = u.id
    WHERE w.user_id = $1 AND u.is_banned = FALSE
    GROUP BY w.id, w.created_at, a.id, u.id
    ORDER BY w.created_at DESC
  `;
  const res = await query(sql, [userId]);
  return res.rows.map(row => ({
    ...row,
    price: parseFloat(row.price),
  }));
};

/**
 * Get an array of advertisement IDs wishlisted by a user.
 */
export const getWishlistIdsByUserId = async (userId: number): Promise<number[]> => {
  const sql = `
    SELECT ad_id FROM wishlist
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const res = await query(sql, [userId]);
  return res.rows.map(row => row.ad_id);
};
