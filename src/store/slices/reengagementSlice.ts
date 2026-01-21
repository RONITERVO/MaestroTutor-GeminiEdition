// Copyright 2025 Roni Tervo
// SPDX-License-Identifier: Apache-2.0
/**
 * Reengagement Slice - manages smart reengagement state and scheduling
 * 
 * Responsibilities:
 * - Reengagement phase tracking (idle, waiting, watching, countdown, engaging)
 * - User activity detection
 * - Schedule/cancel reengagement actions
 * 
 * Note: Timer refs remain in useSmartReengagement hook for cleanup lifecycle.
 * This slice manages the observable state.
 */

import type { StateCreator } from 'zustand';
import type { MaestroStore } from '../maestroStore';

export type ReengagementPhase = 'idle' | 'waiting' | 'watching' | 'countdown' | 'engaging';

export interface ReengagementSlice {
  // State
  reengagementPhase: ReengagementPhase;
  isUserActive: boolean;
  reengagementDeadline: number | null;
  
  // Actions
  setReengagementPhase: (phase: ReengagementPhase) => void;
  setIsUserActive: (value: boolean) => void;
  setReengagementDeadline: (deadline: number | null) => void;
  
  // Activity handler
  markUserActive: () => void;
}

export const createReengagementSlice: StateCreator<
  MaestroStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  ReengagementSlice
> = (set) => ({
  // Initial state
  reengagementPhase: 'idle',
  isUserActive: false,
  reengagementDeadline: null,
  
  // Actions
  setReengagementPhase: (phase: ReengagementPhase) => {
    set({ reengagementPhase: phase });
  },
  
  setIsUserActive: (value: boolean) => {
    set({ isUserActive: value });
  },
  
  setReengagementDeadline: (deadline: number | null) => {
    set({ reengagementDeadline: deadline });
  },
  
  // Mark user as active (resets after timeout in hook)
  markUserActive: () => {
    set({ isUserActive: true, reengagementPhase: 'idle', reengagementDeadline: null });
  },
});
