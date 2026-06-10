import { useState, useEffect, useCallback } from 'react';
import { getReviewsByAdId, postReview as postReviewApi, type Review } from '../api/reviews.js';

export const useReviews = (adId: number) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!adId || isNaN(adId)) return;
    try {
      setLoading(true);
      const data = await getReviewsByAdId(adId);
      setReviews(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [adId]);

  const addReview = async (starRating: number, reviewText: string | null) => {
    try {
      const newReview = await postReviewApi(adId, starRating, reviewText);
      setReviews((prev) => [newReview, ...prev]);
      return newReview;
    } catch (err: any) {
      console.error('Error adding review:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refresh: fetchReviews, addReview };
};
