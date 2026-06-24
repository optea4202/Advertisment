import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.js';
import { getConversations } from '../api/chats.js';
import type { Conversation } from '../types/Chat.js';

interface ChatContextType {
  conversations: Conversation[];
  loadingConvs: boolean;
  error: Error | null;
  unreadCount: number;
  hasUnreadMessages: boolean;
  refreshConversations: () => Promise<void>;
  markAsRead: (conversationId: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 3500;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Track last seen message timestamp for each conversation
  const [lastReadTimes, setLastReadTimes] = useState<Record<number, string>>(() => {
    try {
      const stored = localStorage.getItem('adhub_chats_read_timestamps');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const fetchConversations = useCallback(async () => {
    if (!user || !isAuthenticated) return;
    try {
      const data = await getConversations();
      setConversations(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err);
    } finally {
      setLoadingConvs(false);
    }
  }, [user, isAuthenticated]);

  // Initial fetch and polling
  useEffect(() => {
    if (!user || !isAuthenticated) {
      setConversations([]);
      setLoadingConvs(false);
      return;
    }

    setLoadingConvs(true);
    fetchConversations();

    const intervalId = setInterval(fetchConversations, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [user, isAuthenticated, fetchConversations]);

  const markAsRead = useCallback((conversationId: number) => {
    setLastReadTimes((prev) => {
      const nowStr = new Date().toISOString();
      const updated = { ...prev, [conversationId]: nowStr };
      localStorage.setItem('adhub_chats_read_timestamps', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Compute unread metrics
  const unreadCount = conversations.reduce((count, conv) => {
    if (!user) return 0;
    
    // If no message, or if the current user sent the last message, it's not unread
    if (!conv.last_message_at || conv.last_message_sender_id === user.id) {
      return count;
    }

    const lastRead = lastReadTimes[conv.id];
    if (!lastRead) {
      return count + 1;
    }

    // Compare timestamps
    const hasNew = new Date(conv.last_message_at).getTime() > new Date(lastRead).getTime();
    return hasNew ? count + 1 : count;
  }, 0);

  const hasUnreadMessages = unreadCount > 0;

  return (
    <ChatContext.Provider
      value={{
        conversations,
        loadingConvs,
        error,
        unreadCount,
        hasUnreadMessages,
        refreshConversations: fetchConversations,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
