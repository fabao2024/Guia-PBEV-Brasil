import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ExternalLink, MapPin, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CARREGADOS_REFERENCE } from '../data/carregadosReference';

/** Official third-party embed only. Never feeds station coordinates or route candidates. */
export function CarregadosMapPanel() {
  const { t, i18n } = useTranslation();
  const [activated, setActivated] = useState(false);
  const [frameState, setFrameState] = useState<'waiting' | 'loaded' | 'error'>('waiting');
  const frameRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (activated) frameRef.current?.focus();
  }, [activated]);
  const number = (value: number) => value.toLocaleString(i18n.resolvedLanguage === 'en' ? 'en-US' : 'pt-BR');
  const reference = (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-[11px] leading-relaxed text-white/65">{t('chargingMap.carregados.total')}</dt>
          <dd className="mt-1 text-2xl font-black tabular-nums tracking-tight text-white">{number(CARREGADOS_REFERENCE.totalStations)}</dd>
        </div>
        <div>
          <dt className="text-[11px] leading-relaxed text-white/65">{t('chargingMap.carregados.publicFast')}</dt>
          <dd className="mt-1 text-2xl font-black tabular-nums tracking-tight text-[#b8ec79]">{number(CARREGADOS_REFERENCE.publicAndFastStations)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] text-white/65">{t('chargingMap.carregados.referenceDate', { date: CARREGADOS_REFERENCE.consultedAt })}</p>
      <a href={CARREGADOS_REFERENCE.marketUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-[#b8ec79] underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8ec79]">
        {t('chargingMap.carregados.marketSource')}<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
      </a>
      <p className="text-[11px] leading-relaxed text-white/65">{t('chargingMap.carregados.countNotice')}</p>
    </div>
  );

  return (
    <section aria-label={t('chargingMap.carregados.panelLabel')} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-[#b8ec79]/25 bg-[#b8ec79]/10 p-2.5 text-[#b8ec79]">
          <MapPin aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#b8ec79]">{t('chargingMap.carregados.eyebrow')}</p>
          <h3 className={`${activated ? 'text-base' : 'text-xl sm:text-2xl'} font-black leading-tight tracking-tight text-white`}>{t('chargingMap.carregados.title')}</h3>
        </div>
      </div>

      {!activated ? <>
        <p className="max-w-2xl text-sm leading-relaxed text-white/75">{t('chargingMap.carregados.description')}</p>
        {reference}
        <p id="carregados-privacy" className="flex items-start gap-2 text-xs leading-relaxed text-white/65">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#b8ec79]" />
          <span>{t('chargingMap.carregados.privacy')}{' '}
            <a href={CARREGADOS_REFERENCE.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-[#b8ec79] underline underline-offset-4 hover:text-white">{t('chargingMap.carregados.privacyLink')}</a>
          </span>
        </p>
        <button type="button" aria-describedby="carregados-privacy" onClick={() => setActivated(true)}
          className="flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#b8ec79] px-5 py-3 text-sm font-extrabold text-[#14230a] transition-colors hover:bg-[#cef6a2] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b8ec79]">
          {t('chargingMap.carregados.load')}<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </> : <>
        <details className="shrink-0 text-xs text-white/70">
          <summary className="min-h-11 cursor-pointer py-3 font-semibold">{t('chargingMap.carregados.referenceSummary')}</summary>
          {reference}
        </details>
        <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-xl border border-[#b8ec79]/25 bg-[#10170e]">
          <iframe ref={frameRef} src={CARREGADOS_REFERENCE.embedUrl} title={t('chargingMap.carregados.frameTitle')}
            className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow="geolocation 'none'; camera 'none'; microphone 'none'"
            onLoad={() => setFrameState(previous => previous === 'error' ? previous : 'loaded')}
            onErrorCapture={() => setFrameState('error')} />
          {frameState === 'waiting' && <p role="status" className="pointer-events-none absolute left-3 top-3 rounded-lg bg-[#0f1115]/95 px-3 py-2 text-xs text-white/80">{t('chargingMap.carregados.loading')}</p>}
          {frameState === 'error' && <p role="alert" className="absolute inset-x-3 top-3 rounded-lg border border-amber-400/25 bg-[#0f1115]/95 p-3 text-xs text-amber-100">{t('chargingMap.carregados.loadError')}</p>}
        </div>
        <p className="text-[11px] leading-relaxed text-white/65">{t('chargingMap.carregados.fallback')}</p>
      </>}

      <p className="text-[11px] leading-relaxed text-white/65">{t('chargingMap.carregados.routeNotice')}</p>
      <a href={CARREGADOS_REFERENCE.mapUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-xs font-semibold text-[#b8ec79] underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8ec79]">
        {t('chargingMap.carregados.openSite')}<ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
      </a>
      <a href={CARREGADOS_REFERENCE.integrationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center self-start text-[11px] text-white/65 underline underline-offset-4 hover:text-white">{t('chargingMap.carregados.integrationLink')}</a>
    </section>
  );
}
