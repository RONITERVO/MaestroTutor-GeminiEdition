// Copyright 2025 Roni Tervo
// SPDX-License-Identifier: Apache-2.0
/**
 * Diagnostics Slice - manages debug and diagnostic state
 * 
 * Responsibilities:
 * - Debug log visibility
 * - App-wide diagnostic state
 */

import type { StateCreator } from 'zustand';
import type { MaestroStore } from '../maestroStore';

export interface DiagnosticsSlice {
  // State
  showDebugLogs: boolean;
  
  // Actions
  setShowDebugLogs: (value: boolean) => void;
  toggleDebugLogs: () => void;
}

export const createDiagnosticsSlice: StateCreator<
  MaestroStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  DiagnosticsSlice
> = (set) => ({
  // Initial state
  showDebugLogs: false,
  
  // Actions
  setShowDebugLogs: (value: boolean) => {
    set({ showDebugLogs: value });
  },
  
  toggleDebugLogs: () => {
    set(state => ({ showDebugLogs: !state.showDebugLogs }));
  },
});
