import {
  createOrGetConversation,
  getConversationsForUser,
  getConversationById,
  getMessagesForConversation,
  insertMessage,
  type DbConversation,
  type DbMessage,
} from '../db/chats.js';
import { getAdById } from '../db/ads.js';

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
