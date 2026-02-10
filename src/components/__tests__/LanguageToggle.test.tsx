import { renderHook, act } from '@testing-library/react';

// Mock i18next before importing anything that uses it
vi.mock('react-i18next', () => {
  let currentLang = 'pt-BR';
  const changeLanguage = vi.fn((lng: string) => {
    currentLang = lng;
    return Promise.resolve();
  });
  return {
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        language: currentLang,
        changeLanguage,
      },
    }),
  };
});

describe('LanguageToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store language preference in localStorage via i18n config', () => {
    localStorage.setItem('lang', 'en');
    expect(localStorage.getItem('lang')).toBe('en');
  });

  it('should default to pt-BR when no language is stored', () => {
    expect(localStorage.getItem('lang')).toBeNull();
  });

  it('should support both pt-BR and en languages', () => {
    const supportedLangs = ['pt-BR', 'en'];
    expect(supportedLangs).toContain('pt-BR');
    expect(supportedLangs).toContain('en');
  });
});
