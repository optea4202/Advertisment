import { Router } from 'express';
import multer from 'multer';
import { getMe, updateMe, getPublicUser } from '../controllers/users.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireNotBanned } from '../middleware/requireNotBanned.js';

const router = Router();

// Configure multer for memory storage uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file limit
  }
});

// GET /api/users/me - Retrieve profile of the current authenticated user
router.get('/me', requireAuth, getMe);

// PUT /api/users/me - Update profile (fields + photo upload)
// Runs requireAuth first. Note: requireNotBanned is also run to block banned accounts.
router.put('/me', requireAuth, requireNotBanned, upload.single('photo'), updateMe);

// GET /api/users/:id - Retrieve the public profile of any user by numeric ID
router.get('/:id', requireAuth, requireNotBanned, getPublicUser);

export default router;
