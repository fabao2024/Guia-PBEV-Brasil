import { renderHook, act } from '@testing-library/react';
import { useRateLimit } from '../useRateLimit';

describe('useRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests within the limit', () => {
    const { result } = renderHook(() => useRateLimit(3, 60000));

    act(() => { result.current.recordRequest(); });
    act(() => { result.current.recordRequest(); });

    const check = result.current.checkRateLimit();
    expect(check.allowed).toBe(true);
    expect(check.remainingRequests).toBe(1);
  });

  it('should block requests when limit is exceeded', () => {
    const { result } = renderHook(() => useRateLimit(3, 60000));

    act(() => { result.current.recordRequest(); });
    act(() => { result.current.recordRequest(); });
    act(() => { result.current.recordRequest(); });

    const check = result.current.checkRateLimit();
    expect(check.allowed).toBe(false);
    expect(check.remainingRequests).toBe(0);
    expect(check.retryAfterMs).toBeGreaterThan(0);
  });

  it('should allow requests again after window expires', () => {
    const { result } = renderHook(() => useRateLimit(2, 60000));

    act(() => { result.current.recordRequest(); });
    act(() => { result.current.recordRequest(); });

    expect(result.current.checkRateLimit().allowed).toBe(false);

    // Advance time past the window
    act(() => { vi.advanceTimersByTime(61000); });

    const check = result.current.checkRateLimit();
    expect(check.allowed).toBe(true);
    expect(check.remainingRequests).toBe(2);
  });

  it('should support manual reset', () => {
    const { result } = renderHook(() => useRateLimit(2, 60000));

    act(() => { result.current.recordRequest(); });
    act(() => { result.current.recordRequest(); });

    expect(result.current.checkRateLimit().allowed).toBe(false);

    act(() => { result.current.reset(); });

    const check = result.current.checkRateLimit();
    expect(check.allowed).toBe(true);
    expect(check.remainingRequests).toBe(2);
  });

  it('should use default values (10 requests / 60s)', () => {
    const { result } = renderHook(() => useRateLimit());

    for (let i = 0; i < 10; i++) {
      act(() => { result.current.recordRequest(); });
    }

    expect(result.current.checkRateLimit().allowed).toBe(false);
  });

  it('should report correct remaining count', () => {
    const { result } = renderHook(() => useRateLimit(5, 60000));

    expect(result.current.checkRateLimit().remainingRequests).toBe(5);

    act(() => { result.current.recordRequest(); });
    expect(result.current.checkRateLimit().remainingRequests).toBe(4);

    act(() => { result.current.recordRequest(); });
    act(() => { result.current.recordRequest(); });
    expect(result.current.checkRateLimit().remainingRequests).toBe(2);
  });
});
