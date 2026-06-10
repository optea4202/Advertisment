import { query } from './index.js';

export interface DbReview {
  id: number;
  ad_id: number;
  reviewer_id: number;
  star_rating: number;
  review_text: string | null;
  created_at: Date;
  reviewer_name?: string;
  reviewer_photo?: string | null;
}

export const insertReview = async (
  adId: number,
  reviewerId: number,
  starRating: number,
  reviewText: string | null
): Promise<DbReview> => {
  const sql = `
    INSERT INTO reviews (ad_id, reviewer_id, star_rating, review_text)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const res = await query(sql, [adId, reviewerId, starRating, reviewText]);
  return res.rows[0];
};

export const getReviewsByAdId = async (adId: number): Promise<DbReview[]> => {
  const sql = `
    SELECT r.*, 
           u.username as reviewer_name,
           u.photo_url as reviewer_photo
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    WHERE r.ad_id = $1
    ORDER BY r.created_at DESC
  `;
  const res = await query(sql, [adId]);
  return res.rows;
};

export const deleteReviewRecord = async (id: number): Promise<void> => {
  const sql = `
    DELETE FROM reviews
    WHERE id = $1
  `;
  await query(sql, [id]);
};

export const getAllReviews = async (): Promise<DbReview[]> => {
  const sql = `
    SELECT r.*, 
           u.username as reviewer_name,
           u.photo_url as reviewer_photo,
           a.title as ad_title
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    JOIN ads a ON r.ad_id = a.id
    ORDER BY r.created_at DESC
  `;
  const res = await query(sql);
  return res.rows;
};

