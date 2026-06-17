import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../services/categories.js';

const categorySchema = z.object({
  name: z.string({
    required_error: 'Category name is required',
  }).min(1, 'Category name must not be empty').max(100, 'Category name must be under 100 characters'),
  symbol: z.string().min(1, 'Category symbol must not be empty').max(50, 'Category symbol must be under 50 characters').optional().default('category'),
  parent_id: z.number().nullable().optional()
});

export const handleGetCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await getCategories();
    return res.status(200).json({
      data: list
    });
  } catch (error) {
    next(error);
  }
};

export const handleCreateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = categorySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid request body.',
          details: parseResult.error.format()
        }
      });
    }

    const category = await createCategory(
      parseResult.data.name, 
      parseResult.data.symbol,
      parseResult.data.parent_id ?? null
    );
    return res.status(201).json({
      data: category
    });
  } catch (error: any) {
    if (
      error.message === 'Category already exists' || 
      error.message === 'Category name cannot be empty' ||
      error.message === 'Category symbol cannot be empty' ||
      error.message === 'Parent category not found' ||
      error.message === 'A category cannot be its own parent' ||
      error.message === 'Cyclic dependency: parent category is a child of this category'
    ) {
      return res.status(400).json({
        error: { message: error.message, code: 'BAD_REQUEST' }
      });
    }
    next(error);
  }
};

export const handleUpdateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: { message: 'Invalid category ID.', code: 'INVALID_ID' }
      });
    }

    const parseResult = categorySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid request body.',
          details: parseResult.error.format()
        }
      });
    }

    const updated = await updateCategory(
      id, 
      parseResult.data.name, 
      parseResult.data.symbol,
      parseResult.data.parent_id ?? null
    );
    return res.status(200).json({
      data: updated
    });
  } catch (error: any) {
    if (error.message === 'Category not found') {
      return res.status(404).json({
        error: { message: error.message, code: 'NOT_FOUND' }
      });
    }
    if (
      error.message === 'Category already exists' ||
      error.message === 'Category name already exists' ||
      error.message === 'Cannot edit the Other category' ||
      error.message === 'Cannot rename a category to Other' ||
      error.message === 'Category name cannot be empty' ||
      error.message === 'Category symbol cannot be empty' ||
      error.message === 'Parent category not found' ||
      error.message === 'A category cannot be its own parent' ||
      error.message === 'Cyclic dependency: parent category is a child of this category'
    ) {
      return res.status(400).json({
        error: { message: error.message, code: 'BAD_REQUEST' }
      });
    }
    next(error);
  }
};

export const handleDeleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        error: { message: 'Invalid category ID.', code: 'INVALID_ID' }
      });
    }

    await deleteCategory(id);
    return res.status(200).json({
      data: { message: 'Category deleted successfully.' }
    });
  } catch (error: any) {
    if (error.message === 'Category not found') {
      return res.status(404).json({
        error: { message: error.message, code: 'NOT_FOUND' }
      });
    }
    if (error.message === 'Cannot delete the Other category') {
      return res.status(400).json({
        error: { message: error.message, code: 'BAD_REQUEST' }
      });
    }
    next(error);
  }
};
