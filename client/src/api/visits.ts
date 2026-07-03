import api from './index.js';

export const incrementVisits = async (): Promise<number> => {
  const res = await api.post<{ data: { count: number } }>('/api/visits/increment');
  return res.data.data.count;
};
