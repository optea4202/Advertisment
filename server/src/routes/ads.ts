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
// Accept up to 20MB per file; images are auto-compressed to ≤500KB by Cloudinary before storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB incoming limit; Cloudinary will compress to ≤500KB
  }
});

// POST /api/ads - Create a new advertisement (supports up to 5 images)
router.post('/', requireAuth, requireNotBanned, upload.array('images', 5), handleCreateAd);

// GET /api/ads - Retrieve all ads matching optional search and category filters
router.get('/', optionalAuth, requireNotBanned, handleGetAds);

// GET /api/ads/mine - Retrieve all ads owned by the current authenticated user
router.get('/mine', requireAuth, requireNotBanned, handleGetMyAds);

// GET /api/ads/suggestions - Retrieve autocomplete suggestions matching a query
router.get('/suggestions', optionalAuth, requireNotBanned, handleGetSuggestions);

// GET /api/ads/:id - Retrieve details of a single advertisement
router.get('/:id', optionalAuth, requireNotBanned, handleGetAdById);

// PUT /api/ads/:id - Update advertisement details and images
router.put('/:id', requireAuth, requireNotBanned, upload.array('images', 5), handleUpdateAd);

// DELETE /api/ads/:id - Delete an advertisement and cleanup assets
router.delete('/:id', requireAuth, requireNotBanned, handleDeleteAd);

export default router;
