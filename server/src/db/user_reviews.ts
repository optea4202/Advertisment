import { query } from './index.js';

export interface DbUserReview {
  id: number;
  target_user_id: number;
  reviewer_id: number;
  star_rating: number;
  review_text: string;
  created_at: Date;
  reviewer_name?: string;
  reviewer_photo?: string | null;
  target_username?: string;
}

export const upsertUserReview = async (
  targetUserId: number,
  reviewerId: number,
  starRating: number,
  reviewText: string
): Promise<DbUserReview> => {
  const sql = `
    INSERT INTO user_reviews (target_user_id, reviewer_id, star_rating, review_text)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (reviewer_id, target_user_id) 
    DO UPDATE SET 
      star_rating = EXCLUDED.star_rating,
      review_text = EXCLUDED.review_text,
      created_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const res = await query(sql, [targetUserId, reviewerId, starRating, reviewText]);
  return res.rows[0];
};

export const getUserReviewsByTargetId = async (targetUserId: number): Promise<DbUserReview[]> => {
  const sql = `
    SELECT ur.*, 
           u.username as reviewer_name,
           u.photo_url as reviewer_photo
    FROM user_reviews ur
    JOIN users u ON ur.reviewer_id = u.id
    WHERE ur.target_user_id = $1
    ORDER BY ur.created_at DESC
  `;
  const res = await query(sql, [targetUserId]);
  return res.rows;
};

export const getUserReviewById = async (id: number): Promise<DbUserReview | null> => {
  const sql = `
    SELECT ur.*, u.username as reviewer_name 
    FROM user_reviews ur
    JOIN users u ON ur.reviewer_id = u.id
    WHERE ur.id = $1
  `;
  const res = await query(sql, [id]);
  if (res.rows.length === 0) return null;
  return res.rows[0];
};

export const deleteUserReviewRecord = async (id: number): Promise<void> => {
  const sql = `
    DELETE FROM user_reviews
    WHERE id = $1
  `;
  await query(sql, [id]);
};

export const getUserReviewsStats = async (targetUserId: number): Promise<{ avg_rating: number; total_reviews: number }> => {
  const sql = `
    SELECT COALESCE(AVG(star_rating), 0)::numeric as avg_rating,
           COUNT(*)::integer as total_reviews
    FROM user_reviews
    WHERE target_user_id = $1
  `;
  const res = await query(sql, [targetUserId]);
  const row = res.rows[0];
  return {
    avg_rating: parseFloat(parseFloat(row.avg_rating || '0').toFixed(1)),
    total_reviews: row.total_reviews || 0
  };
};

export const getAllUserReviews = async (): Promise<DbUserReview[]> => {
  const sql = `
    SELECT ur.*, 
           u_rev.username as reviewer_name,
           u_rev.photo_url as reviewer_photo,
           u_tgt.username as target_username
    FROM user_reviews ur
    JOIN users u_rev ON ur.reviewer_id = u_rev.id
    JOIN users u_tgt ON ur.target_user_id = u_tgt.id
    ORDER BY ur.created_at DESC
  `;
  const res = await query(sql);
  return res.rows;
};
