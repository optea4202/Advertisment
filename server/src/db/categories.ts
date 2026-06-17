import { query } from './index.js';

export interface DbCategory {
  id: number;
  name: string;
  symbol: string;
  parent_id: number | null;
  created_at: Date;
}

export const getCategories = async (): Promise<DbCategory[]> => {
  const sql = `
    SELECT id, name, symbol, parent_id, created_at
    FROM categories
    ORDER BY CASE WHEN name = 'Other' THEN 1 ELSE 0 END, name ASC
  `;
  const res = await query(sql);
  return res.rows;
};

export const getCategoryById = async (id: number): Promise<DbCategory | null> => {
  const sql = `
    SELECT id, name, symbol, parent_id, created_at
    FROM categories
    WHERE id = $1
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
};

export const getCategoryByName = async (name: string): Promise<DbCategory | null> => {
  const sql = `
    SELECT id, name, symbol, parent_id, created_at
    FROM categories
    WHERE LOWER(name) = LOWER($1)
  `;
  const res = await query(sql, [name]);
  return res.rows[0] || null;
};

export const createCategory = async (name: string, symbol: string, parentId: number | null): Promise<DbCategory> => {
  const sql = `
    INSERT INTO categories (name, symbol, parent_id)
    VALUES ($1, $2, $3)
    RETURNING id, name, symbol, parent_id, created_at
  `;
  const res = await query(sql, [name, symbol, parentId]);
  return res.rows[0];
};

export const updateCategory = async (id: number, name: string, symbol: string, parentId: number | null): Promise<DbCategory> => {
  const sql = `
    UPDATE categories
    SET name = $1, symbol = $2, parent_id = $3
    WHERE id = $4
    RETURNING id, name, symbol, parent_id, created_at
  `;
  const res = await query(sql, [name, symbol, parentId, id]);
  return res.rows[0];
};

export const deleteCategory = async (id: number): Promise<void> => {
  const sql = `
    DELETE FROM categories
    WHERE id = $1
  `;
  await query(sql, [id]);
};

