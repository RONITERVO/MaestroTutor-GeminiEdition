// Copyright 2025 Roni Tervo
// SPDX-License-Identifier: Apache-2.0
/**
 * useIdleReengagement - schedules reengagement when idle.
 */

import { useEffect } from 'react';
import type { ReengagementPhase } from '../../store';
import type { LanguagePair } from '../../core/types';

interface UseIdleReengagementConfig {
  selectedLanguagePair: LanguagePair | undefined;
  isSpeaking: boolean;
  isSending: boolean;
  isListening: boolean;
  isUserActive: boolean;
  reengagementPhase: ReengagementPhase;
  scheduleReengagement: (reason: string, delayOverrideMs?: number) => void;
  cancelReengagement: () => void;
}

export const useIdleReengagement = ({
  selectedLanguagePair,
  isSpeaking,
  isSending,
  isListening,
  isUserActive,
  reengagementPhase,
  scheduleReengagement,
  cancelReengagement,
}: UseIdleReengagementConfig) => {
  useEffect(() => {
    if (!selectedLanguagePair) {
      cancelReengagement();
      return;
    }
    if (isSpeaking || isSending || isListening || isUserActive) {
      cancelReengagement();
      return;
    }
    if (reengagementPhase === 'idle') {
      scheduleReengagement('became-idle');
    }
  }, [selectedLanguagePair, isSpeaking, isSending, isListening, isUserActive, reengagementPhase, cancelReengagement, scheduleReengagement]);
};

export default useIdleReengagement;
