import { Router } from 'express';
import { 
  handleAdminGetAds, 
  handleAdminDeleteAd, 
  handleAdminGetReviews, 
  handleAdminDeleteReview, 
  handleAdminGetUsers, 
  handleAdminBanUser 
} from '../controllers/admin.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// Protect all routes with auth + admin check
router.use(requireAuth);
router.use(requireAdmin);

// Ads moderation
router.get('/ads', handleAdminGetAds);
router.delete('/ads/:id', handleAdminDeleteAd);

// Reviews moderation
router.get('/reviews', handleAdminGetReviews);
router.delete('/reviews/:id', handleAdminDeleteReview);

// Users moderation
router.get('/users', handleAdminGetUsers);
router.post('/users/:id/ban', handleAdminBanUser);

export default router;
