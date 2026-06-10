import { deleteAd } from './ads.js';
import { deleteReviewRecord } from '../db/reviews.js';
import { banUser } from '../db/users.js';

export const adminDeleteAd = async (adId: number): Promise<void> => {
  // deleteAd already handles Cloudinary cleanup and database record deletion cascades!
  await deleteAd(adId);
};

export const adminDeleteReview = async (reviewId: number): Promise<void> => {
  await deleteReviewRecord(reviewId);
};

export const adminBanUser = async (userId: number, isBanned: boolean): Promise<void> => {
  await banUser(userId, isBanned);
};
