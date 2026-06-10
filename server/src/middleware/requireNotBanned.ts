import { Request, Response, NextFunction } from 'express';

export const requireNotBanned = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.is_banned) {
    return res.status(403).json({
      error: { message: 'Access denied: User account has been banned.', code: 'BANNED_USER' }
    });
  }
  next();
};
