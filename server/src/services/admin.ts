import { deleteAd } from './ads.js';
import { deleteReviewRecord } from '../db/reviews.js';
import { banUser } from '../db/users.js';
import { getAdsByOwner } from '../db/ads.js';
import { getUserById } from '../db/users.js';
import { deleteAdFromAlgolia, syncAdToAlgolia, syncUserToAlgolia } from '../utils/algolia.js';

export const adminDeleteAd = async (adId: number): Promise<void> => {
  // deleteAd already handles Cloudinary cleanup and database record deletion cascades!
  await deleteAd(adId);
};

export const adminDeleteReview = async (reviewId: number): Promise<void> => {
  await deleteReviewRecord(reviewId);
};

export const adminBanUser = async (userId: number, isBanned: boolean): Promise<void> => {
  await banUser(userId, isBanned);

  // 1. Sync User ban status to Algolia User Search
  const userRecord = await getUserById(userId);
  if (userRecord) {
    await syncUserToAlgolia(userRecord);
  }

  // 2. Hide/show banned user's ads in search index
  const ads = await getAdsByOwner(userId);
  for (const ad of ads) {
    if (isBanned) {
      await deleteAdFromAlgolia(ad.id);
    } else {
      await syncAdToAlgolia(ad);
    }
  }
};
