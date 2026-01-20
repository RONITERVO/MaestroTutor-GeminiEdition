// Copyright 2025 Roni Tervo
// SPDX-License-Identifier: Apache-2.0
/**
 * useSuggestionModeAutoRestart - restarts STT in suggestion mode.
 */

import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

interface UseSuggestionModeAutoRestartConfig {
  isListening: boolean;
  settingsRef: MutableRefObject<{ stt: { enabled: boolean; language: string }; isSuggestionMode: boolean }>;
  startListening: (lang: string) => void;
}

export const useSuggestionModeAutoRestart = ({
  isListening,
  settingsRef,
  startListening,
}: UseSuggestionModeAutoRestartConfig) => {
  const prevIsListeningRef = useRef<boolean>(false);

  useEffect(() => {
    const wasListening = prevIsListeningRef.current;
    prevIsListeningRef.current = isListening;

    if (wasListening && !isListening) {
      if (settingsRef.current.isSuggestionMode && settingsRef.current.stt.enabled) {
        setTimeout(() => {
          if (settingsRef.current.stt.enabled && settingsRef.current.isSuggestionMode) {
            startListening(settingsRef.current.stt.language);
          }
        }, 100);
      }
    }
  }, [isListening, settingsRef, startListening]);
};

export default useSuggestionModeAutoRestart;
