import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { reportContent, getReports, deleteReport } from '../services/reports.js';

const reportSchema = z.object({
  reported_item_type: z.enum(['ad', 'user', 'review'], {
    required_error: 'reported_item_type is required',
  }),
  reported_item_id: z.number({
    required_error: 'reported_item_id is required',
  }),
  reason: z.string({
    required_error: 'reason is required',
  }).min(1, 'Reason must not be empty').max(1000, 'Reason must be under 1000 characters')
});

export const handleCreateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodyResult = reportSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid request body.',
          details: bodyResult.error.format()
        }
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: User profile not found.', code: 'UNAUTHORIZED' }
      });
    }

    const { reported_item_type, reported_item_id, reason } = bodyResult.data;
    const report = await reportContent(req.user.id, reported_item_type, reported_item_id, reason);

    return res.status(201).json({
      data: report
    });
  } catch (error: any) {
    if (
      error.message === 'Advertisement not found' ||
      error.message === 'User profile not found' ||
      error.message === 'Review not found'
    ) {
      return res.status(404).json({
        error: { message: error.message, code: 'NOT_FOUND' }
      });
    }
    if (error.message.includes('cannot report your own')) {
      return res.status(400).json({
        error: { message: error.message, code: 'SELF_REPORT_PROHIBITED' }
      });
    }
    next(error);
  }
};

export const handleGetReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await getReports();
    return res.status(200).json({
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reportId = parseInt(req.params.id);
    if (isNaN(reportId)) {
      return res.status(400).json({
        error: { message: 'Invalid report ID.', code: 'INVALID_ID' }
      });
    }

    await deleteReport(reportId);
    return res.status(200).json({
      data: { message: 'Report resolved/dismissed successfully.' }
    });
  } catch (error) {
    next(error);
  }
};
