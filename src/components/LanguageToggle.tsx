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
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-black/50 backdrop-blur-md text-[#a0a0a0] hover:border-[#00b4ff]/50 hover:text-[#00b4ff] hover:bg-black/80 transition-all font-black uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)]"
      title={isEn ? 'Mudar para Português' : 'Switch to English'}
    >
      <Globe className="w-4 h-4" />
      <span className="text-[10px]">
        {isEn ? 'EN' : 'PT'}
      </span>
    </button>
  );
}
