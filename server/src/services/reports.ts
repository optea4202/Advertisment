import { createReport, deleteReportRecord, getReportsWithDetails, DetailedReport, DbReport } from '../db/reports.js';
import { getAdById } from '../db/ads.js';
import { getUserById } from '../db/users.js';
import { getReviewById } from '../db/reviews.js';

export const reportContent = async (
  reporterId: number,
  type: 'ad' | 'user' | 'review',
  itemId: number,
  reason: string
): Promise<DbReport> => {
  // 1. Verify existence of the targeted item and prevent self-reporting
  if (type === 'ad') {
    const ad = await getAdById(itemId);
    if (!ad) {
      throw new Error('Advertisement not found');
    }
    if (ad.owner_id === reporterId) {
      throw new Error('You cannot report your own advertisement');
    }
  } else if (type === 'user') {
    const user = await getUserById(itemId);
    if (!user) {
      throw new Error('User profile not found');
    }
    if (user.id === reporterId) {
      throw new Error('You cannot report your own profile');
    }
  } else if (type === 'review') {
    const review = await getReviewById(itemId);
    if (!review) {
      throw new Error('Review not found');
    }
    if (review.reviewer_id === reporterId) {
      throw new Error('You cannot report your own review');
    }
  } else {
    throw new Error('Invalid reported item type');
  }

  // 2. Save report to the database
  return await createReport(reporterId, type, itemId, reason);
};

export const getReports = async (): Promise<DetailedReport[]> => {
  return await getReportsWithDetails();
};

export const deleteReport = async (reportId: number): Promise<void> => {
  await deleteReportRecord(reportId);
};
