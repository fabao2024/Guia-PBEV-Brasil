import { useCallback } from 'react';

const DEFAULT_MAX_REQUESTS = 10;
const DEFAULT_WINDOW_MS = 60_000; // 1 minute

// Obfuscated key — avoids trivial localStorage manipulation by curious users
const STORAGE_KEY = '_rl_ct';

interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  retryAfterMs: number;
}

function readTimestamps(windowMs: number): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all: number[] = JSON.parse(raw);
    const now = Date.now();
    // Prune expired entries while reading
    return all.filter(t => now - t < windowMs);
  } catch {
    return [];
  }
}

function writeTimestamps(timestamps: number[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

export function useRateLimit(
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowMs = DEFAULT_WINDOW_MS
) {
  const checkRateLimit = useCallback((): RateLimitResult => {
    const timestamps = readTimestamps(windowMs);
    const remaining = maxRequests - timestamps.length;

    if (remaining <= 0) {
      const oldest = timestamps[0];
      const retryAfterMs = windowMs - (Date.now() - oldest);
      return { allowed: false, remainingRequests: 0, retryAfterMs };
    }

    return { allowed: true, remainingRequests: remaining, retryAfterMs: 0 };
  }, [maxRequests, windowMs]);

  const recordRequest = useCallback(() => {
    const timestamps = readTimestamps(windowMs);
    timestamps.push(Date.now());
    writeTimestamps(timestamps);
  }, [windowMs]);

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* silent */ }
  }, []);

  return { checkRateLimit, recordRequest, reset };
}
