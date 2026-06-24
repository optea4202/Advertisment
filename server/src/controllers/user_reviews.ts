import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createUserReview, deleteUserReview } from '../services/user_reviews.js';
import { getUserReviewsByTargetId, getAllUserReviews } from '../db/user_reviews.js';

const createUserReviewSchema = z.object({
  star_rating: z.coerce.number().min(1).max(5, { message: 'star_rating must be between 1 and 5' }),
  review_text: z.string().min(1, { message: 'comment content cannot be empty' }).max(1000, { message: 'comment content cannot exceed 1000 characters' })
});

const getReviewsParamsSchema = z.object({
  id: z.coerce.number().positive({ message: 'id must be a positive number' })
});

const deleteReviewParamsSchema = z.object({
  reviewId: z.coerce.number().positive({ message: 'reviewId must be a positive number' })
});

export const handleCreateUserReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' }
      });
    }

    const paramsResult = getReviewsParamsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid user ID param.', details: paramsResult.error.format() }
      });
    }

    const bodyResult = createUserReviewSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid payload details.', details: bodyResult.error.format() }
      });
    }

    const targetUserId = paramsResult.data.id;
    const { star_rating, review_text } = bodyResult.data;

    const newReview = await createUserReview(targetUserId, req.user.id, star_rating, review_text);
    return res.status(201).json({ data: newReview });
  } catch (error: any) {
    if (error.code === 'USER_NOT_FOUND') {
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

export const handleGetUserReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paramsResult = getReviewsParamsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid user ID param.', details: paramsResult.error.format() }
      });
    }

    const reviews = await getUserReviewsByTargetId(paramsResult.data.id);
    return res.status(200).json({ data: reviews });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteUserReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized.', code: 'UNAUTHORIZED' }
      });
    }

    const paramsResult = deleteReviewParamsSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid review ID param.', details: paramsResult.error.format() }
      });
    }

    await deleteUserReview(paramsResult.data.reviewId, req.user.id, req.user.is_admin);
    return res.status(200).json({ data: { success: true } });
  } catch (error: any) {
    if (error.code === 'REVIEW_NOT_FOUND') {
      return res.status(404).json({
        error: { message: error.message, code: 'NOT_FOUND' }
      });
    }
    if (error.code === 'UNAUTHORIZED_DELETION') {
      return res.status(403).json({
        error: { message: error.message, code: 'FORBIDDEN' }
      });
    }
    next(error);
  }
};

export const handleGetAllUserReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({
        error: { message: 'Forbidden.', code: 'FORBIDDEN' }
      });
    }
    const reviews = await getAllUserReviews();
    return res.status(200).json({ data: reviews });
  } catch (error) {
    next(error);
  }
};
