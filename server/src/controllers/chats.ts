import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  startOrFetchConversation,
  fetchConversationsForUser,
  fetchMessages,
  sendMessage,
  editMessage,
  removeMessage,
  removeConversation,
} from '../services/chats.js';
import { uploadImage } from '../utils/cloudinary.js';

const startConversationSchema = z.object({
  seller_id: z.coerce.number().positive({ message: 'seller_id must be a positive number' }),
  ad_id: z.coerce.number().positive().nullable().optional(),
});

const sendMessageSchema = z.object({
  message_text: z
    .string()
    .max(2000, { message: 'message_text cannot exceed 2000 characters' })
    .optional()
    .default(''),
});

const conversationIdSchema = z.object({
  id: z.coerce.number().positive({ message: 'id must be a positive number' }),
});

export const handleStartConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' },
      });
    }

    const bodyResult = startConversationSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid request payload.', details: bodyResult.error.format() },
      });
    }

    const { seller_id, ad_id } = bodyResult.data;
    const conversation = await startOrFetchConversation(
      req.user.id,
      seller_id,
      ad_id ?? null
    );

    return res.status(200).json({ data: conversation });
  } catch (error: any) {
    if (error.code === 'SELF_CHAT_FORBIDDEN') {
      return res.status(403).json({ error: { message: error.message, code: 'FORBIDDEN' } });
    }
    if (error.code === 'AD_NOT_FOUND') {
      return res.status(404).json({ error: { message: error.message, code: 'NOT_FOUND' } });
    }
    next(error);
  }
};

export const handleGetConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' },
      });
    }

    const conversations = await fetchConversationsForUser(req.user.id);
    return res.status(200).json({ data: conversations });
  } catch (error) {
    next(error);
  }
};

export const handleGetMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' },
      });
    }

    const paramsResult = conversationIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid conversation id.', details: paramsResult.error.format() },
      });
    }

    const messages = await fetchMessages(paramsResult.data.id, req.user.id);
    return res.status(200).json({ data: messages });
  } catch (error: any) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: { message: error.message, code: 'NOT_FOUND' } });
    }
    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({ error: { message: error.message, code: 'FORBIDDEN' } });
    }
    next(error);
  }
};

export const handleSendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' },
      });
    }

    const paramsResult = conversationIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid conversation id.', details: paramsResult.error.format() },
      });
    }

    const bodyResult = sendMessageSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid message payload.', details: bodyResult.error.format() },
      });
    }

    const messageText = bodyResult.data.message_text ?? '';
    const file = req.file as Express.Multer.File | undefined;

    // At least one of text or image must be present
    if (!messageText.trim() && !file) {
      return res.status(400).json({
        error: { message: 'A message must contain text or an image.', code: 'EMPTY_MESSAGE' },
      });
    }

    // Upload photo to Cloudinary if provided
    let imageUrl: string | null = null;
    if (file) {
      try {
        imageUrl = await uploadImage(file.buffer, 'chat_images');
      } catch (uploadErr) {
        console.error('Failed to upload chat image to Cloudinary:', uploadErr);
        return res.status(500).json({
          error: { message: 'Failed to upload image. Please try again.', code: 'UPLOAD_ERROR' },
        });
      }
    }

    const message = await sendMessage(
      paramsResult.data.id,
      req.user.id,
      messageText,
      imageUrl
    );

    return res.status(201).json({ data: message });
  } catch (error: any) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: { message: error.message, code: 'NOT_FOUND' } });
    }
    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({ error: { message: error.message, code: 'FORBIDDEN' } });
    }
    next(error);
  }
};

const messageIdSchema = z.object({
  messageId: z.coerce.number().positive({ message: 'messageId must be a positive number' }),
});

const editMessageSchema = z.object({
  message_text: z
    .string()
    .min(1, { message: 'Edited message cannot be empty' })
    .max(2000, { message: 'message_text cannot exceed 2000 characters' }),
});

export const handleEditMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' },
      });
    }

    const paramsResult = messageIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid message id.', details: paramsResult.error.format() },
      });
    }

    const bodyResult = editMessageSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid edit payload.', details: bodyResult.error.format() },
      });
    }

    const updated = await editMessage(
      paramsResult.data.messageId,
      req.user.id,
      bodyResult.data.message_text
    );

    return res.status(200).json({ data: updated });
  } catch (error: any) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: { message: error.message, code: 'NOT_FOUND' } });
    }
    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({ error: { message: error.message, code: 'FORBIDDEN' } });
    }
    if (error.code === 'BAD_REQUEST') {
      return res.status(400).json({ error: { message: error.message, code: 'BAD_REQUEST' } });
    }
    next(error);
  }
};

export const handleDeleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' },
      });
    }

    const paramsResult = messageIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid message id.', details: paramsResult.error.format() },
      });
    }

    await removeMessage(paramsResult.data.messageId, req.user.id);
    return res.status(200).json({ data: { deleted: true } });
  } catch (error: any) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: { message: error.message, code: 'NOT_FOUND' } });
    }
    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({ error: { message: error.message, code: 'FORBIDDEN' } });
    }
    next(error);
  }
};

export const handleDeleteConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { message: 'Unauthorized: Complete profile setup first.', code: 'UNAUTHORIZED' },
      });
    }

    const paramsResult = conversationIdSchema.safeParse(req.params);
    if (!paramsResult.success) {
      return res.status(400).json({
        error: { message: 'Invalid conversation id.', details: paramsResult.error.format() },
      });
    }

    await removeConversation(paramsResult.data.id, req.user.id);
    return res.status(200).json({ data: { deleted: true } });
  } catch (error: any) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: { message: error.message, code: 'NOT_FOUND' } });
    }
    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({ error: { message: error.message, code: 'FORBIDDEN' } });
    }
    next(error);
  }
};

