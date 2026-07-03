import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { useAuth } from '../context/AuthContext.js';
import { useMessages } from '../hooks/useChats.js';
import { useChat } from '../context/ChatContext.js';
import { deleteConversation as deleteConversationApi } from '../api/chats.js';
import { startConversation } from '../api/chats.js';
import { searchUsers, type PublicUserProfile } from '../api/users.js';
import { algoliasearch } from 'algoliasearch';

interface AlgoliaUserHit {
  id: number;
  username: string;
  photo_url?: string | null;
  bio?: string | null;
}

// Initialize the Algolia client using Search-Only key (v5 client) safely
let searchClient: ReturnType<typeof algoliasearch> | null = null;
const usersIndexName = import.meta.env.VITE_ALGOLIA_USERS_INDEX_NAME || 'zobazar_users';

try {
  const appId = import.meta.env.VITE_ALGOLIA_APP_ID || '';
  const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_ONLY_API_KEY || '';
  if (appId && searchKey && !appId.includes('placeholder') && !searchKey.includes('placeholder')) {
    searchClient = algoliasearch(appId, searchKey);
  }
} catch (err) {
  console.warn('Algolia user search client initialization skipped or failed:', err);
}

import type { Conversation } from '../types/Chat.js';

export const InboxPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialChatId = searchParams.get('chatId');
  const location = useLocation();

  // Route state details passed from AdDetailPage
  const routeState = location.state as {
    other_user_id: number;
    other_user_name: string;
    other_user_photo: string | null;
    ad_title: string;
  } | null;

  const { conversations, loadingConvs, markAsRead, refreshConversations } = useChat();
  const [activeConvId, setActiveConvId] = useState<number | null>(
    initialChatId ? parseInt(initialChatId) : null
  );
  const [showMobileList, setShowMobileList] = useState(!initialChatId);
  const [inputText, setInputText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Store the last known details of the active conversation to prevent auto-hiding during reload/polling
  const [lastActiveConversation, setLastActiveConversation] = useState<Conversation | null>(
    initialChatId && routeState ? {
      id: parseInt(initialChatId),
      other_user_id: routeState.other_user_id,
      other_user_name: routeState.other_user_name,
      other_user_photo: routeState.other_user_photo,
      ad_title: routeState.ad_title,
      last_message: null,
      last_message_at: null,
    } as any as Conversation : null
  );

  // Inline message edit state
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Per-message delete confirmation
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);

  // Delete conversation confirmation modal
  const [showDeleteConvModal, setShowDeleteConvModal] = useState(false);
  const [deletingConv, setDeletingConv] = useState(false);

  // -- User search state --------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublicUserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [startingChatFor, setStartingChatFor] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Photo attachment error state
  const [imageError, setImageError] = useState<string | null>(null);

  const { messages, loading: loadingMsgs, sending, send, editMsg, deleteMsg } = useMessages(activeConvId);

  // Monitor visual viewport to handle mobile keyboards without shifting page or scroll issues
  const [viewportHeight, setViewportHeight] = useState<number>(window.innerHeight);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      setViewportHeight(window.visualViewport!.height);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  // Prevent window scroll adjustments when keyboard is active
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY !== 0 && window.innerWidth < 768) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // -- Debounced user search ----------------------------------------
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        if (searchClient) {
          const results = await searchClient.searchSingleIndex({
            indexName: usersIndexName,
            searchParams: {
              query: searchQuery.trim(),
              hitsPerPage: 10
            }
          });

          // Assert results.hits as unknown then as AlgoliaUserHit[] to safely type the external SDK result without using any
          const mappedUsers: PublicUserProfile[] = (results.hits as unknown as AlgoliaUserHit[])
            .map((hit): PublicUserProfile => ({
              id: hit.id,
              username: hit.username,
              photo_url: hit.photo_url || null,
              bio: hit.bio || null,
              created_at: new Date().toISOString(),
              is_banned: false
            }))
            .filter((u: PublicUserProfile) => u.id !== user?.id);

          setSearchResults(mappedUsers);
        } else {
          // Fall back to database query search
          const results = await searchUsers(searchQuery.trim());
          const mappedUsers: PublicUserProfile[] = results
            .map((u: PublicUserProfile): PublicUserProfile => ({
              id: u.id,
              username: u.username,
              photo_url: u.photo_url || null,
              bio: u.bio || null,
              created_at: u.created_at,
              is_banned: u.is_banned
            }))
            .filter((u: PublicUserProfile) => u.id !== user?.id);

          setSearchResults(mappedUsers);
        }
      } catch (err) {
        console.error('User search failed:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // -- Start chat from search result --------------------------------
  const handleSearchResultClick = useCallback(async (user: PublicUserProfile) => {
    if (startingChatFor === user.id) return;
    setStartingChatFor(user.id);
    try {
      const conv = await startConversation(user.id, null);
      await refreshConversations();
      setActiveConvId(conv.id);
      setShowMobileList(false);
      setSearchQuery('');
      setSearchResults([]);
      setSearchFocused(false);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setStartingChatFor(null);
    }
  }, [startingChatFor, refreshConversations]);

  // Sync last active conversation when activeConvId or conversations list changes
  useEffect(() => {
    if (activeConvId) {
      const active = conversations.find((c) => c.id === activeConvId);
      if (active) {
        setLastActiveConversation(active);
      }
    }
  }, [conversations, activeConvId]);

  // Mark active conversation as read when activeConvId, conversations list, or messages update
  useEffect(() => {
    if (activeConvId) {
      markAsRead(activeConvId);
    }
  }, [activeConvId, conversations, messages, markAsRead]);

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

  // Clear edit/delete state when switching conversations
  useEffect(() => {
    setEditingMessageId(null);
    setEditingText('');
    setDeletingMessageId(null);
  }, [activeConvId]);

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setShowMobileList(false);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);
    if (file) {
      if (file.size > 500 * 1024) {
        setImageError('Image size exceeds the 500KB limit.');
        e.target.value = '';
        return;
      }
      setSelectedPhoto(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoPreviewUrl(null);
    setImageError(null);
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedPhoto) || sending) return;
    const text = inputText;
    const photo = selectedPhoto;
    setInputText('');
    handleRemovePhoto();
    await send(text, photo);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // -- Edit handlers ----------------------------------------------
  const startEditing = (messageId: number, currentText: string) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
    setDeletingMessageId(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingText.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      await editMsg(editingMessageId, editingText.trim());
      setEditingMessageId(null);
      setEditingText('');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // -- Delete message handlers ------------------------------------
  const handleConfirmDeleteMessage = async (messageId: number) => {
    await deleteMsg(messageId);
    setDeletingMessageId(null);
  };

  // -- Delete conversation handlers -------------------------------
  const handleDeleteConversation = async () => {
    if (!activeConvId || deletingConv) return;
    setDeletingConv(true);
    try {
      await deleteConversationApi(activeConvId);
      await refreshConversations();
      setActiveConvId(null);
      setLastActiveConversation(null);
      setShowMobileList(true);
      setShowDeleteConvModal(false);
    } finally {
      setDeletingConv(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId) ?? lastActiveConversation;

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="bg-surface text-on-surface flex flex-col overflow-hidden md:min-h-screen md:h-auto md:overflow-visible"
      style={{
        height: window.innerWidth < 768 ? `${viewportHeight}px` : 'auto'
      }}
    >
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-0 md:px-md lg:px-xl py-0 md:py-xl flex flex-col overflow-hidden md:overflow-visible">
        {/* Page header � desktop only */}
        <div className="hidden md:flex items-center gap-sm mb-lg px-0">
          <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Inbox</h1>
        </div>

        {/* Main Panel */}
        <div className="flex flex-1 overflow-hidden bg-surface-container-lowest md:rounded-2xl md:border md:border-outline-variant/20 md:shadow-1 md:h-[calc(100vh-200px)] md:min-h-[calc(100vh-200px)] md:max-h-[calc(100vh-200px)]">

          {/* --- Left Panel: Conversation List --- */}
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

            {/* -- Search Users Bar -- */}
            <div className="relative px-md pt-md pb-sm">
              <div className={`flex items-center gap-xs bg-surface-container border rounded-xl px-md py-sm transition-all ${
                searchFocused ? 'border-primary ring-1 ring-primary/20 bg-surface-container-lowest' : 'border-outline-variant/50'
              }`}>
                {searchLoading ? (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant flex-shrink-0">search</span>
                )}
                <input
                  ref={searchInputRef}
                  id="inbox-user-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchFocused(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }
                  }}
                  placeholder="Search people to message�"
                  autoComplete="off"
                  className="flex-grow bg-transparent text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none min-w-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchFocused(false); }}
                    className="text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0"
                    title="Clear search"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Search Dropdown */}
              {searchFocused && searchQuery.trim() && (
                <div
                  ref={searchDropdownRef}
                  className="absolute left-md right-md top-full mt-xs z-30 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-2 overflow-hidden"
                >
                  {searchLoading && searchResults.length === 0 && (
                    <div className="flex items-center gap-sm px-md py-sm">
                      <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Searching�</span>
                    </div>
                  )}

                  {!searchLoading && searchResults.length === 0 && (
                    <div className="flex items-center gap-sm px-md py-md">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50">person_off</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">No users found</span>
                    </div>
                  )}

                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      id={`search-user-${u.id}`}
                      onClick={() => handleSearchResultClick(u)}
                      disabled={startingChatFor === u.id}
                      className="w-full flex items-center gap-sm px-md py-sm hover:bg-surface-container-low transition-colors text-left border-b border-outline-variant/10 last:border-b-0 disabled:opacity-50"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {u.photo_url ? (
                          <img src={u.photo_url} alt={u.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase text-[11px]">
                            {u.username?.substring(0, 2)}
                          </div>
                        )}
                      </div>
                      {/* Name + bio */}
                      <div className="flex flex-col min-w-0 flex-grow">
                        <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{u.username}</span>
                        {u.bio && (
                          <span className="font-label-sm text-[11px] text-on-surface-variant truncate">{u.bio}</span>
                        )}
                      </div>
                      {/* CTA */}
                      {startingChatFor === u.id ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
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
                        {conv.last_message ? (
                          conv.last_message.startsWith('__AD_INQUIRY__:') ? (
                            `Inquiry about: ${conv.last_message.split(':').slice(2).join(':')}`
                          ) : (
                            conv.last_message
                          )
                        ) : (
                          'Start the conversation�'
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* --- Right Panel: Active Chat --- */}
          <div className={`flex flex-col flex-grow overflow-hidden ${!showMobileList ? 'flex' : 'hidden'} md:flex`}>

            {/* Chat Header � sticky, never scrolls */}
            {activeConversation ? (
              <div className="flex items-center gap-md px-lg py-md border-b border-outline-variant/20 bg-surface-container-lowest flex-shrink-0 z-10">
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
                  className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/30 transition-all flex-shrink-0"
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

                {/* Delete conversation button */}
                <button
                  id="delete-conv-btn"
                  onClick={() => setShowDeleteConvModal(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-error hover:bg-error-container transition-all flex-shrink-0"
                  title="Delete conversation"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ) : activeConvId ? (
              <div className="flex items-center gap-md px-lg py-md border-b border-outline-variant/20 bg-surface-container-lowest flex-shrink-0 z-10">
                <button
                  className="md:hidden text-secondary hover:text-primary transition-colors"
                  onClick={() => setShowMobileList(true)}
                  title="Back to conversations"
                >
                  <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <div className="w-10 h-10 rounded-full bg-surface-container-highest animate-pulse flex-shrink-0" />
                <div className="flex flex-col gap-xs flex-grow">
                  <div className="h-4 w-24 bg-surface-container-highest rounded animate-pulse" />
                  <div className="h-3 w-32 bg-surface-container-highest rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-md px-lg py-md border-b border-outline-variant/20 bg-surface-container-lowest flex-shrink-0 z-10">
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
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Loading messages�</span>
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
                const isEditing = editingMessageId === msg.id;
                const isConfirmingDelete = deletingMessageId === msg.id;
                const canEdit = isMe && !!msg.message_text;

                const isAdInquiry = msg.message_text?.startsWith('__AD_INQUIRY__:');
                if (isAdInquiry) {
                  const parts = msg.message_text.split(':');
                  const adId = parts[1];
                  const adTitle = parts.slice(2).join(':');
                  return (
                    <div key={msg.id} className="w-full flex justify-center my-sm md:my-md animate-fade-in-up-sheet">
                      <Link
                        to={`/ads/${adId}`}
                        className="inline-flex items-center gap-xs bg-primary-fixed/30 hover:bg-primary-fixed/50 text-on-primary-fixed text-label-sm font-semibold px-md py-[6px] rounded-full border border-primary/15 shadow-sm transition-all hover:scale-[1.01] no-underline"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                        <span>Interested in ad: <span className="underline">{adTitle}</span></span>
                      </Link>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`group flex items-end gap-sm ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar � other user only */}
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

                    {/* Bubble column */}
                    <div className={`flex flex-col gap-[2px] max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>

                      {/* Inline edit mode */}
                      {isEditing ? (
                        <div className="flex flex-col gap-xs w-full min-w-[200px] max-w-[340px]">
                          <textarea
                            id={`edit-input-${msg.id}`}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            rows={2}
                            autoFocus
                            className="w-full resize-none bg-surface-container border border-primary rounded-xl px-md py-sm font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            style={{ maxHeight: '120px', overflowY: 'auto' }}
                          />
                          <div className="flex items-center gap-xs justify-end">
                            <button
                              onClick={cancelEditing}
                              className="px-sm py-xs rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              id={`save-edit-${msg.id}`}
                              onClick={handleSaveEdit}
                              disabled={!editingText.trim() || savingEdit}
                              className="px-sm py-xs rounded-lg font-label-sm text-label-sm bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
                            >
                              {savingEdit ? 'Saving�' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Image attachment */}
                          {msg.image_url && (
                            <a href={msg.image_url} target="_blank" rel="noopener noreferrer" className="block">
                              <img
                                src={msg.image_url}
                                alt="Chat image"
                                className={`max-w-[220px] max-h-[220px] w-auto h-auto rounded-2xl object-cover border border-outline-variant/20 cursor-zoom-in hover:opacity-90 transition-opacity ${
                                  isMe ? 'rounded-br-sm' : 'rounded-bl-sm'
                                }`}
                              />
                            </a>
                          )}
                          {/* Text bubble (only if there is text) */}
                          {msg.message_text && (
                            <div className={`px-md py-sm rounded-2xl font-body-sm text-body-sm leading-relaxed ${
                              isMe
                                ? 'bg-primary text-on-primary rounded-br-sm'
                                : 'bg-surface-container text-on-surface rounded-bl-sm'
                            }`}>
                              {msg.message_text}
                            </div>
                          )}
                        </>
                      )}

                      {/* Timestamp row + edited label */}
                      {!isEditing && (
                        <div className={`flex items-center gap-xs ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="font-label-sm text-[11px] text-on-surface-variant px-xs">
                            {formatTime(msg.created_at)}
                          </span>
                          {msg.is_edited && (
                            <span className="font-label-sm text-[10px] text-on-surface-variant/60 italic">
                              (edited)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action buttons � own messages only, shown on hover (desktop) or always (mobile) */}
                      {isMe && !isEditing && (
                        <div className={`flex items-center gap-[2px] opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                          style={{ opacity: isConfirmingDelete ? 1 : undefined }}>
                          {/* Edit button � only if message has text */}
                          {canEdit && (
                            <button
                              id={`edit-msg-${msg.id}`}
                              onClick={() => startEditing(msg.id, msg.message_text)}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
                              title="Edit message"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                          )}
                          {/* Delete button */}
                          {!isConfirmingDelete ? (
                            <button
                              id={`delete-msg-${msg.id}`}
                              onClick={() => { setDeletingMessageId(msg.id); setEditingMessageId(null); }}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-error hover:bg-error-container transition-all"
                              title="Delete message"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-xs bg-error-container rounded-xl px-sm py-xs">
                              <span className="font-label-sm text-[11px] text-on-error-container">Delete?</span>
                              <button
                                id={`confirm-delete-msg-${msg.id}`}
                                onClick={() => handleConfirmDeleteMessage(msg.id)}
                                className="font-label-sm text-[11px] text-error font-semibold hover:underline"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeletingMessageId(null)}
                                className="font-label-sm text-[11px] text-on-surface-variant hover:underline"
                              >
                                No
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area � locked to bottom, never scrolls */}
            {activeConvId && (
              <div className="flex flex-col border-t border-outline-variant/20 bg-surface-container-lowest flex-shrink-0 z-10">
                {/* Photo preview strip */}
                {(photoPreviewUrl || imageError) && (
                  <div className="flex items-center gap-sm px-lg pt-sm pb-xs">
                    {photoPreviewUrl ? (
                      <>
                        <div className="relative inline-block">
                          <img
                            src={photoPreviewUrl}
                            alt="Photo preview"
                            className="h-16 w-16 object-cover rounded-xl border border-outline-variant/30"
                          />
                          <button
                            onClick={handleRemovePhoto}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-on-error rounded-full flex items-center justify-center hover:brightness-110 transition-all"
                            title="Remove photo"
                          >
                            <span className="material-symbols-outlined text-[13px]">close</span>
                          </button>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{selectedPhoto?.name}</span>
                      </>
                    ) : null}
                    {imageError && (
                      <div className="flex items-center gap-xs text-error font-body-sm text-body-sm bg-error-container/50 px-md py-xs rounded-xl border border-error/10">
                        <span className="material-symbols-outlined text-[16px] text-error">warning</span>
                        <span>{imageError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Input row */}
                <div className="flex items-end gap-sm px-lg py-md">
                  {/* Hidden file input */}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                  {/* Photo attach button */}
                  <button
                    id="chat-photo-btn"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:text-primary hover:bg-surface-container transition-all flex-shrink-0"
                    title="Attach photo"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
                  </button>

                  <textarea
                    ref={inputRef}
                    id="chat-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message� (Enter to send)"
                    rows={1}
                    className="flex-grow resize-none bg-surface-container border border-outline-variant rounded-xl px-md py-sm font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    style={{ maxHeight: '120px', overflowY: 'auto' }}
                  />
                  <button
                    id="chat-send-btn"
                    onClick={handleSend}
                    disabled={(!inputText.trim() && !selectedPhoto) || sending}
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
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- Delete Conversation Confirmation Modal --- */}
      {showDeleteConvModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm px-md"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConvModal(false); }}
        >
          <div className="bg-surface-container-lowest rounded-2xl shadow-2 p-lg w-full max-w-sm flex flex-col gap-md animate-fade-in">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-error text-[20px]">delete_forever</span>
              </div>
              <div>
                <h2 className="font-headline-md text-[18px] font-semibold text-on-surface">Delete conversation?</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-[2px]">
                  This will permanently delete all messages. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-sm justify-end mt-xs">
              <button
                onClick={() => setShowDeleteConvModal(false)}
                disabled={deletingConv}
                className="px-md py-sm rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-conv-btn"
                onClick={handleDeleteConversation}
                disabled={deletingConv}
                className="px-md py-sm rounded-xl font-label-md text-label-md bg-error text-on-error hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-xs"
              >
                {deletingConv ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-error/30 border-t-on-error rounded-full animate-spin" />
                    Deleting�
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
