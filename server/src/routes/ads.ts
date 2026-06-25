import { Router } from 'express';
import multer from 'multer';
import { 
  handleCreateAd, 
  handleGetMyAds, 
  handleGetAdById, 
  handleUpdateAd, 
  handleDeleteAd, 
  handleGetAds,
  handleGetSuggestions
} from '../controllers/ads.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { requireNotBanned } from '../middleware/requireNotBanned.js';

const router = Router();

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 // 500KB limit per image
  }
});

// POST /api/ads - Create a new advertisement (supports up to 5 images)
router.post('/', requireAuth, requireNotBanned, upload.array('images', 10), handleCreateAd);

// GET /api/ads - Retrieve all ads matching optional search and category filters
router.get('/', optionalAuth, requireNotBanned, handleGetAds);

// GET /api/ads/mine - Retrieve all ads owned by the current authenticated user
router.get('/mine', requireAuth, requireNotBanned, handleGetMyAds);

// GET /api/ads/suggestions - Retrieve autocomplete suggestions matching a query
router.get('/suggestions', optionalAuth, requireNotBanned, handleGetSuggestions);

// GET /api/ads/:id - Retrieve details of a single advertisement
router.get('/:id', optionalAuth, requireNotBanned, handleGetAdById);

// PUT /api/ads/:id - Update advertisement details and images
router.put('/:id', requireAuth, requireNotBanned, upload.array('images', 10), handleUpdateAd);

// DELETE /api/ads/:id - Delete an advertisement and cleanup assets
router.delete('/:id', requireAuth, requireNotBanned, handleDeleteAd);

export default router;
