import { useState, useEffect, useCallback } from 'react';
import { getUserReviews, postUserReview, deleteUserReview, type UserReview } from '../api/userReviews.js';

export const useUserReviews = (targetUserId: number) => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!targetUserId || isNaN(targetUserId)) return;
    try {
      setLoading(true);
      const data = await getUserReviews(targetUserId);
      setReviews(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching user reviews:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  const addUserReview = async (starRating: number, reviewText: string) => {
    try {
      const newReview = await postUserReview(targetUserId, starRating, reviewText);
      setReviews((prev) => {
        const index = prev.findIndex((r) => r.reviewer_id === newReview.reviewer_id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = newReview;
          return updated;
        }
        return [newReview, ...prev];
      });
      return newReview;
    } catch (err: any) {
      console.error('Error adding user review:', err);
      throw err;
    }
  };

  const removeUserReview = async (reviewId: number) => {
    try {
      await deleteUserReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      console.error('Error deleting user review:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refresh: fetchReviews, addUserReview, removeUserReview };
};
