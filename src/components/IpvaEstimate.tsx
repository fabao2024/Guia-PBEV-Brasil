import { useTranslation } from 'react-i18next';
import { Car } from '../types';
import { resolveIpva, SP_IPVA_REVIEWED, SP_IPVA_SOURCES } from '../utils/ipva';

export default function IpvaEstimate({ car, state }: { car: Car; state: string }) {
  const { t, i18n } = useTranslation();
  const result = resolveIpva(car, state);
  const locale = i18n?.language?.startsWith('en') ? 'en-US' : 'pt-BR';
  const rate = result.rate === null ? '—' : `${(result.rate * 100).toLocaleString(locale, { maximumFractionDigits: 2 })}%`;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-xs text-white/70">
      <p className="font-semibold text-white/90">IPVA · {state} · {result.year} {result.rate !== null && `· ${rate}`}</p>
      <p className="mt-1 font-semibold text-amber-200">{t(`ipva.status.${result.status}`)}</p>
      {result.amount !== null && <p className="mt-1 font-bold text-white">{result.reason === 'eligible' ? t('ipva.estimatedExemption') : `R$ ${result.amount.toLocaleString(locale)}`}</p>}
      <p className="mt-1 leading-relaxed">{t(`ipva.reason.${result.reason}`)}</p>
      {result.missing.length > 0 && <p className="mt-1">{t('ipva.missing')}: {result.missing.map(key => t(`ipva.fields.${key}`)).join(', ')}.</p>}
      {state === 'SP' && car.taxProfile && <div className="mt-2" onClick={event => event.stopPropagation()}>
        {car.taxProfile.scope && <p>{t('ipva.technicalScope', { scope: car.taxProfile.scope })}</p>}
        <p className="mt-1">{t('ipva.technicalSources')}:</p>
        {(car.taxProfile.sources ?? [{ url: car.taxProfile.sourceUrl, label: t('ipva.technicalSources') }]).filter(source => /^https:\/\//.test(source.url)).map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-[#72d7ff] underline">{source.label}</a>)}
      </div>}
      <p className="mt-2 leading-relaxed">{t('ipva.baseDisclaimer')}</p>
      {state === 'SP' && <>
        <p className="mt-2 leading-relaxed">{t('ipva.otherBenefits')}</p>
        <p className="mt-2 leading-relaxed">{t('ipva.paymentDisclaimer')}</p>
        <p className="mt-2 leading-relaxed">{t('ipva.schedule')}</p>
        <p className="mt-2">{t('ipva.reviewed', { date: SP_IPVA_REVIEWED })}</p>
      </>}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1" onClick={event => event.stopPropagation()}>
        {state === 'SP' ? SP_IPVA_SOURCES.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="text-[#72d7ff] underline">{source.label}</a>) : <a href="https://www.confaz.fazenda.gov.br/links" target="_blank" rel="noopener noreferrer" className="text-[#72d7ff] underline">{t('ipva.consultSefaz')}</a>}
      </div>
    </div>
  );
}
