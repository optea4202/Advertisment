import api from './index.js';

export interface Report {
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
  created_at: string;
}

export const reportContent = async (
  type: 'ad' | 'user' | 'review',
  itemId: number,
  reason: string
): Promise<void> => {
  await api.post('/api/reports', {
    reported_item_type: type,
    reported_item_id: itemId,
    reason,
  });
};

export const getReports = async (): Promise<Report[]> => {
  const res = await api.get<{ data: Report[] }>('/api/reports');
  return res.data.data;
};

export const deleteReport = async (id: number): Promise<void> => {
  await api.delete(`/api/reports/${id}`);
};
