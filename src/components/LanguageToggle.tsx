import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  const toggle = () => {
    i18n.changeLanguage(isEn ? 'pt-BR' : 'en');
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all"
      title={isEn ? 'Mudar para Português' : 'Switch to English'}
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs font-bold uppercase tracking-wide">
        {isEn ? 'EN' : 'PT'}
      </span>
    </button>
  );
}
