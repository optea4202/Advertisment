import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({
      error: { message: 'Access denied: Admin privileges required.', code: 'ADMIN_REQUIRED' }
    });
  }
  next();
};
