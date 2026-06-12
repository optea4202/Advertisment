import { query } from './index.js';

export interface DbReport {
  id: number;
  reporter_id: number;
  reported_item_type: 'ad' | 'user' | 'review';
  ad_id: number | null;
  reported_user_id: number | null;
  review_id: number | null;
  reason: string;
  created_at: Date;
}

export interface DetailedReport {
  id: number;
  reporter_id: number;
  reporter_username: string;
  reported_item_type: 'ad' | 'user' | 'review';
  ad_id: number | null;
  ad_title: string | null;
  reported_user_id: number | null;
  reported_username: string | null;
  review_id: number | null;
  review_text: string | null;
  reason: string;
  created_at: Date;
}

export const createReport = async (
  reporterId: number,
  type: 'ad' | 'user' | 'review',
  itemId: number,
  reason: string
): Promise<DbReport> => {
  let sql = '';
  let params: any[] = [];
  if (type === 'ad') {
    sql = `
      INSERT INTO reports (reporter_id, reported_item_type, ad_id, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    params = [reporterId, type, itemId, reason];
  } else if (type === 'user') {
    sql = `
      INSERT INTO reports (reporter_id, reported_item_type, reported_user_id, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    params = [reporterId, type, itemId, reason];
  } else if (type === 'review') {
    sql = `
      INSERT INTO reports (reporter_id, reported_item_type, review_id, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    params = [reporterId, type, itemId, reason];
  } else {
    throw new Error('Invalid reported item type');
  }

  const res = await query(sql, params);
  return res.rows[0];
};

export const getReportsWithDetails = async (): Promise<DetailedReport[]> => {
  const sql = `
    SELECT 
      r.id,
      r.reporter_id,
      rep.username AS reporter_username,
      r.reported_item_type,
      r.ad_id,
      a.title AS ad_title,
      r.reported_user_id,
      u.username AS reported_username,
      r.review_id,
      rev.review_text AS review_text,
      r.reason,
      r.created_at
    FROM reports r
    JOIN users rep ON r.reporter_id = rep.id
    LEFT JOIN ads a ON r.ad_id = a.id
    LEFT JOIN users u ON r.reported_user_id = u.id
    LEFT JOIN reviews rev ON r.review_id = rev.id
    ORDER BY r.created_at DESC
  `;
  const res = await query(sql);
  return res.rows;
};

export const deleteReportRecord = async (reportId: number): Promise<void> => {
  const sql = `
    DELETE FROM reports
    WHERE id = $1
  `;
  await query(sql, [reportId]);
};
