import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';

const savedLang = localStorage.getItem('lang') || 'pt-BR';

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng);
  document.documentElement.lang = lng === 'en' ? 'en' : 'pt-BR';
  document.title = lng === 'en' ? 'PBEV Guide 2025' : 'Guia PBEV 2025';
});

// Set initial values
document.documentElement.lang = savedLang === 'en' ? 'en' : 'pt-BR';
document.title = savedLang === 'en' ? 'PBEV Guide 2025' : 'Guia PBEV 2025';

export default i18n;
