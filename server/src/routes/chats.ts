import { Router } from 'express';
import multer from 'multer';
import {
  handleStartConversation,
  handleGetConversations,
  handleGetMessages,
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  handleDeleteConversation,
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

// DELETE /api/chats/:id — Delete a conversation and all its messages
router.delete('/:id', requireAuth, requireNotBanned, handleDeleteConversation);

// GET /api/chats/:id/messages — Load message history for a specific conversation
router.get('/:id/messages', requireAuth, requireNotBanned, handleGetMessages);

// POST /api/chats/:id/messages — Send a message in a conversation (supports optional photo upload)
router.post('/:id/messages', requireAuth, requireNotBanned, upload.single('photo'), handleSendMessage);

// PUT /api/chats/messages/:messageId — Edit a sent message (text only)
router.put('/messages/:messageId', requireAuth, requireNotBanned, handleEditMessage);

// DELETE /api/chats/messages/:messageId — Delete a sent message
router.delete('/messages/:messageId', requireAuth, requireNotBanned, handleDeleteMessage);

export default router;

