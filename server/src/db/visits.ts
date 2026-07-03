import { query } from './index.js';

export const incrementVisitCount = async (): Promise<number> => {
  const result = await query(
    'UPDATE site_visits SET count = count + 1 RETURNING count'
  );
  return result.rows[0]?.count || 0;
};

export const getVisitCount = async (): Promise<number> => {
  const result = await query('SELECT count FROM site_visits LIMIT 1');
  return result.rows[0]?.count || 0;
};
