import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { config } from './config/index.js';
import { query, useMockDb, dbConnectionError } from './db/index.js';
import userRoutes from './routes/users.js';
import adRoutes from './routes/ads.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chats.js';
import wishlistRoutes from './routes/wishlist.js';
import reportRoutes from './routes/reports.js';
import categoryRoutes from './routes/categories.js';
import userReviewRoutes from './routes/user_reviews.js';
import ogRoutes from './routes/og.js';
import pageRoutes from './routes/pages.js';
import visitsRoutes from './routes/visits.js';
import { configureIndexSettings } from './utils/algolia.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mounting routes
// userReviewRoutes MUST be mounted before userRoutes to avoid clashing with the /:id wildcard!
app.use('/api/users', userReviewRoutes);
app.use('/api/users', userRoutes);

app.use('/api/ads', adRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/visits', visitsRoutes);

// OG preview endpoint — used by social bot rewrites (Vercel edge)
// Returns minimal HTML with Open Graph / Twitter Card meta tags for link previews
app.use('/og', ogRoutes);

// Health check endpoint (checks database connectivity)
app.get('/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (useMockDb) {
      return res.status(200).json({
        status: 'MOCK',
        database: 'Mock Database Active (Fallback)',
        error: dbConnectionError || 'Unknown connection error',
        timestamp: new Date().toISOString(),
      });
    }
    const dbCheck = await query('SELECT 1 + 1 AS result');
    if (dbCheck && dbCheck.rows && dbCheck.rows[0].result === 2) {
      res.status(200).json({
        status: 'OK',
        database: 'Connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error('Database check failed');
    }
  } catch (error) {
    next(error);
  }
});

// Global error handling middleware (Code Standards: raw SQL errors or internal details are never exposed to the client)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          message: 'File size limit exceeded. Maximum allowed upload size is 20MB per image.',
          code: 'FILE_SIZE_LIMIT_EXCEEDED'
        }
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: {
          message: 'An advertisement may have a maximum of 5 images.',
          code: 'IMAGE_LIMIT_EXCEEDED'
        }
      });
    }
  }

  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR'
    }
  });
});

// Start Express Server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Fakna Server running on port ${PORT}`);
  configureIndexSettings();
});
