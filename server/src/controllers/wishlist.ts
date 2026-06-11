import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlistByUserId,
  getWishlistIdsByUserId
} from '../db/wishlist.js';

// Input validation schema for wishlist operations
const addToWishlistSchema = z.object({
  adId: z.coerce.number().int().positive({ message: 'Valid ad ID is required' })
});

/**
 * Add an advertisement to the authenticated user's wishlist.
 */
export const handleAddToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: User profile must be synchronized first.', code: 'UNAUTHORIZED' }
      });
    }

    const result = addToWishlistSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid request body.',
          details: result.error.format()
        }
      });
    }

    const { adId } = result.data;
    await addToWishlist(req.user.id, adId);

    return res.status(200).json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove an advertisement from the authenticated user's wishlist.
 */
export const handleRemoveFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: User profile must be synchronized first.', code: 'UNAUTHORIZED' }
      });
    }

    const adIdResult = z.coerce.number().int().positive().safeParse(req.params.adId);
    if (!adIdResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid advertisement ID parameter.', code: 'INVALID_ID' }
      });
    }

    await removeFromWishlist(req.user.id, adIdResult.data);

    return res.status(200).json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all advertisements in the authenticated user's wishlist.
 */
export const handleGetWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: User profile must be synchronized first.', code: 'UNAUTHORIZED' }
      });
    }

    const ads = await getWishlistByUserId(req.user.id);
    return res.status(200).json({ data: ads });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve just the IDs of all advertisements in the authenticated user's wishlist.
 * Used by the frontend to render the filled/empty love symbol states.
 */
export const handleGetWishlistIds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: User profile must be synchronized first.', code: 'UNAUTHORIZED' }
      });
    }

    const ids = await getWishlistIdsByUserId(req.user.id);
    return res.status(200).json({ data: ids });
  } catch (error) {
    next(error);
  }
};
