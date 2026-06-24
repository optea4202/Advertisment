import api from './index.js';

export interface UserReview {
  id: number;
  target_user_id: number;
  reviewer_id: number;
  star_rating: number;
  review_text: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_photo?: string | null;
  target_username?: string;
}

export const postUserReview = async (
  targetUserId: number,
  starRating: number,
  reviewText: string
): Promise<UserReview> => {
  const res = await api.post<{ data: UserReview }>(`/api/users/${targetUserId}/reviews`, {
    star_rating: starRating,
    review_text: reviewText
  });
  return res.data.data;
};

export const getUserReviews = async (targetUserId: number): Promise<UserReview[]> => {
  const res = await api.get<{ data: UserReview[] }>(`/api/users/${targetUserId}/reviews`);
  return res.data.data;
};

export const deleteUserReview = async (reviewId: number): Promise<{ success: boolean }> => {
  const res = await api.delete<{ data: { success: boolean } }>(`/api/users/reviews/${reviewId}`);
  return res.data.data;
};

export const adminGetAllUserReviews = async (): Promise<UserReview[]> => {
  const res = await api.get<{ data: UserReview[] }>('/api/users/admin/reviews');
  return res.data.data;
};
