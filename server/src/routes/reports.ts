import { Router } from 'express';
import { handleCreateReport, handleGetReports, handleDeleteReport } from '../controllers/reports.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireNotBanned } from '../middleware/requireNotBanned.js';

const router = Router();

// POST /api/reports - Report an ad, user, or review
router.post('/', requireAuth, requireNotBanned, handleCreateReport);

// GET /api/reports - Retrieve all reports (Admin only)
router.get('/', requireAuth, requireAdmin, handleGetReports);

// DELETE /api/reports/:id - Dismiss/resolve a report (Admin only)
router.delete('/:id', requireAuth, requireAdmin, handleDeleteReport);

export default router;
