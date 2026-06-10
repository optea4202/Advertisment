import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

// Parse the DATABASE_URL connection string
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Optional query logging (for development only)
    if (process.env.NODE_ENV !== 'production') {
      console.log('executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
