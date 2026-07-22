import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearSessionApiKey, resolveSessionApiKey, saveSessionApiKey } from '../apiKeyStorage';

const STORAGE_KEY = 'test-api-key';

describe('API key session storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores credentials only in sessionStorage', () => {
    saveSessionApiKey(STORAGE_KEY, '  secret-value  ');

    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('secret-value');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('migrates a legacy localStorage credential into the current session', () => {
    localStorage.setItem(STORAGE_KEY, 'legacy-secret');

    expect(resolveSessionApiKey(STORAGE_KEY, '')).toBe('legacy-secret');
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe('legacy-secret');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clears a legacy credential when a development-only key takes precedence', () => {
    localStorage.setItem(STORAGE_KEY, 'legacy-secret');

    expect(resolveSessionApiKey(STORAGE_KEY, 'development-secret')).toBe('development-secret');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('removes the persistent legacy copy even when sessionStorage is unavailable', () => {
    localStorage.setItem(STORAGE_KEY, 'legacy-secret');
    const setItemSpy = vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('session storage unavailable');
    });

    const resolved = resolveSessionApiKey(STORAGE_KEY, '');
    setItemSpy.mockRestore();

    expect(resolved).toBe('legacy-secret');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clears session and legacy copies together', () => {
    sessionStorage.setItem(STORAGE_KEY, 'session-secret');
    localStorage.setItem(STORAGE_KEY, 'legacy-secret');

    clearSessionApiKey(STORAGE_KEY);

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
