import { Router } from 'express';
import multer from 'multer';
import {
  handleStartConversation,
  handleGetConversations,
  handleGetMessages,
  handleSendMessage,
} from '../controllers/chats.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireNotBanned } from '../middleware/requireNotBanned.js';

const router = Router();

// Configure multer for memory storage (for chat image uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// POST /api/chats — Start or retrieve an existing conversation with a seller
router.post('/', requireAuth, requireNotBanned, handleStartConversation);

// GET /api/chats — Retrieve all conversations for the authenticated user
router.get('/', requireAuth, requireNotBanned, handleGetConversations);

// GET /api/chats/:id/messages — Load message history for a specific conversation
router.get('/:id/messages', requireAuth, requireNotBanned, handleGetMessages);

// POST /api/chats/:id/messages — Send a message in a conversation (supports optional photo upload)
router.post('/:id/messages', requireAuth, requireNotBanned, upload.single('photo'), handleSendMessage);

export default router;
