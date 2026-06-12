import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { getUserByClerkId } from '../db/users.js';

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
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
    }
  } catch (error: any) {
    // Log warning but do not block the request, let user proceed as guest
    console.warn('Optional authentication token verification failed:', error.message || error);
  }
  next();
};
