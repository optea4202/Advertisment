import { useState, useEffect, useCallback, useRef } from 'react';
import { getConversations, getMessages, sendMessage as sendMessageApi } from '../api/chats.js';
import type { Conversation, Message } from '../types/Chat.js';

const POLL_INTERVAL_MS = 3500;

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const intervalId = setInterval(fetchConversations, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  return { conversations, loading, error, refresh: fetchConversations };
};

export const useMessages = (conversationId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sending, setSending] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    fetchMessages();

    intervalRef.current = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [conversationId, fetchMessages]);

  const send = async (text: string) => {
    if (!conversationId || !text.trim()) return;
    setSending(true);
    try {
      const newMsg = await sendMessageApi(conversationId, text.trim());
      setMessages((prev) => [...prev, newMsg]);
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, error, sending, send, refresh: fetchMessages };
};
