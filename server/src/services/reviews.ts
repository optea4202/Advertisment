import { insertReview, type DbReview } from '../db/reviews.js';
import { getAdById, getAdOwnerEmailAndTitle } from '../db/ads.js';
import { getUserById } from '../db/users.js';
import { sendCommentNotificationEmail } from '../utils/resend.js';

export const createReview = async (
  adId: number,
  reviewerId: number,
  reviewText: string
): Promise<DbReview> => {
  // 1. Fetch advertisement to check existence and ownership
  const ad = await getAdById(adId);
  if (!ad) {
    const error = new Error('Advertisement not found');
    (error as any).code = 'AD_NOT_FOUND';
    throw error;
  }

  // 2. Enforce Invariant 6: A user may not review their own advertisement
  if (ad.owner_id === reviewerId) {
    const error = new Error('You cannot review your own advertisement');
    (error as any).code = 'SELF_REVIEW_FORBIDDEN';
    throw error;
  }

  // 3. Insert review record in database
  const review = await insertReview(adId, reviewerId, reviewText);

  // 4. Trigger email synchronously but non-blockingly (errors logged non-blockingly)
  Promise.all([
    getUserById(reviewerId),
    getAdOwnerEmailAndTitle(adId)
  ]).then(([reviewer, ownerInfo]) => {
    if (reviewer && ownerInfo) {
      sendCommentNotificationEmail(
        ownerInfo.email,
        ownerInfo.title,
        reviewer.username,
        reviewText
      );
    }
  }).catch(err => {
    console.error('Failed to trigger review email notification background tasks:', err);
  });

  // Fetch reviewer name and photo to return in output payload
  const reviewerDetails = await getUserById(reviewerId);
  return {
    ...review,
    reviewer_name: reviewerDetails?.username || 'Unknown User',
    reviewer_photo: reviewerDetails?.photo_url || null
  };
};
