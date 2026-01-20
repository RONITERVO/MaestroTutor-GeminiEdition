// Copyright 2025 Roni Tervo
// SPDX-License-Identifier: Apache-2.0
/**
 * Speech Slice - manages TTS and STT state
 * 
 * Responsibilities:
 * - STT state (isListening, transcript, errors)
 * - TTS state (isSpeaking, speakingUtteranceText)
 * - Speech capability detection
 * - Recorded utterance handling
 * 
 * Note: Actual TTS/STT engine operations remain in useBrowserSpeech hook.
 * This slice manages the state that needs to be shared across components.
 */

import type { StateCreator } from 'zustand';
import type { RecordedUtterance } from '../../core/types';
import type { MaestroStore } from '../maestroStore';

export interface SpeechSlice {
  // STT State
  isListening: boolean;
  transcript: string;
  sttError: string | null;
  isSpeechRecognitionSupported: boolean;
  recordedUtterancePending: RecordedUtterance | null;
  pendingRecordedAudioMessageId: string | null;
  sttInterruptedBySend: boolean;
  
  // TTS State  
  isSpeaking: boolean;
  speakingUtteranceText: string | null;
  isSpeechSynthesisSupported: boolean;
  
  // Actions
  setIsListening: (value: boolean) => void;
  setTranscript: (transcript: string) => void;
  clearTranscript: () => void;
  setSttError: (error: string | null) => void;
  setIsSpeechRecognitionSupported: (value: boolean) => void;
  setRecordedUtterancePending: (utterance: RecordedUtterance | null) => void;
  setPendingRecordedAudioMessageId: (messageId: string | null) => void;
  setSttInterruptedBySend: (value: boolean) => void;
  
  setIsSpeaking: (value: boolean) => void;
  setSpeakingUtteranceText: (text: string | null) => void;
  setIsSpeechSynthesisSupported: (value: boolean) => void;
  
  // Utility
  claimRecordedUtterance: () => RecordedUtterance | null;
}

export const createSpeechSlice: StateCreator<
  MaestroStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  SpeechSlice
> = (set, get) => ({
  // Initial STT State
  isListening: false,
  transcript: '',
  sttError: null,
  isSpeechRecognitionSupported: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  recordedUtterancePending: null,
  pendingRecordedAudioMessageId: null,
  sttInterruptedBySend: false,
  
  // Initial TTS State
  isSpeaking: false,
  speakingUtteranceText: null,
  isSpeechSynthesisSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  
  // STT Actions
  setIsListening: (value: boolean) => {
    set({ isListening: value });
  },
  
  setTranscript: (transcript: string) => {
    set({ transcript });
  },
  
  clearTranscript: () => {
    set({ transcript: '' });
  },
  
  setSttError: (error: string | null) => {
    set({ sttError: error });
  },
  
  setIsSpeechRecognitionSupported: (value: boolean) => {
    set({ isSpeechRecognitionSupported: value });
  },
  
  setRecordedUtterancePending: (utterance: RecordedUtterance | null) => {
    set({ recordedUtterancePending: utterance });
  },
  
  setPendingRecordedAudioMessageId: (messageId: string | null) => {
    set({ pendingRecordedAudioMessageId: messageId });
  },
  
  setSttInterruptedBySend: (value: boolean) => {
    set({ sttInterruptedBySend: value });
  },
  
  // TTS Actions
  setIsSpeaking: (value: boolean) => {
    set({ isSpeaking: value });
  },
  
  setSpeakingUtteranceText: (text: string | null) => {
    set({ speakingUtteranceText: text });
  },
  
  setIsSpeechSynthesisSupported: (value: boolean) => {
    set({ isSpeechSynthesisSupported: value });
  },
  
  // Utility - claim and clear pending recorded utterance
  claimRecordedUtterance: (): RecordedUtterance | null => {
    const pending = get().recordedUtterancePending;
    if (pending) {
      set({ recordedUtterancePending: null });
    }
    return pending;
  },
});
