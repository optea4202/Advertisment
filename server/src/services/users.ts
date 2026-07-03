import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  getUserByClerkId,
  createUser,
  updateUser,
  getPublicUserById,
  getUserById,
  deleteUser,
  searchUsers as dbSearchUsers,
  type DbUser,
  type PublicUser
} from '../db/users.js';
import { getAdsByOwner } from '../db/ads.js';
import type { DbAd } from '../db/ads.js';
import { getUserReviewsStats } from '../db/user_reviews.js';
import { syncUserToAlgolia, deleteUserFromAlgolia, deleteAdFromAlgolia } from '../utils/algolia.js';
import { deleteImageByUrl } from '../utils/cloudinary.js';
import { getConversationsForUser, getMessageImageUrlsForConversation } from '../db/chats.js';

/**
 * Gets the local database user by Clerk ID. If the user does not exist yet,
 * retrieves their information from Clerk and creates a new local database record.
 */
export const getOrCreateUser = async (clerkId: string): Promise<DbUser> => {
  const existingUser = await getUserByClerkId(clerkId);
  if (existingUser) {
    return existingUser;
  }

  // Fetch user details from Clerk SDK
  console.log(`👤 User ${clerkId} not found in database. Fetching profile from Clerk...`);
  const clerkUser = await clerkClient.users.getUser(clerkId);
  
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error(`User ${clerkId} has no email address associated in Clerk.`);
  }

  // Create a default username if not set on Clerk
  const username = 
    clerkUser.username || 
    (clerkUser.firstName ? `${clerkUser.firstName.toLowerCase()}_${Math.floor(1000 + Math.random() * 9000)}` : `user_${clerkId.substring(5, 13)}`);
  
  const photoUrl = clerkUser.imageUrl || null;

  const newUser = await createUser(clerkId, username, email, photoUrl, null, null);
  console.log(`✅ Created database record for user: ${username} (${email})`);
  await syncUserToAlgolia(newUser);
  return newUser;
};

/**
 * Updates the local database user profile.
 */
export const updateProfile = async (
  userId: number,
  updates: {
    username: string;
    photo_url?: string | null;
    phone?: string | null;
    bio?: string | null;
  }
): Promise<DbUser> => {
  const updatedUser = await updateUser(userId, updates);
  await syncUserToAlgolia(updatedUser);
  return updatedUser;
};

export interface PublicProfileResult {
  user: PublicUser;
  ads: DbAd[];
  avg_rating: number;
  total_reviews: number;
}

/**
 * Retrieves a non-sensitive public profile for any user by their numeric database ID.
 * Returns null if the user is not found or is banned.
 */
export const getPublicProfile = async (userId: number): Promise<PublicProfileResult | null> => {
  const user = await getPublicUserById(userId);
  if (!user) return null;

  const ads = await getAdsByOwner(userId);
  const stats = await getUserReviewsStats(userId);
  return { 
    user, 
    ads,
    avg_rating: stats.avg_rating,
    total_reviews: stats.total_reviews
  };
};

/**
 * Search for users by a username query string.
 * Excludes banned users and the requesting user.
 */
export const searchUsers = async (q: string, excludeId: number): Promise<PublicUser[]> => {
  return await dbSearchUsers(q, excludeId);
};

/**
 * Permanently terminates a user account and deletes all associated resources.
 */
export const terminateUserAccount = async (userId: number, clerkId: string): Promise<void> => {
  console.log(`⚠️ Initiating account termination for User #${userId} (Clerk ID: ${clerkId})...`);
  
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // 1. Clean up user's advertisements and ad images
  const ads = await getAdsByOwner(userId);
  console.log(`🖼️ Cleaning up ${ads.length} ads for User #${userId}...`);
  for (const ad of ads) {
    if (ad.images && ad.images.length > 0) {
      const deletePromises = ad.images.map((img) => deleteImageByUrl(img.cloudinary_url));
      await Promise.all(deletePromises);
    }
    await deleteAdFromAlgolia(ad.id);
  }

  // 2. Clean up message images in all conversations the user is in
  const conversations = await getConversationsForUser(userId);
  console.log(`💬 Cleaning up message images from ${conversations.length} conversations for User #${userId}...`);
  for (const conv of conversations) {
    const imageUrls = await getMessageImageUrlsForConversation(conv.id);
    if (imageUrls.length > 0) {
      await Promise.all(imageUrls.map((url) => deleteImageByUrl(url)));
    }
  }

  // 3. Clean up profile photo
  if (user.photo_url) {
    console.log(`👤 Deleting profile photo for User #${userId}...`);
    await deleteImageByUrl(user.photo_url);
  }

  // 4. Delete user search object from Algolia
  await deleteUserFromAlgolia(userId);

  // 5. Delete user from Clerk (non-blocking if it fails)
  try {
    await clerkClient.users.deleteUser(clerkId);
    console.log(`✅ Deleted user ${clerkId} from Clerk.`);
  } catch (clerkErr) {
    console.error(`❌ Failed to delete user ${clerkId} from Clerk:`, clerkErr);
  }

  // 6. Delete user from database (cascades ads, ad_images, comments, reports, chats, messages)
  await deleteUser(userId);
  console.log(`✅ User #${userId} database record deleted successfully.`);
};

