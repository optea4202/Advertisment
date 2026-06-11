import { Router } from 'express';
import {
  handleAddToWishlist,
  handleRemoveFromWishlist,
  handleGetWishlist,
  handleGetWishlistIds
} from '../controllers/wishlist.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireNotBanned } from '../middleware/requireNotBanned.js';

const router = Router();

// Apply auth and ban middleware to protect all wishlist actions
router.use(requireAuth, requireNotBanned);

// GET /api/wishlist - Get full details of all ads in the user's wishlist
router.get('/', handleGetWishlist);

// GET /api/wishlist/ids - Get just the IDs of all wishlisted ads
router.get('/ids', handleGetWishlistIds);

// POST /api/wishlist - Add an ad to the user's wishlist
router.post('/', handleAddToWishlist);

// DELETE /api/wishlist/:adId - Remove an ad from the user's wishlist
router.delete('/:adId', handleRemoveFromWishlist);

export default router;
