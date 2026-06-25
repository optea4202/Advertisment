import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { 
  getPages, 
  getPageBySlug, 
  createPage, 
  updatePage, 
  deletePage 
} from '../services/pages.js';
import { getAdsByIds, type DbAd } from '../db/ads.js';

const pageSchema = z.object({
  slug: z.string({
    required_error: 'Page slug is required',
  }).min(1, 'Page slug must not be empty').max(50, 'Page slug must be under 50 characters'),
  title: z.string({
    required_error: 'Page title is required',
  }).min(1, 'Page title must not be empty').max(255, 'Page title must be under 255 characters'),
  content: z.string({
    required_error: 'Page content is required',
  }).min(1, 'Page content must not be empty'),
  featured_ad_ids: z.array(z.number()).max(12).optional().nullable()
});

export const handleGetPages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await getPages();
    return res.status(200).json({
      data: list
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetPageBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const page = await getPageBySlug(slug);
    if (!page) {
      return res.status(404).json({
        error: { message: `Page with slug '${slug}' not found`, code: 'NOT_FOUND' }
      });
    }

    let featuredAds: DbAd[] = [];
    if (slug.toLowerCase() === 'home' && page.featured_ad_ids && page.featured_ad_ids.length > 0) {
      featuredAds = await getAdsByIds(page.featured_ad_ids);
    }

    return res.status(200).json({
      data: {
        ...page,
        featured_ads: featuredAds
      }
    });
  } catch (error) {
    next(error);
  }
};

export const handleCreatePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = pageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid request body.',
          details: parseResult.error.format()
        }
      });
    }

    const newPage = await createPage(
      parseResult.data.slug,
      parseResult.data.title,
      parseResult.data.content,
      parseResult.data.featured_ad_ids ?? null
    );
    return res.status(201).json({
      data: newPage
    });
  } catch (error: any) {
    if (
      error.message === 'Page slug cannot be empty' || 
      error.message === 'Page slug must only contain alphanumeric characters, dashes, and underscores' ||
      error.message === 'Page title cannot be empty' ||
      error.message === 'Page content cannot be empty' ||
      error.message === 'Page slug already exists'
    ) {
      return res.status(400).json({
        error: { message: error.message, code: 'BAD_REQUEST' }
      });
    }
    next(error);
  }
};

export const handleUpdatePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: { message: 'Invalid page ID.', code: 'INVALID_ID' }
      });
    }

    const parseResult = pageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid request body.',
          details: parseResult.error.format()
        }
      });
    }

    const updated = await updatePage(
      id,
      parseResult.data.slug,
      parseResult.data.title,
      parseResult.data.content,
      parseResult.data.featured_ad_ids ?? null
    );
    return res.status(200).json({
      data: updated
    });
  } catch (error: any) {
    if (error.message === 'Page not found') {
      return res.status(404).json({
        error: { message: error.message, code: 'NOT_FOUND' }
      });
    }
    if (
      error.message === 'Page slug cannot be empty' || 
      error.message === 'Page slug must only contain alphanumeric characters, dashes, and underscores' ||
      error.message === 'Page title cannot be empty' ||
      error.message === 'Page content cannot be empty' ||
      error.message === 'Page slug already exists'
    ) {
      return res.status(400).json({
        error: { message: error.message, code: 'BAD_REQUEST' }
      });
    }
    next(error);
  }
};

export const handleDeletePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: { message: 'Invalid page ID.', code: 'INVALID_ID' }
      });
    }

    await deletePage(id);
    return res.status(200).json({
      data: { message: 'Page deleted successfully.' }
    });
  } catch (error: any) {
    if (error.message === 'Page not found') {
      return res.status(404).json({
        error: { message: error.message, code: 'NOT_FOUND' }
      });
    }
    next(error);
  }
};
