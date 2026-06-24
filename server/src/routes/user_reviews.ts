import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  handleCreateUserReview,
  handleGetUserReviews,
  handleDeleteUserReview,
  handleGetAllUserReviews
} from '../controllers/user_reviews.js';

const router = Router();

// Admin-only route (defined before :id/reviews wildcard to prevent routing collision)
router.get('/admin/reviews', requireAuth, requireAdmin, handleGetAllUserReviews);

// Public routes
router.get('/:id/reviews', handleGetUserReviews);

// Protected routes
router.post('/:id/reviews', requireAuth, handleCreateUserReview);
router.delete('/reviews/:reviewId', requireAuth, handleDeleteUserReview);

export default router;
