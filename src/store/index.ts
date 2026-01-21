// Copyright 2025 Roni Tervo
// SPDX-License-Identifier: Apache-2.0
/**
 * Store Public API
 * 
 * This is the single entry point for all store access.
 * Import from here, not from individual slices.
 */

export { 
  useMaestroStore, 
  getStoreState, 
  subscribeToStore,
  initialSettings,
  MAX_VISIBLE_MESSAGES_DEFAULT,
  allGeneratedLanguagePairs,
  DEFAULT_LANGUAGE_PAIR_ID
} from './maestroStore';

export type {
  MaestroStore,
  SettingsSlice,
  ChatSlice,
  SpeechSlice,
  HardwareSlice,
  ReengagementSlice,
  ReengagementPhase,
  LiveSessionSlice,
  LiveSessionState,
  UiSlice,
  DiagnosticsSlice,
} from './maestroStore';
