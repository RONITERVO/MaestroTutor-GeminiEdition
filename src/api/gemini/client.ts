// Copyright 2025 Roni Tervo
//
// SPDX-License-Identifier: Apache-2.0
import { GoogleGenAI } from '@google/genai';

export class ApiError extends Error {
  status?: number;
  code?: string;
  cooldownSuggestSeconds?: number;
  constructor(message: string, opts?: { status?: number; code?: string; cooldownSuggestSeconds?: number }) {
    super(message);
    this.status = opts?.status;
    this.code = opts?.code;
    this.cooldownSuggestSeconds = opts?.cooldownSuggestSeconds;
  }
}

export const getAi = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new ApiError(
      'Missing API key: process.env.API_KEY (mapped from VITE_API_KEY) is not set or empty',
      { code: 'MISSING_API_KEY' }
    );
  }
  return new GoogleGenAI({ apiKey });
};
