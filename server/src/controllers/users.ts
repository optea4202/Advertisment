import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getOrCreateUser, updateProfile, getPublicProfile } from '../services/users.js';
import { uploadImage } from '../utils/cloudinary.js';

// Input validation schema for updating user profile
const updateProfileSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(50, { message: 'Username must be less than 50 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain alphanumeric characters and underscores' }),
  phone: z.string().max(30).optional().nullable(),
  bio: z.string().max(500).optional().nullable()
});

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = req.clerkId;
    if (!clerkId) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Missing Clerk ID', code: 'UNAUTHORIZED' }
      });
    }

    // This retrieves or synchronizes the user into our PostgreSQL DB on first check
    const user = await getOrCreateUser(clerkId);
    
    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Ensure user is authenticated and local record exists
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Profile must be fetched first.', code: 'UNAUTHORIZED' }
      });
    }

    // 2. Validate request body
    const bodyResult = updateProfileSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: {
          message: 'Invalid profile details.',
          details: bodyResult.error.format()
        }
      });
    }

    const { username, phone, bio } = bodyResult.data;

    // 3. Handle file upload to Cloudinary if a photo is uploaded
    let photoUrl = req.user.photo_url;
    if (req.file) {
      try {
        console.log(`🖼️ Uploading new profile photo for user ${req.user.username}...`);
        photoUrl = await uploadImage(req.file.buffer, 'profiles');
        console.log(`✅ Uploaded photo URL: ${photoUrl}`);
      } catch (uploadErr) {
        console.error('Failed to upload profile photo to Cloudinary:', uploadErr);
        return res.status(500).json({
          error: { message: 'Failed to upload profile photo to cloud storage', code: 'CLOUDINARY_ERROR' }
        });
      }
    }

    // 4. Update user profile in PostgreSQL
    const updatedUser = await updateProfile(req.user.id, {
      username,
      phone: phone || null,
      bio: bio || null,
      photo_url: photoUrl
    });

    return res.status(200).json({ data: updatedUser });
  } catch (error: any) {
    // Check for unique constraint violation on username in PostgreSQL (error code 23505)
    if (error.code === '23505' && error.constraint === 'users_username_key') {
      return res.status(400).json({
        error: { message: 'Username is already taken by another user.', code: 'USERNAME_TAKEN' }
      });
    }
    next(error);
  }
};

export const getPublicUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idResult = z.coerce.number().int().positive().safeParse(req.params.id);
    if (!idResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid user ID.', code: 'INVALID_ID' }
      });
    }

    const profile = await getPublicProfile(idResult.data);
    if (!profile) {
      return res.status(404).json({
        error: { message: 'User not found.', code: 'NOT_FOUND' }
      });
    }

    if (profile.user.is_banned) {
      return res.status(403).json({
        error: { message: 'This account is not accessible.', code: 'FORBIDDEN' }
      });
    }

    return res.status(200).json({ data: profile });
  } catch (error) {
    next(error);
  }
};
