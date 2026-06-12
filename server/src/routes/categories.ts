import { Router } from 'express';
import { 
  handleGetCategories, 
  handleCreateCategory, 
  handleUpdateCategory, 
  handleDeleteCategory 
} from '../controllers/categories.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

// GET /api/categories - Public retrieve of all categories
router.get('/', handleGetCategories);

// POST /api/categories - Create a category (Admin only)
router.post('/', requireAuth, requireAdmin, handleCreateCategory);

// PUT /api/categories/:id - Update a category (Admin only)
router.put('/:id', requireAuth, requireAdmin, handleUpdateCategory);

// DELETE /api/categories/:id - Delete a category (Admin only)
router.delete('/:id', requireAuth, requireAdmin, handleDeleteCategory);

export default router;
