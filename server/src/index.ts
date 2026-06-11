import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { query } from './db/index.js';
import userRoutes from './routes/users.js';
import adRoutes from './routes/ads.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chats.js';
import wishlistRoutes from './routes/wishlist.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mounting routes
app.use('/api/users', userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health check endpoint (checks database connectivity)
app.get('/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
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
});
