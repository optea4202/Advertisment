import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { adminDeleteAd, adminDeleteReview, adminBanUser } from '../services/admin.js';
import { getAllAds } from '../db/ads.js';
import { getAllReviews } from '../db/reviews.js';
import { getAllUsers } from '../db/users.js';
import { getVisitCount } from '../db/visits.js';

const banUserSchema = z.object({
  is_banned: z.boolean({ required_error: 'is_banned boolean is required' })
});

export const handleAdminGetAds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ads = await getAllAds();
    return res.status(200).json({ data: ads });
  } catch (error) {
    next(error);
  }
};

export const handleAdminDeleteAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adId = parseInt(req.params.id);
    if (isNaN(adId)) {
      return res.status(400).json({
        error: { message: 'Invalid advertisement ID.', code: 'INVALID_ID' }
      });
    }

    await adminDeleteAd(adId);
    return res.status(200).json({
      data: { message: 'Advertisement deleted successfully by administrator.' }
    });
  } catch (error: any) {
    if (error.message === 'Advertisement not found') {
      return res.status(404).json({
        error: { message: error.message, code: 'NOT_FOUND' }
      });
    }
    next(error);
  }
};

export const handleAdminGetReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await getAllReviews();
    return res.status(200).json({ data: reviews });
  } catch (error) {
    next(error);
  }
};

export const handleAdminDeleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = parseInt(req.params.id);
    if (isNaN(reviewId)) {
      return res.status(400).json({
        error: { message: 'Invalid review ID.', code: 'INVALID_ID' }
      });
    }

    await adminDeleteReview(reviewId);
    return res.status(200).json({
      data: { message: 'Review deleted successfully by administrator.' }
    });
  } catch (error) {
    next(error);
  }
};

export const handleAdminGetUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const handleAdminBanUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: { message: 'Invalid user ID.', code: 'INVALID_ID' }
      });
    }

    // Don't let an admin ban themselves
    if (req.user && req.user.id === userId) {
      return res.status(400).json({
        error: { message: 'Forbidden: You cannot update your own ban status.', code: 'SELF_BAN_PROHIBITED' }
      });
    }

    const bodyResult = banUserSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid request body.',
          details: bodyResult.error.format()
        }
      });
    }

    await adminBanUser(userId, bodyResult.data.is_banned);
    return res.status(200).json({
      data: { message: 'User ban status updated successfully.' }
    });
  } catch (error) {
    next(error);
  }
};

export const handleAdminGetVisits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await getVisitCount();
    return res.status(200).json({ data: { count } });
  } catch (error) {
    next(error);
  }
};
