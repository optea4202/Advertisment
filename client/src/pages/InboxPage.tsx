import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { useAuth } from '../context/AuthContext.js';
import { useConversations, useMessages } from '../hooks/useChats.js';
import type { Conversation } from '../types/Chat.js';

export const InboxPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialChatId = searchParams.get('chatId');

  const { conversations, loading: loadingConvs } = useConversations();
  const [activeConvId, setActiveConvId] = useState<number | null>(
    initialChatId ? parseInt(initialChatId) : null
  );
  const [showMobileList, setShowMobileList] = useState(!initialChatId);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, loading: loadingMsgs, sending, send } = useMessages(activeConvId);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync URL param when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      setSearchParams({ chatId: String(activeConvId) }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [activeConvId, setSearchParams]);

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setShowMobileList(false);
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const text = inputText;
    setInputText('');
    await send(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId) ?? null;

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-0 md:px-md lg:px-xl py-0 md:py-xl flex flex-col">
        {/* Page header — desktop only */}
        <div className="hidden md:flex items-center gap-sm mb-lg px-0">
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Inbox</h1>
        </div>

        {/* Main Panel */}
        <div className="flex flex-grow bg-surface-container-lowest md:rounded-2xl md:border md:border-outline-variant/20 md:shadow-1 overflow-hidden h-[calc(100dvh-56px)] min-h-[calc(100dvh-56px)] max-h-[calc(100dvh-56px)] md:h-[calc(100vh-200px)] md:min-h-[calc(100vh-200px)] md:max-h-[calc(100vh-200px)]">

          {/* ─── Left Panel: Conversation List ─── */}
          <div className={`
            flex flex-col border-r border-outline-variant/20
            ${showMobileList ? 'flex' : 'hidden'} md:flex
            w-full md:w-[320px] lg:w-[360px] flex-shrink-0
            bg-surface-container-low
          `}>
            {/* Mobile header */}
            <div className="flex items-center gap-sm px-lg py-md border-b border-outline-variant/20 md:border-b md:border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
              <span className="font-headline-md text-[18px] font-bold text-on-surface">Messages</span>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto">
              {loadingConvs && (
                <div className="flex items-center justify-center py-xxl gap-md">
                  <div className="w-6 h-6 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {!loadingConvs && conversations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-xxl gap-md px-xl text-center">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">chat_bubble</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">No conversations yet. Start a chat from an ad page!</p>
                </div>
              )}

              {conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    id={`conv-${conv.id}`}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full flex items-start gap-md px-lg py-md border-b border-outline-variant/10 text-left transition-all hover:bg-surface-container ${isActive ? 'bg-primary-fixed/60' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden flex-shrink-0 mt-[2px]">
                      {conv.other_user_photo ? (
                        <img src={conv.other_user_photo} alt={conv.other_user_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase text-label-sm">
                          {conv.other_user_name?.substring(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-xs">
                        <span className={`font-label-md text-label-md font-semibold truncate ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                          {conv.other_user_name}
                        </span>
                        {conv.last_message_at && (
                          <span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0 text-[11px]">
                            {formatTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      {conv.ad_title && (
                        <span className="font-label-sm text-label-sm text-primary/70 truncate mt-[1px]">
                          Re: {conv.ad_title}
                        </span>
                      )}
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate mt-[2px]">
                        {conv.last_message ?? 'Start the conversation…'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Right Panel: Active Chat ─── */}
          <div className={`flex flex-col flex-grow ${!showMobileList ? 'flex' : 'hidden'} md:flex`}>

            {/* Chat Header */}
            {activeConversation ? (
              <div className="flex items-center gap-md px-lg py-md border-b border-outline-variant/20 bg-surface-container-lowest flex-shrink-0">
                {/* Mobile back button */}
                <button
                  className="md:hidden text-secondary hover:text-primary transition-colors"
                  onClick={() => setShowMobileList(true)}
                  title="Back to conversations"
                >
                  <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>

                <Link
                  to={`/profile/${activeConversation.other_user_id}`}
                  className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/30 transition-all"
                >
                  {activeConversation.other_user_photo ? (
                    <img src={activeConversation.other_user_photo} alt={activeConversation.other_user_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase">
                      {activeConversation.other_user_name?.substring(0, 2)}
                    </div>
                  )}
                </Link>

                <div className="flex flex-col flex-grow min-w-0">
                  <Link to={`/profile/${activeConversation.other_user_id}`} className="font-label-md text-label-md font-semibold text-on-surface hover:text-primary transition-colors truncate">
                    {activeConversation.other_user_name}
                  </Link>
                  {activeConversation.ad_title && (
                    <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                      Re: {activeConversation.ad_title}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-md px-lg py-md border-b border-outline-variant/20 bg-surface-container-lowest flex-shrink-0">
                {/* Mobile back button when no conversation selected */}
                <button
                  className="md:hidden text-secondary hover:text-primary transition-colors"
                  onClick={() => setShowMobileList(true)}
                  title="Back to conversations"
                >
                  <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto px-lg py-md flex flex-col gap-sm">
              {!activeConvId && (
                <div className="flex flex-col items-center justify-center h-full gap-md text-center px-xl">
                  <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[36px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">Select a conversation to start messaging</p>
                </div>
              )}

              {activeConvId && loadingMsgs && messages.length === 0 && (
                <div className="flex items-center justify-center py-xl gap-sm">
                  <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Loading messages…</span>
                </div>
              )}

              {activeConvId && !loadingMsgs && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-sm text-center">
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40">forum</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">No messages yet. Say hello!</p>
                </div>
              )}

              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex items-end gap-sm ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {msg.sender_photo ? (
                          <img src={msg.sender_photo} alt={msg.sender_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase text-[11px]">
                            {msg.sender_name?.substring(0, 2)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`flex flex-col gap-[2px] max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-md py-sm rounded-2xl font-body-sm text-body-sm leading-relaxed ${
                        isMe
                          ? 'bg-primary text-on-primary rounded-br-sm'
                          : 'bg-surface-container text-on-surface rounded-bl-sm'
                      }`}>
                        {msg.message_text}
                      </div>
                      <span className="font-label-sm text-[11px] text-on-surface-variant px-xs">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {activeConvId && (
              <div className="flex items-end gap-sm px-lg py-md border-t border-outline-variant/20 bg-surface-container-lowest flex-shrink-0">
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  className="flex-grow resize-none bg-surface-container border border-outline-variant rounded-xl px-md py-sm font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  style={{ maxHeight: '120px', overflowY: 'auto' }}
                />
                <button
                  id="chat-send-btn"
                  onClick={handleSend}
                  disabled={!inputText.trim() || sending}
                  className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center flex-shrink-0 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Send message"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
