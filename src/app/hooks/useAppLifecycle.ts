// Copyright 2025 Roni Tervo
// SPDX-License-Identifier: Apache-2.0
/**
 * useAppLifecycle - App-wide lifecycle effects.
 *
 * Handles document title and splash screen removal.
 */

import { useEffect } from 'react';
import type { TranslationFunction } from './useTranslations';
import { APP_TITLE_KEY } from '../../core/config/app';

export const useAppLifecycle = (t: TranslationFunction) => {
  useEffect(() => {
    document.title = t(APP_TITLE_KEY);
  }, [t]);

  useEffect(() => {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      setTimeout(() => {
        splashScreen.classList.add('fade-out');
        splashScreen.addEventListener('transitionend', () => {
          splashScreen.remove();
        });
      }, 200);
    }
  }, []);
};

export default useAppLifecycle;
