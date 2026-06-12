import { Router } from 'express';
import { handleCreateReview, handleGetReviews } from '../controllers/reviews.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { requireNotBanned } from '../middleware/requireNotBanned.js';

const router = Router();

// POST /api/reviews - Post a rating and review on an ad (cannot own the ad)
router.post('/', requireAuth, requireNotBanned, handleCreateReview);

// GET /api/reviews - Get reviews list for an ad (?adId=)
router.get('/', optionalAuth, requireNotBanned, handleGetReviews);

export default router;
