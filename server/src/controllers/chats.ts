import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  startOrFetchConversation,
  fetchConversationsForUser,
  fetchMessages,
  sendMessage,
} from '../services/chats.js';

const startConversationSchema = z.object({
  seller_id: z.coerce.number().positive({ message: 'seller_id must be a positive number' }),
  ad_id: z.coerce.number().positive().nullable().optional(),
});

const sendMessageSchema = z.object({
  message_text: z
    .string()
    .min(1, { message: 'message_text cannot be empty' })
    .max(2000, { message: 'message_text cannot exceed 2000 characters' }),
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

    const message = await sendMessage(
      paramsResult.data.id,
      req.user.id,
      bodyResult.data.message_text
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
