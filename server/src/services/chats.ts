import {
  createOrGetConversation,
  getConversationsForUser,
  getConversationById,
  getMessagesForConversation,
  insertMessage,
  getMessageById,
  updateMessageText,
  deleteMessageById,
  getMessageImageUrlsForConversation,
  deleteConversationById,
  type DbConversation,
  type DbMessage,
} from '../db/chats.js';
import { getAdById } from '../db/ads.js';
import { deleteImageByUrl } from '../utils/cloudinary.js';

export const startOrFetchConversation = async (
  requestingUserId: number,
  sellerId: number,
  adId: number | null
): Promise<DbConversation> => {
  // Prevent self-chat
  if (requestingUserId === sellerId) {
    const error = new Error('You cannot start a conversation with yourself');
    (error as any).code = 'SELF_CHAT_FORBIDDEN';
    throw error;
  }

  // If adId is provided, verify it exists
  if (adId !== null) {
    const ad = await getAdById(adId);
    if (!ad) {
      const error = new Error('Advertisement not found');
      (error as any).code = 'AD_NOT_FOUND';
      throw error;
    }
  }

  return createOrGetConversation(requestingUserId, sellerId, adId);
};

export const fetchConversationsForUser = async (userId: number): Promise<DbConversation[]> => {
  return getConversationsForUser(userId);
};

export const fetchMessages = async (
  conversationId: number,
  requestingUserId: number
): Promise<DbMessage[]> => {
  // Verify the requesting user is a participant of this conversation
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    const error = new Error('Conversation not found');
    (error as any).code = 'NOT_FOUND';
    throw error;
  }

  if (conversation.buyer_id !== requestingUserId && conversation.seller_id !== requestingUserId) {
    const error = new Error('Access denied: You are not a participant of this conversation');
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  return getMessagesForConversation(conversationId);
};

export const sendMessage = async (
  conversationId: number,
  senderId: number,
  messageText: string,
  imageUrl?: string | null
): Promise<DbMessage> => {
  // Verify the sender is a participant of this conversation
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    const error = new Error('Conversation not found');
    (error as any).code = 'NOT_FOUND';
    throw error;
  }

  if (conversation.buyer_id !== senderId && conversation.seller_id !== senderId) {
    const error = new Error('Access denied: You are not a participant of this conversation');
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  return insertMessage(conversationId, senderId, messageText, imageUrl);
};

export const editMessage = async (
  messageId: number,
  requestingUserId: number,
  newText: string
): Promise<DbMessage> => {
  const message = await getMessageById(messageId);
  if (!message) {
    const error = new Error('Message not found');
    (error as any).code = 'NOT_FOUND';
    throw error;
  }

  if (message.sender_id !== requestingUserId) {
    const error = new Error('Access denied: You can only edit your own messages');
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  // Must have text content to edit
  if (!message.message_text) {
    const error = new Error('Image-only messages cannot be edited');
    (error as any).code = 'BAD_REQUEST';
    throw error;
  }

  return updateMessageText(messageId, newText);
};

export const removeMessage = async (
  messageId: number,
  requestingUserId: number
): Promise<void> => {
  const message = await getMessageById(messageId);
  if (!message) {
    const error = new Error('Message not found');
    (error as any).code = 'NOT_FOUND';
    throw error;
  }

  if (message.sender_id !== requestingUserId) {
    const error = new Error('Access denied: You can only delete your own messages');
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  // Delete associated Cloudinary image before removing the DB record
  if (message.image_url) {
    await deleteImageByUrl(message.image_url);
  }

  await deleteMessageById(messageId);
};

export const removeConversation = async (
  conversationId: number,
  requestingUserId: number
): Promise<void> => {
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    const error = new Error('Conversation not found');
    (error as any).code = 'NOT_FOUND';
    throw error;
  }

  if (conversation.buyer_id !== requestingUserId && conversation.seller_id !== requestingUserId) {
    const error = new Error('Access denied: You are not a participant of this conversation');
    (error as any).code = 'FORBIDDEN';
    throw error;
  }

  // Clean up all Cloudinary images in this conversation before cascade-deleting
  const imageUrls = await getMessageImageUrlsForConversation(conversationId);
  await Promise.all(imageUrls.map((url) => deleteImageByUrl(url)));

  await deleteConversationById(conversationId);
};


