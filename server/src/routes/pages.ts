import { Router } from 'express';
import multer from 'multer';
import { 
  handleGetPages, 
  handleGetPageBySlug, 
  handleCreatePage, 
  handleUpdatePage, 
  handleDeletePage 
} from '../controllers/pages.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB incoming limit
  }
});

// GET /api/pages - Public retrieve of all pages
router.get('/', handleGetPages);

// GET /api/pages/:slug - Public retrieve of a single page by slug
router.get('/:slug', handleGetPageBySlug);

// POST /api/pages - Create a page (Admin only)
router.post('/', requireAuth, requireAdmin, handleCreatePage);

// PUT /api/pages/:id - Update a page (Admin only)
router.put('/:id', requireAuth, requireAdmin, upload.array('banners', 10), handleUpdatePage);

// DELETE /api/pages/:id - Delete a page (Admin only)
router.delete('/:id', requireAuth, requireAdmin, handleDeletePage);

export default router;
