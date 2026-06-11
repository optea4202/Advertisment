import api from './index.js';
import type { Conversation, Message } from '../types/Chat.js';

export const startConversation = async (
  sellerId: number,
  adId: number | null
): Promise<Conversation> => {
  const res = await api.post<{ data: Conversation }>('/api/chats', {
    seller_id: sellerId,
    ad_id: adId,
  });
  return res.data.data;
};

export const getConversations = async (): Promise<Conversation[]> => {
  const res = await api.get<{ data: Conversation[] }>('/api/chats');
  return res.data.data;
};

export const getMessages = async (conversationId: number): Promise<Message[]> => {
  const res = await api.get<{ data: Message[] }>(`/api/chats/${conversationId}/messages`);
  return res.data.data;
};

export const sendMessage = async (
  conversationId: number,
  messageText: string
): Promise<Message> => {
  const res = await api.post<{ data: Message }>(`/api/chats/${conversationId}/messages`, {
    message_text: messageText,
  });
  return res.data.data;
};
