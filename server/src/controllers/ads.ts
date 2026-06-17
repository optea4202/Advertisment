import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createAd, updateAd, deleteAd } from '../services/ads.js';
import { getAdsByOwner, getAdById, getAds, getDbSuggestions, getAdsCount } from '../db/ads.js';
import { config } from '../config/index.js';
import { client, adsIndexName } from '../utils/algolia.js';

// Ad creation input validation schema
const createAdSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }).max(150),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' }).max(2000),
  category: z.string().min(1, { message: 'Category is required' }).max(100),
  price: z.coerce.number().positive({ message: 'Price must be a positive number' }),
  location: z.string().min(1, { message: 'Location is required' }).max(255),
  contact_info: z.string().min(1, { message: 'Contact information is required' }).max(500),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable()
});

export const handleCreateAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Ensure user is authenticated and local record exists
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' }
      });
    }

    // 2. Validate files upload (Max 5 images check - Invariant 5)
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 5) {
      return res.status(400).json({
        error: { message: 'An advertisement may have a maximum of 5 images.', code: 'IMAGE_LIMIT_EXCEEDED' }
      });
    }

    const filesArray = files || [];

    // 3. Validate request text body
    const bodyResult = createAdSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid advertisement details.',
          details: bodyResult.error.format()
        }
      });
    }

    // 4. Create ad via service layer
    const newAd = await createAd(req.user.id, bodyResult.data, filesArray);

    return res.status(201).json({ data: newAd });
  } catch (error) {
    next(error);
  }
};

export const handleGetMyAds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Access denied.', code: 'UNAUTHORIZED' }
      });
    }

    const ads = await getAdsByOwner(req.user.id);
    return res.status(200).json({ data: ads });
  } catch (error) {
    next(error);
  }
};

export const handleGetAdById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adId = parseInt(req.params.id);
    if (isNaN(adId)) {
      return res.status(400).json({
        error: { message: 'Invalid advertisement ID.', code: 'INVALID_ID' }
      });
    }

    const ad = await getAdById(adId);
    if (!ad) {
      return res.status(404).json({
        error: { message: 'Advertisement not found.', code: 'NOT_FOUND' }
      });
    }

    return res.status(200).json({ data: ad });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adId = parseInt(req.params.id);
    if (isNaN(adId)) {
      return res.status(400).json({
        error: { message: 'Invalid advertisement ID.', code: 'INVALID_ID' }
      });
    }

    // 1. Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' }
      });
    }

    // 2. Fetch ad and verify ownership or admin status (Invariant 2)
    const ad = await getAdById(adId);
    if (!ad) {
      return res.status(404).json({
        error: { message: 'Advertisement not found.', code: 'NOT_FOUND' }
      });
    }

    if (ad.owner_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        error: { message: 'Forbidden: You do not have permission to edit this advertisement.', code: 'FORBIDDEN' }
      });
    }

    // 3. Parse keep_images list from body
    let keepImages: string[] = [];
    if (req.body.keep_images) {
      try {
        keepImages = typeof req.body.keep_images === 'string'
          ? JSON.parse(req.body.keep_images)
          : req.body.keep_images;
      } catch (err) {
        keepImages = Array.isArray(req.body.keep_images)
          ? req.body.keep_images
          : [req.body.keep_images];
      }
    }

    // Ensure keepImages is verified as string[]
    if (!Array.isArray(keepImages)) {
      keepImages = [];
    }

    const newFiles = req.files as Express.Multer.File[] | undefined;
    const newFilesArray = newFiles || [];

    // 4. Validate image counts (Invariant 5)
    if (keepImages.length + newFilesArray.length > 5) {
      return res.status(400).json({
        error: { message: 'An advertisement may have a maximum of 5 images.', code: 'IMAGE_LIMIT_EXCEEDED' }
      });
    }

    // 5. Validate text updates
    const bodyResult = createAdSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid advertisement details.',
          details: bodyResult.error.format()
        }
      });
    }

    // 6. Update ad via service layer
    const updatedAd = await updateAd(adId, bodyResult.data, keepImages, newFilesArray);

    return res.status(200).json({ data: updatedAd });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adId = parseInt(req.params.id);
    if (isNaN(adId)) {
      return res.status(400).json({
        error: { message: 'Invalid advertisement ID.', code: 'INVALID_ID' }
      });
    }

    // 1. Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' }
      });
    }

    // 2. Fetch ad and verify ownership or admin status (Invariant 2)
    const ad = await getAdById(adId);
    if (!ad) {
      return res.status(404).json({
        error: { message: 'Advertisement not found.', code: 'NOT_FOUND' }
      });
    }

    if (ad.owner_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        error: { message: 'Forbidden: You do not have permission to delete this advertisement.', code: 'FORBIDDEN' }
      });
    }

    // 3. Delete ad via service layer (handles Cloudinary images cleanup)
    await deleteAd(adId);

    return res.status(200).json({
      data: { message: 'Advertisement deleted successfully.' }
    });
  } catch (error) {
    next(error);
  }
};

// Zod schema for GET /api/ads query parameters
const getAdsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(12)
});

export const handleGetAds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryResult = getAdsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid query parameters.',
          details: queryResult.error.format()
        }
      });
    }

    const { category, search, page, limit } = queryResult.data;
    const ads = await getAds({ category, search, page, limit });
    const total = await getAdsCount({ category, search });

    return res.status(200).json({
      data: {
        ads,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q;
    const queryStr = typeof q === 'string' ? q.trim() : '';

    if (!queryStr) {
      return res.status(200).json({
        data: { categories: [], titles: [] }
      });
    }

    let categories: string[] = [];
    let titles: string[] = [];

    // 1. Always fetch categories from DB since there are few categories and it's fast
    const dbSuggestions = await getDbSuggestions(queryStr);
    categories = dbSuggestions.categories;

    // 2. Attempt to fetch titles from Algolia if configured
    const isAlgoliaEnabled = !!(client && 
                             config.ALGOLIA_APP_ID && 
                             config.ALGOLIA_ADMIN_API_KEY && 
                             !config.ALGOLIA_APP_ID.includes('placeholder') && 
                             !config.ALGOLIA_ADMIN_API_KEY.includes('placeholder'));
    
    let fetchedFromAlgolia = false;

    if (isAlgoliaEnabled && client) {
      try {
        const algoliaRes = await client.searchSingleIndex({
          indexName: adsIndexName,
          searchParams: {
            query: queryStr,
            hitsPerPage: 10,
          }
        });

        if (algoliaRes && algoliaRes.hits) {
          const uniqueTitles = new Set<string>();
          for (const hit of algoliaRes.hits) {
            if ((hit as any).title) {
              uniqueTitles.add((hit as any).title);
            }
          }
          titles = Array.from(uniqueTitles).slice(0, 5);
          fetchedFromAlgolia = true;
        }
      } catch (algoliaError) {
        console.warn('Algolia search suggestions failed, falling back to DB:', algoliaError);
      }
    }

    // 3. Fall back to PostgreSQL titles search if Algolia was not queried or failed
    if (!fetchedFromAlgolia) {
      titles = dbSuggestions.titles;
    }

    return res.status(200).json({
      data: { categories, titles }
    });
  } catch (error) {
    next(error);
  }
};

