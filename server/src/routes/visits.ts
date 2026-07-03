import { Router, Request, Response, NextFunction } from 'express';
import { incrementVisitCount } from '../db/visits.js';

const router = Router();

// POST /api/visits/increment - Public endpoint to increment site visits count
router.post('/increment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await incrementVisitCount();
    return res.status(200).json({ data: { count } });
  } catch (error) {
    next(error);
  }
});

export default router;
