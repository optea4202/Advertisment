import { query } from './index.js';

export interface DbUser {
  id: number;
  clerk_id: string;
  username: string;
  email: string;
  photo_url: string | null;
  phone: string | null;
  bio: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: Date;
  updated_at: Date;
}

export const createUser = async (
  clerkId: string,
  username: string,
  email: string,
  photoUrl: string | null = null,
  phone: string | null = null,
  bio: string | null = null
): Promise<DbUser> => {
  const sql = `
    INSERT INTO users (clerk_id, username, email, photo_url, phone, bio)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const res = await query(sql, [clerkId, username, email, photoUrl, phone, bio]);
  return res.rows[0];
};

export const getUserByClerkId = async (clerkId: string): Promise<DbUser | null> => {
  const sql = `
    SELECT * FROM users
    WHERE clerk_id = $1
  `;
  const res = await query(sql, [clerkId]);
  if (res.rows.length === 0) return null;
  return res.rows[0];
};

export const getUserById = async (id: number): Promise<DbUser | null> => {
  const sql = `
    SELECT * FROM users
    WHERE id = $1
  `;
  const res = await query(sql, [id]);
  if (res.rows.length === 0) return null;
  return res.rows[0];
};

export const updateUser = async (
  id: number,
  updates: {
    username: string;
    photo_url?: string | null;
    phone?: string | null;
    bio?: string | null;
  }
): Promise<DbUser> => {
  const { username, photo_url, phone, bio } = updates;
  
  // Conditionally building fields to update so we don't nullify if not provided
  const setClauses: string[] = [];
  const params: unknown[] = [id, username];
  let paramCount = 3;

  setClauses.push(`username = $2`);
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  if (photo_url !== undefined) {
    setClauses.push(`photo_url = $${paramCount++}`);
    params.push(photo_url);
  }
  if (phone !== undefined) {
    setClauses.push(`phone = $${paramCount++}`);
    params.push(phone);
  }
  if (bio !== undefined) {
    setClauses.push(`bio = $${paramCount++}`);
    params.push(bio);
  }

  const sql = `
    UPDATE users
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING *
  `;

  const res = await query(sql, params);
  return res.rows[0];
};

// Unit 8 Admin methods
export const getAllUsers = async (): Promise<DbUser[]> => {
  const sql = `
    SELECT * FROM users
    ORDER BY created_at DESC
  `;
  const res = await query(sql);
  return res.rows;
};

export interface PublicUser {
  id: number;
  username: string;
  photo_url: string | null;
  bio: string | null;
  created_at: Date;
  is_banned: boolean;
}

export const getPublicUserById = async (id: number): Promise<PublicUser | null> => {
  const sql = `
    SELECT id, username, photo_url, bio, created_at, is_banned
    FROM users
    WHERE id = $1
  `;
  const res = await query(sql, [id]);
  if (res.rows.length === 0) return null;
  return res.rows[0];
};

export const banUser = async (id: number, isBanned: boolean): Promise<DbUser> => {
  const sql = `
    UPDATE users
    SET is_banned = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const res = await query(sql, [id, isBanned]);
  return res.rows[0];
};

/**
 * Search for users by username (case-insensitive prefix/substring match).
 * Excludes banned users and the requesting user themselves.
 * Returns at most 10 results.
 */
export const searchUsers = async (q: string, excludeId: number): Promise<PublicUser[]> => {
  const sql = `
    SELECT id, username, photo_url, bio, created_at, is_banned
    FROM users
    WHERE username ILIKE $1
      AND is_banned = false
      AND id != $2
    ORDER BY username ASC
    LIMIT 10
  `;
  const res = await query(sql, [`%${q}%`, excludeId]);
  return res.rows;
};
