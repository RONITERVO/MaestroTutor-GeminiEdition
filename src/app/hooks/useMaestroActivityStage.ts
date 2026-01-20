// Copyright 2025 Roni Tervo
// SPDX-License-Identifier: Apache-2.0
/**
 * useMaestroActivityStage - syncs activity stage based on state.
 */

import { useEffect } from 'react';
import type { MaestroActivityStage } from '../../core/types';
import type { ReengagementPhase } from '../../store';

interface UseMaestroActivityStageConfig {
  externalUiTaskCount: number;
  isSpeaking: boolean;
  isSending: boolean;
  isListening: boolean;
  isUserActive: boolean;
  reengagementPhase: ReengagementPhase;
  setMaestroActivityStage: (stage: MaestroActivityStage) => void;
}

export const useMaestroActivityStage = ({
  externalUiTaskCount,
  isSpeaking,
  isSending,
  isListening,
  isUserActive,
  reengagementPhase,
  setMaestroActivityStage,
}: UseMaestroActivityStageConfig) => {
  useEffect(() => {
    if (externalUiTaskCount > 0) {
      setMaestroActivityStage('idle');
      return;
    }

    if (isSpeaking) {
      setMaestroActivityStage('speaking');
    } else if (isSending) {
      setMaestroActivityStage('typing');
    } else if (isListening || isUserActive) {
      setMaestroActivityStage('listening');
    } else if (reengagementPhase === 'countdown' || reengagementPhase === 'engaging') {
      setMaestroActivityStage('observing_high');
    } else if (reengagementPhase === 'watching') {
      setMaestroActivityStage('observing_medium');
    } else if (reengagementPhase === 'waiting') {
      setMaestroActivityStage('observing_low');
    } else {
      setMaestroActivityStage('idle');
    }
  }, [externalUiTaskCount, isSpeaking, isSending, isListening, isUserActive, reengagementPhase, setMaestroActivityStage]);
};

export default useMaestroActivityStage;
