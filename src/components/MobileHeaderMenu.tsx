import { useEffect, useId, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

export default function MobileHeaderMenu({ onSuggestChat }: { onSuggestChat: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    const pointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  const item = 'flex items-center min-h-11 rounded-lg px-3 py-2 text-left text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#00b4ff]';
  return (
    <div ref={root} className="relative md:hidden" onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
    }}>
      <button ref={trigger} type="button" aria-label={t('header.moreOptions')} aria-expanded={open}
        aria-controls={panelId} onClick={() => setOpen(value => !value)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white focus-visible:outline-2 focus-visible:outline-[#00b4ff]">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && <nav id={panelId} aria-label={t('header.moreOptions')}
        className="absolute right-0 top-full z-50 mt-2 flex w-64 max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-2xl border border-white/15 bg-[#10121b] p-2 shadow-xl">
        <a className={item} href="/parceiros/" onClick={() => setOpen(false)}>{t('header.partners')}</a>
        <a className={item} href="https://github.com/fabao2024/Guia-PBEV-Brasil/issues/new?template=sugestao-ev.yml"
          target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>{t('header.suggestGithub')}</a>
        <button type="button" className={item} onClick={() => { setOpen(false); onSuggestChat(); }}>{t('header.suggestChat')}</button>
        <div className="border-t border-white/10 p-2"><LanguageToggle /></div>
      </nav>}
    </div>
  );
}
