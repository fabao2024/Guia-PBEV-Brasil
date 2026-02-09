import { useRef, useCallback } from 'react';

const DEFAULT_MAX_REQUESTS = 10;
const DEFAULT_WINDOW_MS = 60_000; // 1 minute

interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  retryAfterMs: number;
}

export function useRateLimit(
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowMs = DEFAULT_WINDOW_MS
) {
  const timestamps = useRef<number[]>([]);

  const pruneOld = useCallback((now: number) => {
    timestamps.current = timestamps.current.filter(
      (t) => now - t < windowMs
    );
  }, [windowMs]);

  const checkRateLimit = useCallback((): RateLimitResult => {
    const now = Date.now();
    pruneOld(now);

    const remaining = maxRequests - timestamps.current.length;

    if (remaining <= 0) {
      const oldest = timestamps.current[0];
      const retryAfterMs = windowMs - (now - oldest);
      return { allowed: false, remainingRequests: 0, retryAfterMs };
    }

    return { allowed: true, remainingRequests: remaining, retryAfterMs: 0 };
  }, [maxRequests, windowMs, pruneOld]);

  const recordRequest = useCallback(() => {
    timestamps.current.push(Date.now());
  }, []);

  const reset = useCallback(() => {
    timestamps.current = [];
  }, []);

  return { checkRateLimit, recordRequest, reset };
}
