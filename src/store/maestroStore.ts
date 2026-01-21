// Copyright 2025 Roni Tervo
// SPDX-License-Identifier: Apache-2.0
/**
 * Maestro Store - Root Zustand store combining all slices
 * 
 * This is the single source of truth for all shared application state.
 * Each feature owns a slice that exposes its state and actions.
 * 
 * Middleware:
 * - subscribeWithSelector: enables fine-grained subscriptions
 * - devtools: enables Redux DevTools in development
 * 
 * Non-serializable state:
 * - MediaStream objects (liveVideoStream, visualContextStream) should never be persisted
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

import { createSettingsSlice, type SettingsSlice } from './slices/settingsSlice';
import { createChatSlice, type ChatSlice } from './slices/chatSlice';
import { createSpeechSlice, type SpeechSlice } from './slices/speechSlice';
import { createHardwareSlice, type HardwareSlice } from './slices/hardwareSlice';
import { createReengagementSlice, type ReengagementSlice } from './slices/reengagementSlice';
import { createLiveSessionSlice, type LiveSessionSlice } from './slices/liveSessionSlice';
import { createUiSlice, type UiSlice } from './slices/uiSlice';
import { createDiagnosticsSlice, type DiagnosticsSlice } from './slices/diagnosticsSlice';

/**
 * Combined store type - intersection of all slices
 */
export type MaestroStore = 
  SettingsSlice & 
  ChatSlice & 
  SpeechSlice & 
  HardwareSlice & 
  ReengagementSlice & 
  LiveSessionSlice & 
  UiSlice & 
  DiagnosticsSlice;

/**
 * Create the Zustand store with all slices combined
 */
const isDev = typeof import.meta !== 'undefined' && !!(import.meta as any).env?.DEV;

export const useMaestroStore = create<MaestroStore>()(
  subscribeWithSelector(
    devtools(
      (...a) => ({
        ...createSettingsSlice(...a),
        ...createChatSlice(...a),
        ...createSpeechSlice(...a),
        ...createHardwareSlice(...a),
        ...createReengagementSlice(...a),
        ...createLiveSessionSlice(...a),
        ...createUiSlice(...a),
        ...createDiagnosticsSlice(...a),
      }),
      {
        name: 'MaestroStore',
        // DevTools enabled in non-production builds
        enabled: isDev,
      }
    )
  )
);

/**
 * Get the current store state (for use outside React components)
 */
export const getStoreState = () => useMaestroStore.getState();

/**
 * Subscribe to store changes with a selector (for use outside React components)
 */
export const subscribeToStore = useMaestroStore.subscribe;

// Re-export slice types for convenience
export type { SettingsSlice } from './slices/settingsSlice';
export type { ChatSlice } from './slices/chatSlice';
export type { SpeechSlice } from './slices/speechSlice';
export type { HardwareSlice } from './slices/hardwareSlice';
export type { ReengagementSlice, ReengagementPhase } from './slices/reengagementSlice';
export type { LiveSessionSlice, LiveSessionState } from './slices/liveSessionSlice';
export type { UiSlice } from './slices/uiSlice';
export type { DiagnosticsSlice } from './slices/diagnosticsSlice';

// Re-export initialSettings and constants
export { initialSettings, MAX_VISIBLE_MESSAGES_DEFAULT, allGeneratedLanguagePairs, DEFAULT_LANGUAGE_PAIR_ID } from './slices/settingsSlice';
