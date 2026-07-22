function removeLegacyApiKey(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Legacy storage can be unavailable in hardened/private browser contexts.
  }
}

export function resolveSessionApiKey(storageKey: string, developmentKey = ''): string {
  const trimmedDevelopmentKey = developmentKey.trim();
  if (trimmedDevelopmentKey) {
    removeLegacyApiKey(storageKey);
    return trimmedDevelopmentKey;
  }

  let sessionValue = '';
  try {
    sessionValue = sessionStorage.getItem(storageKey)?.trim() ?? '';
  } catch {
    // Continue so a persistent legacy copy can still be removed.
  }
  if (sessionValue) {
    removeLegacyApiKey(storageKey);
    return sessionValue;
  }

  let legacyValue = '';
  try {
    legacyValue = localStorage.getItem(storageKey)?.trim() ?? '';
  } catch {
    return '';
  }

  if (legacyValue) {
    saveSessionApiKey(storageKey, legacyValue);
  } else {
    removeLegacyApiKey(storageKey);
  }
  return legacyValue;
}

export function saveSessionApiKey(storageKey: string, value: string): void {
  const trimmed = value.trim();
  try {
    if (trimmed) {
      sessionStorage.setItem(storageKey, trimmed);
    } else {
      sessionStorage.removeItem(storageKey);
    }
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }
  removeLegacyApiKey(storageKey);
}

export function clearSessionApiKey(storageKey: string): void {
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }
  removeLegacyApiKey(storageKey);
}
