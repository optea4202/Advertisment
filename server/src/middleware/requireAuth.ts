import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { getUserByClerkId, DbUser } from '../db/users.js';

declare global {
  namespace Express {
    interface Request {
      clerkId?: string;
      user?: DbUser;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Missing or invalid token format', code: 'UNAUTHORIZED' }
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Clerk
    const decoded = await clerkClient.verifyToken(token);
    const clerkId = decoded.sub;

    req.clerkId = clerkId;

    // Retrieve database user profile if it exists
    const dbUser = await getUserByClerkId(clerkId);
    if (dbUser) {
      req.user = dbUser;
    }

    next();
  } catch (error: any) {
    console.error('Clerk authentication error:', error);
    return res.status(401).json({
      error: { message: `Unauthorized: Invalid token - ${error.message || error}`, code: 'UNAUTHORIZED' }
    });
  }
};
