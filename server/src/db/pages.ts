import { query } from './index.js';

export interface DbPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  featured_ad_ids: number[] | null;
  created_at: Date;
  updated_at: Date;
}

export const getPages = async (): Promise<DbPage[]> => {
  const sql = `
    SELECT id, slug, title, content, featured_ad_ids, created_at, updated_at
    FROM pages
    ORDER BY slug ASC
  `;
  const res = await query(sql);
  return res.rows;
};

export const getPageById = async (id: number): Promise<DbPage | null> => {
  const sql = `
    SELECT id, slug, title, content, featured_ad_ids, created_at, updated_at
    FROM pages
    WHERE id = $1
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
};

export const getPageBySlug = async (slug: string): Promise<DbPage | null> => {
  const sql = `
    SELECT id, slug, title, content, featured_ad_ids, created_at, updated_at
    FROM pages
    WHERE LOWER(slug) = LOWER($1)
  `;
  const res = await query(sql, [slug]);
  return res.rows[0] || null;
};

export const createPage = async (
  slug: string, 
  title: string, 
  content: string, 
  featuredAdIds: number[] | null = null
): Promise<DbPage> => {
  const sql = `
    INSERT INTO pages (slug, title, content, featured_ad_ids)
    VALUES ($1, $2, $3, $4)
    RETURNING id, slug, title, content, featured_ad_ids, created_at, updated_at
  `;
  const res = await query(sql, [
    slug.toLowerCase().trim(), 
    title.trim(), 
    content.trim(), 
    featuredAdIds || []
  ]);
  return res.rows[0];
};

export const updatePage = async (
  id: number, 
  slug: string, 
  title: string, 
  content: string, 
  featuredAdIds: number[] | null = null
): Promise<DbPage> => {
  const sql = `
    UPDATE pages
    SET slug = $1, title = $2, content = $3, featured_ad_ids = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING id, slug, title, content, featured_ad_ids, created_at, updated_at
  `;
  const res = await query(sql, [
    slug.toLowerCase().trim(), 
    title.trim(), 
    content.trim(), 
    featuredAdIds || [], 
    id
  ]);
  return res.rows[0];
};

export const deletePage = async (id: number): Promise<void> => {
  const sql = `
    DELETE FROM pages
    WHERE id = $1
  `;
  await query(sql, [id]);
};
