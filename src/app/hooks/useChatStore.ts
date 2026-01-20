// Copyright 2025 Roni Tervo
//
// SPDX-License-Identifier: Apache-2.0
/**
 * useChatStore - Hook bridge to Zustand store for chat state
 * 
 * This hook provides backward-compatible access to chat state.
 * All state is now managed by the chatSlice in the Zustand store.
 */

import { useCallback, useRef, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { useMaestroStore } from '../../store';
import { ChatMessage, TtsAudioCacheEntry, ReplySuggestion } from '../../core/types';
import type { TranslationFunction } from './useTranslations';

export interface UseChatStoreConfig {
  t: TranslationFunction;
  /** Current language pair ID - used as prop for proper React deps tracking */
  selectedLanguagePairId: string | null;
  /** settingsRef is now optional - we read from store */
  settingsRef?: React.MutableRefObject<{
    selectedLanguagePairId: string | null;
    historyBookmarkMessageId?: string | null;
    maxVisibleMessages?: number;
  }>;
  /** setSettings is now optional - we use store actions */
  setSettings?: React.Dispatch<React.SetStateAction<any>>;
}

export interface UseChatStoreReturn {
  messages: ChatMessage[];
  messagesRef: React.MutableRefObject<ChatMessage[]>;
  isLoadingHistory: boolean;
  isLoadingHistoryRef: React.MutableRefObject<boolean>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  /** Trim history based on bookmark */
  trimHistoryByBookmark: (arr: ChatMessage[]) => ChatMessage[];
  /** Get history respecting bookmark settings */
  getHistoryRespectingBookmark: (arr: ChatMessage[]) => ChatMessage[];
  /** Upsert TTS cache entry for a message */
  upsertMessageTtsCache: (messageId: string, entry: TtsAudioCacheEntry) => void;
  /** Upsert TTS cache for a suggestion on a message */
  upsertSuggestionTtsCache: (messageId: string, suggestionIndex: number, entry: TtsAudioCacheEntry) => void;
  /** Compute max messages for API calls */
  computeMaxMessagesForArray: (arr: ChatMessage[]) => number | undefined;
  /** Get ref for checking last fetched suggestions */
  lastFetchedSuggestionsForRef: React.MutableRefObject<string | null>;
  /** Reply suggestions for the current assistant message */
  replySuggestions: ReplySuggestion[];
  setReplySuggestions: (suggestions: ReplySuggestion[] | ((prev: ReplySuggestion[]) => ReplySuggestion[])) => void;
  replySuggestionsRef: React.MutableRefObject<ReplySuggestion[]>;
  isLoadingSuggestions: boolean;
  setIsLoadingSuggestions: (value: boolean | ((prev: boolean) => boolean)) => void;
  isLoadingSuggestionsRef: React.MutableRefObject<boolean>;
}

/**
 * Hook for managing chat message state with persistence to IndexedDB.
 * Now backed by Zustand store - this is a thin wrapper for backward compatibility.
 */
export const useChatStore = (config: UseChatStoreConfig): UseChatStoreReturn => {
  const { t, selectedLanguagePairId } = config;

  // Select state from store
  const {
    messages,
    isLoadingHistory,
    replySuggestions,
    isLoadingSuggestions,
    lastFetchedSuggestionsFor,
  } = useMaestroStore(useShallow(state => ({
    messages: state.messages,
    isLoadingHistory: state.isLoadingHistory,
    replySuggestions: state.replySuggestions,
    isLoadingSuggestions: state.isLoadingSuggestions,
    lastFetchedSuggestionsFor: state.lastFetchedSuggestionsFor,
  })));

  // Get actions from store (stable references)
  const loadHistoryForPair = useMaestroStore(state => state.loadHistoryForPair);
  const addMessage = useMaestroStore(state => state.addMessage);
  const updateMessage = useMaestroStore(state => state.updateMessage);
  const deleteMessage = useMaestroStore(state => state.deleteMessage);
  const setMessages = useMaestroStore(state => state.setMessages);
  const setReplySuggestions = useMaestroStore(state => state.setReplySuggestions);
  const setIsLoadingSuggestions = useMaestroStore(state => state.setIsLoadingSuggestions);
  const upsertMessageTtsCache = useMaestroStore(state => state.upsertMessageTtsCache);
  const upsertSuggestionTtsCache = useMaestroStore(state => state.upsertSuggestionTtsCache);
  const trimHistoryByBookmark = useMaestroStore(state => state.trimHistoryByBookmark);
  const getHistoryRespectingBookmark = useMaestroStore(state => state.getHistoryRespectingBookmark);
  const computeMaxMessagesForArray = useMaestroStore(state => state.computeMaxMessagesForArray);

  // Refs for imperative access (synced with store state)
  const messagesRef = useRef<ChatMessage[]>(messages);
  const isLoadingHistoryRef = useRef<boolean>(isLoadingHistory);
  const replySuggestionsRef = useRef<ReplySuggestion[]>(replySuggestions);
  const isLoadingSuggestionsRef = useRef<boolean>(isLoadingSuggestions);
  const lastFetchedSuggestionsForRef = useRef<string | null>(lastFetchedSuggestionsFor);

  // Keep refs in sync with store state
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { isLoadingHistoryRef.current = isLoadingHistory; }, [isLoadingHistory]);
  useEffect(() => { replySuggestionsRef.current = replySuggestions; }, [replySuggestions]);
  useEffect(() => { isLoadingSuggestionsRef.current = isLoadingSuggestions; }, [isLoadingSuggestions]);
  useEffect(() => { lastFetchedSuggestionsForRef.current = lastFetchedSuggestionsFor; }, [lastFetchedSuggestionsFor]);

  // Track previous language pair to detect changes
  const prevPairIdRef = useRef<string | null>(null);

  // Load history when language pair changes
  useEffect(() => {
    if (selectedLanguagePairId && selectedLanguagePairId !== prevPairIdRef.current) {
      prevPairIdRef.current = selectedLanguagePairId;
      loadHistoryForPair(selectedLanguagePairId, t);
    }
  }, [selectedLanguagePairId, t, loadHistoryForPair]);

  // Wrapped addMessage to maintain interface compatibility
  const addMessageWrapper = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>): string => {
    return addMessage(message);
  }, [addMessage]);

  return {
    messages,
    messagesRef,
    isLoadingHistory,
    isLoadingHistoryRef,
    addMessage: addMessageWrapper,
    updateMessage,
    deleteMessage,
    setMessages,
    trimHistoryByBookmark,
    getHistoryRespectingBookmark,
    upsertMessageTtsCache,
    upsertSuggestionTtsCache,
    computeMaxMessagesForArray,
    lastFetchedSuggestionsForRef,
    replySuggestions,
    setReplySuggestions,
    replySuggestionsRef,
    isLoadingSuggestions,
    setIsLoadingSuggestions,
    isLoadingSuggestionsRef,
  };
};

export default useChatStore;
