/**
 * SupplyGuard AI - Gemini AI SDK Client Utility
 * Configured per Google AI Studio standards with 'aistudio-build' User-Agent
 */

import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;
let quotaExhaustedUntil = 0;

export function isQuotaExhausted(): boolean {
  return Date.now() < quotaExhaustedUntil;
}

export function recordQuotaExceeded(retryDelayMs = 24 * 60 * 60 * 1000): void {
  quotaExhaustedUntil = Date.now() + Math.max(retryDelayMs, 60 * 1000);
}

export function getGeminiClient(): GoogleGenAI | null {
  if (isQuotaExhausted()) {
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiInstance;
}

export function isGeminiAvailable(): boolean {
  return !isQuotaExhausted() && getGeminiClient() !== null;
}

export function handleGeminiError(context: string, err: any): void {
  const rawMsg = err?.message || String(err || '');
  const status = err?.status || err?.code || (err?.error && err.error.code);
  const isQuota =
    status === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    rawMsg.includes('429') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('Quota exceeded');

  if (isQuota) {
    // Parse retryDelay if present (e.g. "84277s")
    let retryMs = 24 * 60 * 60 * 1000;
    const match = rawMsg.match(/retryDelay"?:\s*"(\d+)s"/);
    if (match && match[1]) {
      retryMs = parseInt(match[1], 10) * 1000;
    }
    recordQuotaExceeded(retryMs);
    // Silent switch to deterministic fallback engine without dumping raw error JSON
    return;
  }

  // For non-quota transient errors, fall back gracefully
}
