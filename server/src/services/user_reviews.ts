import { upsertUserReview, deleteUserReviewRecord, getUserReviewById, type DbUserReview } from '../db/user_reviews.js';
import { getUserById } from '../db/users.js';

export const createUserReview = async (
  targetUserId: number,
  reviewerId: number,
  starRating: number,
  reviewText: string
): Promise<DbUserReview> => {
  // 1. Fetch target user to check existence
  const targetUser = await getUserById(targetUserId);
  if (!targetUser) {
    const error = new Error('Target user not found');
    (error as any).code = 'USER_NOT_FOUND';
    throw error;
  }

  // 2. Enforce: A user may not review their own profile
  if (targetUserId === reviewerId) {
    const error = new Error('You cannot rate or review your own profile');
    (error as any).code = 'SELF_REVIEW_FORBIDDEN';
    throw error;
  }

  // 3. Upsert user review in database
  const review = await upsertUserReview(targetUserId, reviewerId, starRating, reviewText);

  // Fetch reviewer details for the payload return
  const reviewerDetails = await getUserById(reviewerId);
  return {
    ...review,
    reviewer_name: reviewerDetails?.username || 'Unknown User',
    reviewer_photo: reviewerDetails?.photo_url || null
  };
};

export const deleteUserReview = async (
  reviewId: number,
  requestingUserId: number,
  isAdmin: boolean
): Promise<void> => {
  const review = await getUserReviewById(reviewId);
  if (!review) {
    const error = new Error('Review not found');
    (error as any).code = 'REVIEW_NOT_FOUND';
    throw error;
  }

  // Enforce ownership or admin privilege
  if (review.reviewer_id !== requestingUserId && !isAdmin) {
    const error = new Error('Unauthorized deletion request');
    (error as any).code = 'UNAUTHORIZED_DELETION';
    throw error;
  }

  await deleteUserReviewRecord(reviewId);
};
