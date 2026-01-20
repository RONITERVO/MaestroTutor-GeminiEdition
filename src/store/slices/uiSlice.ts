// Copyright 2025 Roni Tervo
// SPDX-License-Identifier: Apache-2.0
/**
 * UI Slice - manages cross-component UI state
 * 
 * Responsibilities:
 * - Language selector state (open, temp selections)
 * - Shell state (topbar open)
 * - Busy state tracking (UI task tokens)
 * - Maestro activity stage
 * - Loading assets (gifs, avatar)
 * - Transition states
 */

import type { StateCreator } from 'zustand';
import type { MaestroActivityStage } from '../../core/types';
import type { MaestroStore } from '../maestroStore';

export interface UiSlice {
  // Language Selector
  isLanguageSelectionOpen: boolean;
  tempNativeLangCode: string | null;
  tempTargetLangCode: string | null;
  languageSelectorLastInteraction: number;
  
  // Shell
  isTopbarOpen: boolean;
  
  // Busy State
  uiBusyTaskTags: Set<string>;
  externalUiTaskCount: number;
  
  // Activity
  maestroActivityStage: MaestroActivityStage;
  
  // Assets
  loadingGifs: string[];
  transitioningImageId: string | null;
  maestroAvatarUri: string | null;
  maestroAvatarMimeType: string | null;
  
  // Actions - Language Selector
  setIsLanguageSelectionOpen: (value: boolean) => void;
  setTempNativeLangCode: (code: string | null) => void;
  setTempTargetLangCode: (code: string | null) => void;
  updateLanguageSelectorInteraction: () => void;
  
  // Actions - Shell
  setIsTopbarOpen: (value: boolean) => void;
  toggleTopbar: () => void;
  
  // Actions - Busy State
  addUiBusyToken: (tag: string) => string;
  removeUiBusyToken: (tag?: string | null) => void;
  setExternalUiTaskCount: (count: number) => void;
  isUiBusy: () => boolean;
  
  // Actions - Activity
  setMaestroActivityStage: (stage: MaestroActivityStage) => void;
  
  // Actions - Assets
  setLoadingGifs: (gifs: string[]) => void;
  setTransitioningImageId: (id: string | null) => void;
  setMaestroAvatar: (uri: string | null, mimeType: string | null) => void;
}

export const createUiSlice: StateCreator<
  MaestroStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  UiSlice
> = (set, get) => ({
  // Initial Language Selector state
  isLanguageSelectionOpen: false,
  tempNativeLangCode: null,
  tempTargetLangCode: null,
  languageSelectorLastInteraction: 0,
  
  // Initial Shell state
  isTopbarOpen: false,
  
  // Initial Busy State
  uiBusyTaskTags: new Set<string>(),
  externalUiTaskCount: 0,
  
  // Initial Activity state
  maestroActivityStage: 'idle',
  
  // Initial Assets state
  loadingGifs: [],
  transitioningImageId: null,
  maestroAvatarUri: null,
  maestroAvatarMimeType: null,
  
  // Language Selector Actions
  setIsLanguageSelectionOpen: (value: boolean) => {
    set({ isLanguageSelectionOpen: value });
  },
  
  setTempNativeLangCode: (code: string | null) => {
    set({ tempNativeLangCode: code, languageSelectorLastInteraction: Date.now() });
  },
  
  setTempTargetLangCode: (code: string | null) => {
    set({ tempTargetLangCode: code, languageSelectorLastInteraction: Date.now() });
  },
  
  updateLanguageSelectorInteraction: () => {
    set({ languageSelectorLastInteraction: Date.now() });
  },
  
  // Shell Actions
  setIsTopbarOpen: (value: boolean) => {
    set({ isTopbarOpen: value });
  },
  
  toggleTopbar: () => {
    set(state => ({ isTopbarOpen: !state.isTopbarOpen }));
  },
  
  // Busy State Actions
  addUiBusyToken: (tag: string): string => {
    const token = `${tag}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    set(state => {
      const newTags = new Set(state.uiBusyTaskTags);
      newTags.add(token);
      return { uiBusyTaskTags: newTags };
    });
    return token;
  },
  
  removeUiBusyToken: (tag?: string | null) => {
    if (!tag) return;
    set(state => {
      const newTags = new Set(state.uiBusyTaskTags);
      newTags.delete(tag);
      return { uiBusyTaskTags: newTags };
    });
  },
  
  setExternalUiTaskCount: (count: number) => {
    set({ externalUiTaskCount: count });
  },
  
  isUiBusy: (): boolean => {
    const state = get();
    return state.uiBusyTaskTags.size > 0 || state.externalUiTaskCount > 0;
  },
  
  // Activity Actions
  setMaestroActivityStage: (stage: MaestroActivityStage) => {
    set({ maestroActivityStage: stage });
  },
  
  // Assets Actions
  setLoadingGifs: (gifs: string[]) => {
    set({ loadingGifs: gifs });
  },
  
  setTransitioningImageId: (id: string | null) => {
    set({ transitioningImageId: id });
  },
  
  setMaestroAvatar: (uri: string | null, mimeType: string | null) => {
    set({ maestroAvatarUri: uri, maestroAvatarMimeType: mimeType });
  },
});
