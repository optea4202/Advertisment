import api from './index.js';

export interface Review {
  id: number;
  ad_id: number;
  reviewer_id: number;
  review_text: string;
  created_at: string;
  reviewer_name: string;
  reviewer_photo: string | null;
}

export const postReview = async (
  adId: number,
  reviewText: string
): Promise<Review> => {
  const res = await api.post<{ data: Review }>('/api/reviews', {
    ad_id: adId,
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
