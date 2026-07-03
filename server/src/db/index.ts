import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

// Parse the DATABASE_URL connection string
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

export let useMockDb = false;
export let dbConnectionError: string | null = null;

// Test the connection at startup
pool.connect()
  .then((client) => {
    console.log('?? Successfully connected to PostgreSQL database.');
    client.release();
  })
  .catch((err) => {
    console.warn('?? PostgreSQL connection failed. Falling back to In-Memory Mock Database for ads and categories.', err.message);
    useMockDb = true;
    dbConnectionError = err.message;
  });

pool.on('error', (err) => {
  if (useMockDb) return;
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Mock database storage
const mockCategories = [
  { id: 1, name: "Electronics", symbol: "devices", parent_id: null, created_at: new Date() },
  { id: 2, name: "Laptops", symbol: "laptop_mac", parent_id: 1, created_at: new Date() },
  { id: 3, name: "Phones", symbol: "smartphone", parent_id: 1, created_at: new Date() },
  { id: 4, name: "Furniture", symbol: "chair", parent_id: null, created_at: new Date() },
  { id: 5, name: "Vehicles", symbol: "directions_car", parent_id: null, created_at: new Date() },
  { id: 6, name: "Other", symbol: "more_horiz", parent_id: null, created_at: new Date() }
];

const mockAds = [
  {
    id: 1,
    owner_id: 1,
    title: "MacBook Pro M2 16GB",
    description: "Mint condition MacBook Pro M2 with 16GB RAM and 512GB SSD. Barely used, comes with original charger and box.",
    category: "Laptops",
    price: "95000.00",
    location: "Mumbai, Maharashtra",
    contact_info: "+91 9876543210",
    created_at: new Date(),
    updated_at: new Date(),
    images: [
      { id: 1, ad_id: 1, cloudinary_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80", display_order: 1 }
    ],
    owner_name: "John Doe",
    owner_photo: null
  },
  {
    id: 2,
    owner_id: 2,
    title: "iPhone 15 Pro Max 256GB",
    description: "Brand new iPhone 15 Pro Max, titanium grey. Unlocked, 100% battery health. Selling because I upgraded.",
    category: "Phones",
    price: "125000.00",
    location: "Delhi, NCR",
    contact_info: "+91 9999988888",
    created_at: new Date(Date.now() - 3600000),
    updated_at: new Date(Date.now() - 3600000),
    images: [
      { id: 2, ad_id: 2, cloudinary_url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80", display_order: 1 }
    ],
    owner_name: "Jane Smith",
    owner_photo: null
  },
  {
    id: 3,
    owner_id: 1,
    title: "Ergonomic Office Chair",
    description: "Premium ergonomic office chair with lumber support, 3D armrests, and mesh back. Perfect for long hours of home office.",
    category: "Furniture",
    price: "8500.00",
    location: "Bangalore, Karnataka",
    contact_info: "+91 9876543210",
    created_at: new Date(Date.now() - 7200000),
    updated_at: new Date(Date.now() - 7200000),
    images: [
      { id: 3, ad_id: 3, cloudinary_url: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=400&q=80", display_order: 1 }
    ],
    owner_name: "John Doe",
    owner_photo: null
  }
];

let mockVisitCount = 1250;

export const query = async (text: string, params?: any[]): Promise<pg.QueryResult<any>> => {
  const start = Date.now();

  if (useMockDb) {
    const textLower = text.toLowerCase();
    let rows: any[] = [];

    if (textLower.includes('select 1 + 1') || textLower.includes('select 1 as result')) {
      rows = [{ result: 2 }];
    } else if (textLower.includes('from categories')) {
      rows = mockCategories;
    } else if (textLower.includes('count(distinct a.id)') || textLower.includes('select count(')) {
      rows = [{ count: mockAds.length }];
    } else if (textLower.includes('from ads') || textLower.includes('select a.*')) {
      rows = mockAds;
    } else if (textLower.includes('from users')) {
      rows = [
        { id: 1, clerk_id: params?.[0] || 'user_placeholder', username: 'GuestUser', email: 'guest@zobazar.com', photo_url: null, bio: 'Mock Guest User', is_admin: true, is_banned: false }
      ];
    } else if (textLower.includes('from wishlist')) {
      rows = [];
    } else if (textLower.includes('from reports')) {
      rows = [];
    } else if (textLower.includes('from reviews') || textLower.includes('from comments')) {
      rows = [];
    } else if (textLower.includes('update site_visits')) {
      mockVisitCount++;
      rows = [{ count: mockVisitCount }];
    } else if (textLower.includes('from site_visits')) {
      rows = [{ count: mockVisitCount }];
    }

    return { 
      rows, 
      rowCount: rows.length,
      command: 'SELECT',
      oid: 0,
      fields: []
    } as pg.QueryResult<any>;
  }

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      console.warn('?? Database connection lost. Switching dynamically to In-Memory Mock Database.');
      useMockDb = true;
      return query(text, params);
    }
    console.error('Database query error:', error);
    throw error;
  }
};

