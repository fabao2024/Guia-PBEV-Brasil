import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, ExternalLink, Landmark, Fuel, Zap, Scale, Route as RouteIcon, AlertTriangle, Ruler } from 'lucide-react';
import { CATALOG_EVIDENCE } from '../constants/catalogEvidence';
import { ELECTRICITY_PRICES_UPDATED } from '../constants/electricityPricesByState';
import { FUEL_PRICES_UPDATED } from '../constants/fuelPricesByState';
import { IPVA_BY_STATE, IPVA_DATA_UPDATED } from '../constants/ipvaByState';
import {
  TCO_BY_CATEGORY, ETHANOL_FACTOR, EV_MAINT_KM, COMB_MAINT_KM,
  EV_DEPR_ANNUAL, COMB_DEPR_ANNUAL, EV_INS_RATE, COMB_INS_RATE,
} from '../utils/tco';

export default function MethodologyPage() {
  const { t, i18n } = useTranslation();
  const fmt = (n: number) => n.toLocaleString(i18n.language === 'en' ? 'en-US' : 'pt-BR');
  const pct = (r: number) => (r * 100).toLocaleString(i18n.language === 'en' ? 'en-US' : 'pt-BR', { maximumFractionDigits: 1 });
  const helmetTitle = t('methodology.title', 'Metodologia de Cálculo') + ' | Guia PBEV Brasil';
  const helmetDesc = t('methodology.subtitle', 'Fontes de dados e fórmulas do Guia PBEV.');
  const canonicalUrl = 'https://guiapbev.cloud/metodologia/';
  const categories = Object.keys(TCO_BY_CATEGORY);
  const conditionalExemptions = IPVA_BY_STATE.filter(s => s.exemptionThreshold !== undefined);

  return (
    <>
      <Helmet>
        <title>{helmetTitle}</title>
        <meta name="description" content={helmetDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={helmetTitle} />
        <meta property="og:description" content={helmetDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={helmetTitle} />
        <meta name="twitter:description" content={helmetDesc} />
      </Helmet>

      <div className="text-white min-h-screen bg-black font-sans relative selection:bg-[#00b4ff] selection:text-black">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] pointer-events-none opacity-30"
          style={{ background: '#00b4ff' }}
        />

        <nav className="bg-[#0a0b12]/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-3 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-[#a0a0a0] hover:text-white transition-colors no-underline text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('methodology.backToCatalog', 'Voltar ao catálogo')}</span>
              <span className="sm:hidden">{t('nav.back', 'Voltar')}</span>
            </Link>
            <Link to="/" className="flex items-center gap-2 no-underline">
              <div className="bg-[#1a1a1a] border border-[#00b4ff]/30 text-[#00b4ff] p-1.5 rounded-lg">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-black text-white tracking-tight">Guia PBEV <span className="text-[#00b4ff]">Brasil</span></span>
            </Link>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-[#00b4ff]" aria-hidden="true" />
              {t('methodology.title', 'Metodologia de Cálculo')}
            </h1>
            <p className="mt-3 text-[#a0a0a0] leading-relaxed">
              {t('methodology.subtitle', 'Fontes de dados e fórmulas do Guia PBEV.')}
            </p>
          </header>

          <section aria-labelledby="meth-sources" className="mb-10 rounded-3xl border border-white/10 bg-[#111111] p-5 md:p-6">
            <h2 id="meth-sources" className="text-xl font-bold mb-3 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#00b4ff]" aria-hidden="true" />
              {t('methodology.sourcesTitle', 'Fontes de dados')}
            </h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-4">{t('methodology.sourcesIntro', '')}</p>
            <ul className="space-y-3 text-sm text-white/80 leading-relaxed">
              <li>
                <strong className="text-white">{t('methodology.sourcesPbev', { ref: CATALOG_EVIDENCE.officialReference, defaultValue: 'PBEV/INMETRO — {{ref}}' })}</strong>{' '}
                <a
                  href={CATALOG_EVIDENCE.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#72d7ff] hover:text-white font-semibold"
                >
                  {t('methodology.sourcesPbevUrl', 'Tabela oficial do PBE Veicular')}
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
              <li>{t('methodology.sourcesPrices', { through: CATALOG_EVIDENCE.marketHistoryThrough, disclaimer: CATALOG_EVIDENCE.priceDisclaimer, defaultValue: 'Preços — histórico até {{through}}. {{disclaimer}}' })}</li>
              <li>{t('methodology.sourcesAneel', { date: ELECTRICITY_PRICES_UPDATED, defaultValue: 'Eletricidade — tarifas homologadas ANEEL (B1 residencial). Referência {{date}}.' })}</li>
              <li>{t('methodology.sourcesAnp', { date: FUEL_PRICES_UPDATED, defaultValue: 'Combustível — preços ANP. Referência {{date}}.' })}</li>
              <li>{t('methodology.sourcesIpva', { date: IPVA_DATA_UPDATED, defaultValue: 'IPVA — alíquotas por estado. Referência {{date}}.' })}</li>
            </ul>
          </section>

          <section aria-labelledby="meth-energy" className="mb-10 rounded-3xl border border-white/10 bg-[#111111] p-5 md:p-6">
            <h2 id="meth-energy" className="text-xl font-bold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00b4ff]" aria-hidden="true" />
              {t('methodology.energyTitle', 'Custo de energia')}
            </h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-3">{t('methodology.energyIntro', '')}</p>
            <p className="text-sm font-mono text-[#72d7ff] bg-white/5 rounded-xl px-4 py-3 mb-3">{t('methodology.energyFormula', '')}</p>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-4">{t('methodology.energyNote', '')}</p>
            <table className="w-full text-sm">
              <caption className="sr-only">{t('methodology.energyTableCaption', 'Consumo elétrico padrão')}</caption>
              <thead>
                <tr className="text-left text-[#666666] text-xs uppercase tracking-wider">
                  <th scope="col" className="py-2 pr-2">{t('sidebar.category', 'Categoria')}</th>
                  <th scope="col" className="py-2 text-right">{t('methodology.energyKwhUnit', 'kWh/100 km')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat} className="border-t border-white/8">
                    <td className="py-2 pr-2">{t(`categories.${cat}`, cat)}</td>
                    <td className="py-2 text-right font-mono">{TCO_BY_CATEGORY[cat].efficiencyKwh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section aria-labelledby="meth-fuel" className="mb-10 rounded-3xl border border-white/10 bg-[#111111] p-5 md:p-6">
            <h2 id="meth-fuel" className="text-xl font-bold mb-3 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-[#00b4ff]" aria-hidden="true" />
              {t('methodology.fuelTitle', 'Custo de combustível')}
            </h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-3">{t('methodology.fuelIntro', '')}</p>
            <table className="w-full text-sm mb-4">
              <caption className="sr-only">{t('methodology.fuelIntro', '')}</caption>
              <thead>
                <tr className="text-left text-[#666666] text-xs uppercase tracking-wider">
                  <th scope="col" className="py-2 pr-2">{t('sidebar.category', 'Categoria')}</th>
                  <th scope="col" className="py-2 text-right">{t('methodology.fuelKmUnit', 'km/L')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat} className="border-t border-white/8">
                    <td className="py-2 pr-2">{t(`categories.${cat}`, cat)}</td>
                    <td className="py-2 text-right font-mono">{fmt(TCO_BY_CATEGORY[cat].combKmL)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-3">
              {t('methodology.fuelEthanol', { factor: fmt(ETHANOL_FACTOR), defaultValue: 'Etanol: consumo {{factor}}× maior.' })}
            </p>
            <p className="text-sm font-mono text-[#72d7ff] bg-white/5 rounded-xl px-4 py-3">{t('methodology.fuelFormula', '')}</p>
          </section>

          <section aria-labelledby="meth-ipva" className="mb-10 rounded-3xl border border-white/10 bg-[#111111] p-5 md:p-6">
            <h2 id="meth-ipva" className="text-xl font-bold mb-3 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#00b4ff]" aria-hidden="true" />
              {t('methodology.ipvaTitle', 'IPVA')}
            </h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-3">{t('methodology.ipvaIntro', '')}</p>
            <p className="text-sm font-mono text-[#72d7ff] bg-white/5 rounded-xl px-4 py-3 mb-4">{t('methodology.ipvaFormula', '')}</p>
            {conditionalExemptions.length > 0 && (
              <>
                <h3 className="text-sm font-bold text-white mb-2">{t('methodology.ipvaExemptionTitle', 'Isenções condicionais')}</h3>
                <p className="text-sm text-[#a0a0a0] leading-relaxed mb-2">{t('methodology.ipvaExemptionNote', '')}</p>
                <ul className="text-sm text-white/80 space-y-1">
                  {conditionalExemptions.map(s => (
                    <li key={s.abbr}>
                      <strong className="text-white">{s.abbr}</strong> —{' '}
                      {t('methodology.ipvaOver', { value: `R$ ${fmt(s.exemptionThreshold ?? 0)}`, defaultValue: 'acima de {{value}}' })}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section aria-labelledby="meth-tco" className="mb-10 rounded-3xl border border-[#00b4ff]/20 bg-[#00b4ff]/[0.04] p-5 md:p-6">
            <h2 id="meth-tco" className="text-xl font-bold mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#00b4ff]" aria-hidden="true" />
              {t('methodology.tcoTitle', 'TCO — 4 anos')}
            </h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-4">{t('methodology.tcoIntro', '')}</p>
            <ul className="space-y-2 text-sm text-white/80 leading-relaxed mb-4">
              <li>{t('methodology.tcoDeprEv', { value: pct(EV_DEPR_ANNUAL), defaultValue: 'Depreciação EV: {{value}} ao ano.' })}</li>
              <li>{t('methodology.tcoDeprComb', { value: pct(COMB_DEPR_ANNUAL), defaultValue: 'Depreciação combustão: {{value}} ao ano.' })}</li>
              <li>{t('methodology.tcoInsEv', { value: pct(EV_INS_RATE), defaultValue: 'Seguro EV: {{value}} ao ano.' })}</li>
              <li>{t('methodology.tcoInsComb', { value: pct(COMB_INS_RATE), defaultValue: 'Seguro combustão: {{value}} ao ano.' })}</li>
              <li>{t('methodology.tcoMaint', { evKm: fmt(EV_MAINT_KM), combKm: fmt(COMB_MAINT_KM), defaultValue: 'Manutenção proporcional ao km.' })}</li>
              <li>{t('methodology.tcoIpva', '')}</li>
              <li>{t('methodology.tcoEnergy', '')}</li>
            </ul>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-4">{t('methodology.tcoResidual', '')}</p>
            <table className="w-full text-sm">
              <caption className="sr-only">{t('methodology.tcoMaintCaption', 'Custo de revisão')}</caption>
              <thead>
                <tr className="text-left text-[#666666] text-xs uppercase tracking-wider">
                  <th scope="col" className="py-2 pr-2">{t('sidebar.category', 'Categoria')}</th>
                  <th scope="col" className="py-2 text-right">{t('methodology.tcoMaintEv', 'Revisão EV')}</th>
                  <th scope="col" className="py-2 text-right">{t('methodology.tcoMaintComb', 'Revisão combustão')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat} className="border-t border-white/8">
                    <td className="py-2 pr-2">{t(`categories.${cat}`, cat)}</td>
                    <td className="py-2 text-right font-mono">R$ {fmt(TCO_BY_CATEGORY[cat].maintEVPerService)}</td>
                    <td className="py-2 text-right font-mono">R$ {fmt(TCO_BY_CATEGORY[cat].maintCombPerService)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section aria-labelledby="meth-route" className="mb-10 rounded-3xl border border-white/10 bg-[#111111] p-5 md:p-6">
            <h2 id="meth-route" className="text-xl font-bold mb-3 flex items-center gap-2">
              <RouteIcon className="w-5 h-5 text-[#00b4ff]" aria-hidden="true" />
              {t('methodology.routeTitle', 'Planejador de rota')}
            </h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-3">{t('methodology.routeIntro', '')}</p>
            <p className="text-sm font-mono text-[#72d7ff] bg-white/5 rounded-xl px-4 py-3 mb-3">{t('methodology.routeFormula', '')}</p>
            <p className="text-sm text-[#a0a0a0] leading-relaxed">{t('methodology.routeNote', '')}</p>
          </section>

          <section aria-labelledby="meth-specs" className="mb-10 rounded-3xl border border-white/10 bg-[#111111] p-5 md:p-6">
            <h2 id="meth-specs" className="text-xl font-bold mb-3 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#00b4ff]" aria-hidden="true" />
              {t('methodology.specsTitle', 'Ficha técnica — dimensões e peso')}
            </h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed mb-3">{t('methodology.specsIntro', '')}</p>
            <ul className="space-y-2 text-sm text-white/80 leading-relaxed">
              <li>{t('methodology.specsDimensions', '')}</li>
              <li>{t('methodology.specsWeight', '')}</li>
              <li>{t('methodology.specsTrunk', '')}</li>
              <li>{t('methodology.specsClearance', '')}</li>
            </ul>
          </section>

          <section aria-labelledby="meth-limits" className="rounded-3xl border border-white/10 bg-[#111111] p-5 md:p-6">
            <h2 id="meth-limits" className="text-xl font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#f5c842]" aria-hidden="true" />
              {t('methodology.limitsTitle', 'Limitações')}
            </h2>
            <ul className="space-y-2 text-sm text-[#a0a0a0] leading-relaxed">
              <li>{t('methodology.limitsPbev', '')}</li>
              <li>{t('methodology.limitsPrices', '')}</li>
              <li>{t('methodology.limitsTaxes', '')}</li>
              <li>{t('methodology.limitsNotAdvice', '')}</li>
            </ul>
          </section>
        </main>

        <footer className="border-t border-white/10 py-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#a0a0a0] hover:text-white transition-colors no-underline"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {t('methodology.backToCatalog', 'Voltar ao catálogo')}
          </Link>
        </footer>
      </div>
    </>
  );
}
