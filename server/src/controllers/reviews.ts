import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createReview } from '../services/reviews.js';
import { getReviewsByAdId } from '../db/reviews.js';

const createReviewSchema = z.object({
  ad_id: z.coerce.number().positive({ message: 'ad_id must be a positive number' }),
  star_rating: z.coerce.number().min(1).max(5, { message: 'star_rating must be between 1 and 5' }),
  review_text: z.string().max(1000, { message: 'review_text cannot exceed 1000 characters' }).nullable().optional()
});

const getReviewsQuerySchema = z.object({
  adId: z.coerce.number().positive({ message: 'adId must be a positive number' })
});

export const handleCreateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' }
      });
    }

    // 2. Validate body
    const bodyResult = createReviewSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid review payload details.',
          details: bodyResult.error.format()
        }
      });
    }

    const { ad_id, star_rating, review_text } = bodyResult.data;

    // 3. Delegate to service layer
    const newReview = await createReview(ad_id, req.user.id, star_rating, review_text || null);

    return res.status(201).json({ data: newReview });
  } catch (error: any) {
    if (error.code === 'AD_NOT_FOUND') {
      return res.status(404).json({
        error: { message: error.message, code: 'NOT_FOUND' }
      });
    }
    if (error.code === 'SELF_REVIEW_FORBIDDEN') {
      return res.status(403).json({
        error: { message: error.message, code: 'FORBIDDEN' }
      });
    }
    next(error);
  }
};

export const handleGetReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate query parameter
    const queryResult = getReviewsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid query parameters.',
          details: queryResult.error.format()
        }
      });
    }

    const { adId } = queryResult.data;

    // 2. Fetch from database query layer
    const reviews = await getReviewsByAdId(adId);

    return res.status(200).json({ data: reviews });
  } catch (error) {
    next(error);
  }
};
