import api from './index.js';

export interface Review {
  id: number;
  ad_id: number;
  reviewer_id: number;
  star_rating: number;
  review_text: string | null;
  created_at: string;
  reviewer_name: string;
  reviewer_photo: string | null;
}

export const postReview = async (
  adId: number,
  starRating: number,
  reviewText: string | null
): Promise<Review> => {
  const res = await api.post<{ data: Review }>('/api/reviews', {
    ad_id: adId,
    star_rating: starRating,
    review_text: reviewText,
  });
  return res.data.data;
};

export const getReviewsByAdId = async (adId: number): Promise<Review[]> => {
  const res = await api.get<{ data: Review[] }>(`/api/reviews`, {
    params: { adId }
  });
  return res.data.data;
};
