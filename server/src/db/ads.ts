import { query } from './index.js';

export interface DbAdImage {
  id: number;
  ad_id: number;
  cloudinary_url: string;
  display_order: number;
  created_at: Date;
}

export interface DbAd {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  contact_info: string;
  created_at: Date;
  updated_at: Date;
  images?: DbAdImage[];
}

export const insertAd = async (
  ownerId: number,
  title: string,
  description: string,
  category: string,
  price: number,
  location: string,
  contactInfo: string
): Promise<DbAd> => {
  const sql = `
    INSERT INTO ads (owner_id, title, description, category, price, location, contact_info)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const res = await query(sql, [ownerId, title, description, category, price, location, contactInfo]);
  return res.rows[0];
};

export const insertAdImage = async (
  adId: number,
  cloudinaryUrl: string,
  displayOrder: number
): Promise<DbAdImage> => {
  const sql = `
    INSERT INTO ad_images (ad_id, cloudinary_url, display_order)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const res = await query(sql, [adId, cloudinaryUrl, displayOrder]);
  return res.rows[0];
};

export const getAdsByOwner = async (ownerId: number): Promise<DbAd[]> => {
  const sql = `
    SELECT a.*, 
           COALESCE(
             json_agg(
               json_build_object(
                 'id', img.id,
                 'ad_id', img.ad_id,
                 'cloudinary_url', img.cloudinary_url,
                 'display_order', img.display_order
               ) ORDER BY img.display_order
             ) FILTER (WHERE img.id IS NOT NULL),
             '[]'::json
           ) as images
    FROM ads a
    LEFT JOIN ad_images img ON a.id = img.ad_id
    WHERE a.owner_id = $1
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `;
  const res = await query(sql, [ownerId]);
  
  // Format numeric price from string to float
  return res.rows.map(row => ({
    ...row,
    price: parseFloat(row.price),
    latitude: row.latitude !== null ? parseFloat(row.latitude) : null,
    longitude: row.longitude !== null ? parseFloat(row.longitude) : null,
  }));
};

export const getAdById = async (id: number): Promise<DbAd | null> => {
  const sql = `
    SELECT a.*, 
           COALESCE(
             json_agg(
               json_build_object(
                 'id', img.id,
                 'ad_id', img.ad_id,
                 'cloudinary_url', img.cloudinary_url,
                 'display_order', img.display_order
               ) ORDER BY img.display_order
             ) FILTER (WHERE img.id IS NOT NULL),
             '[]'::json
           ) as images,
           u.username as owner_name,
           u.photo_url as owner_photo
    FROM ads a
    LEFT JOIN ad_images img ON a.id = img.ad_id
    LEFT JOIN users u ON a.owner_id = u.id
    WHERE a.id = $1
    GROUP BY a.id, u.id
  `;
  const res = await query(sql, [id]);
  if (res.rows.length === 0) return null;
  return {
    ...res.rows[0],
    price: parseFloat(res.rows[0].price),
    latitude: res.rows[0].latitude !== null ? parseFloat(res.rows[0].latitude) : null,
    longitude: res.rows[0].longitude !== null ? parseFloat(res.rows[0].longitude) : null,
  };
};

export const updateAdText = async (
  id: number,
  title: string,
  description: string,
  category: string,
  price: number,
  location: string,
  contactInfo: string
): Promise<DbAd> => {
  const sql = `
    UPDATE ads
    SET title = $2, description = $3, category = $4, price = $5, location = $6, contact_info = $7, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const res = await query(sql, [id, title, description, category, price, location, contactInfo]);
  return res.rows[0];
};

export const deleteAdRecord = async (id: number): Promise<void> => {
  const sql = `
    DELETE FROM ads
    WHERE id = $1
  `;
  await query(sql, [id]);
};

export const getAdImagesByAdId = async (adId: number): Promise<DbAdImage[]> => {
  const sql = `
    SELECT * FROM ad_images
    WHERE ad_id = $1
    ORDER BY display_order
  `;
  const res = await query(sql, [adId]);
  return res.rows;
};

export const deleteAdImagesExcept = async (adId: number, urlsToKeep: string[]): Promise<void> => {
  const sql = `
    DELETE FROM ad_images
    WHERE ad_id = $1 AND NOT (cloudinary_url = ANY($2))
  `;
  await query(sql, [adId, urlsToKeep]);
};

export const getAds = async (filters: { category?: string; search?: string }): Promise<DbAd[]> => {
  const values: any[] = [];
  const whereClauses: string[] = ['u.is_banned = FALSE'];

  if (filters.category) {
    values.push(filters.category);
    whereClauses.push(`a.category = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    whereClauses.push(`(a.title ILIKE $${values.length} OR a.description ILIKE $${values.length})`);
  }

  const whereStr = `WHERE ${whereClauses.join(' AND ')}`;

  const sql = `
    SELECT a.*, 
           COALESCE(
             json_agg(
               json_build_object(
                 'id', img.id,
                 'ad_id', img.ad_id,
                 'cloudinary_url', img.cloudinary_url,
                 'display_order', img.display_order
               ) ORDER BY img.display_order
             ) FILTER (WHERE img.id IS NOT NULL),
             '[]'::json
           ) as images,
           u.username as owner_name,
           u.photo_url as owner_photo
    FROM ads a
    LEFT JOIN ad_images img ON a.id = img.ad_id
    LEFT JOIN users u ON a.owner_id = u.id
    ${whereStr}
    GROUP BY a.id, u.id
    ORDER BY a.created_at DESC
  `;

  const res = await query(sql, values);
  return res.rows.map(row => ({
    ...row,
    price: parseFloat(row.price),
    latitude: row.latitude !== null ? parseFloat(row.latitude) : null,
    longitude: row.longitude !== null ? parseFloat(row.longitude) : null,
  }));
};

export const getAdOwnerEmailAndTitle = async (adId: number): Promise<{ email: string; title: string } | null> => {
  const sql = `
    SELECT u.email, a.title
    FROM ads a
    JOIN users u ON a.owner_id = u.id
    WHERE a.id = $1
  `;
  const res = await query(sql, [adId]);
  if (res.rows.length === 0) return null;
  return res.rows[0];
};

export const getAllAds = async (): Promise<DbAd[]> => {
  return getAds({});
};




