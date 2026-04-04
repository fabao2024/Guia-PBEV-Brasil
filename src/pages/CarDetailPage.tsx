import { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { CAR_DB, BRAND_URLS, INSURANCE_AFFILIATE_URL } from '../constants';
import { findCarBySlug, toSlug } from '../utils/slug';
import { useJsonLd } from '../hooks/useJsonLd';
import {
  BatteryCharging, Zap, CheckCircle2, ArrowLeft, ArrowUpRight,
  Scale, Heart, Share2, ChevronDown, Award, Shield
} from 'lucide-react';
import { IPVA_BY_STATE, calcIpva, IPVA_DATA_UPDATED } from '../constants/ipvaByState';
import { getPriceDelta, getLastSnapshot } from '../constants/priceHistory';
import { track } from '../utils/analytics';

const MAX_RANGE_KM = 700;

const CAT_ACCENT: Record<string, { color: string; bg: string }> = {
  Luxo:      { color: '#f5c842', bg: 'rgba(245,200,66,0.07)'  },
  SUV:       { color: '#ff8c52', bg: 'rgba(255,107,43,0.07)'  },
  Compacto:  { color: '#00b4ff', bg: 'rgba(0,180,255,0.07)'   },
  Sedan:     { color: '#b87aff', bg: 'rgba(157,78,255,0.07)'  },
  Comercial: { color: '#8899aa', bg: 'rgba(136,153,170,0.07)' },
  Urbano:    { color: '#00e5a0', bg: 'rgba(0,229,160,0.07)'   },
};

const TRACTION_STYLE: Record<string, { color: string; bg: string }> = {
  AWD: { color: '#00e5a0', bg: 'rgba(0,229,160,0.09)'   },
  RWD: { color: '#ff7070', bg: 'rgba(255,112,112,0.09)' },
  FWD: { color: '#60c8ff', bg: 'rgba(96,200,255,0.09)'  },
};

const TRACTION_TITLE: Record<string, string> = {
  AWD: 'Tração integral (4x4)',
  RWD: 'Tração traseira',
  FWD: 'Tração dianteira',
};

const PBE_COLORS: Record<string, string> = {
  A: '#00a651', B: '#8dc63f', C: '#f9e400', D: '#f7941e', E: '#ed1c24',
};

function calcChargeTime(battery: number, chargeAC?: number, chargeDC?: number | null) {
  let acLabel = '';
  let dcLabel = '';
  if (chargeAC) {
    const totalHours = battery / chargeAC / 0.88;
    const h = Math.floor(totalHours);
    const rawMin = (totalHours - h) * 60;
    const m = Math.round(rawMin / 15) * 15;
    if (m === 60) acLabel = `~${h + 1}h`;
    else if (m === 0) acLabel = `~${h}h`;
    else acLabel = `~${h}h${m}`;
  }
  if (chargeDC) {
    const rawMin = (battery * 0.7 / chargeDC / 0.65) * 60;
    const rounded = Math.max(5, Math.round(rawMin / 5) * 5);
    dcLabel = `~${rounded}min`;
  }
  return { acLabel, dcLabel };
}

export default function CarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const car = useMemo(() => slug ? findCarBySlug(slug, CAR_DB) : undefined, [slug]);

  const [selectedState, setSelectedState] = useState<string>(
    () => (typeof window !== 'undefined' ? localStorage.getItem('selectedState') : null) ?? 'SP'
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedState', selectedState);
    }
  }, [selectedState]);

  // Track page view
  useEffect(() => {
    if (car) {
      track('Car Details Open', { model: car.model, brand: car.brand, category: car.cat });
    }
  }, [car]);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const canonicalUrl = car ? `https://guiapbev.cloud/carro/${toSlug(car.brand, car.model)}` : 'https://guiapbev.cloud/';

  const similarCars = useMemo(() => {
    if (!car) return [];
    return CAR_DB
      .filter(c => c.cat === car.cat && toSlug(c.brand, c.model) !== slug)
      .sort((a, b) => Math.abs(a.price - car.price) - Math.abs(b.price - car.price))
      .slice(0, 4);
  }, [car, slug]);

  const imgSrc = car
    ? car.img.startsWith('/car-images/')
      ? `${import.meta.env.BASE_URL}${car.img.substring(1)}`
      : car.img.includes('wikimedia.org')
        ? car.img
        : `https://images.weserv.nl/?url=${encodeURIComponent(car.img.replace(/^https?:\/\//, ''))}&w=800&q=80&output=webp`
    : '';

  const productSchema = useMemo(() => {
    if (!car) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${car.brand} ${car.model}`,
      description: `Carro elétrico ${car.brand} ${car.model} — Autonomia PBEV: ${car.range} km | Categoria: ${car.cat} | Preço estimado: R$ ${car.price.toLocaleString('pt-BR')}`,
      brand: { '@type': 'Brand', name: car.brand },
      image: imgSrc,
      url: canonicalUrl,
      offers: {
        '@type': 'Offer',
        price: car.price,
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        priceValidUntil: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
      },
      ...(car.power && {
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Potência', value: `${car.power} cv`, unitCode: 'HWP' },
          { '@type': 'PropertyValue', name: 'Autonomia PBEV', value: `${car.range} km`, unitCode: 'KMT' },
          ...(car.battery ? [{ '@type': 'PropertyValue', name: 'Bateria', value: `${car.battery} kWh` }] : []),
          ...(car.traction ? [{ '@type': 'PropertyValue', name: 'Tração', value: car.traction }] : []),
        ],
      }),
    };
  }, [car, imgSrc, canonicalUrl]);
  useJsonLd(productSchema);

  // ── 404: car not found ──
  if (!car) {
    return (
      <div className="text-white min-h-screen flex flex-col items-center justify-center bg-black font-sans p-8">
        <Helmet>
          <title>Veículo não encontrado | Guia PBEV Brasil</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Zap className="w-16 h-16 text-[#00b4ff]/30 mb-6" />
        <h1 className="text-3xl font-black mb-3">Veículo não encontrado</h1>
        <p className="text-[#a0a0a0] mb-8">O modelo que você procura não está no catálogo.</p>
        <Link
          to="/"
          className="bg-[#00b4ff] text-black font-black px-6 py-3 rounded-xl hover:bg-[#33c9ff] transition-all no-underline uppercase tracking-wider text-sm"
        >
          ← Voltar ao catálogo
        </Link>
      </div>
    );
  }

  // ── Car data ──
  const accent = CAT_ACCENT[car.cat] ?? CAT_ACCENT['Compacto'];
  const tractionStyle = car.traction ? TRACTION_STYLE[car.traction] : null;
  const estimatedPower = car.power ?? Math.round(car.price / 3000);
  const rangePercent = Math.min(Math.round((car.range / MAX_RANGE_KM) * 100), 100);
  const ipvaInfo = IPVA_BY_STATE.find(s => s.abbr === selectedState) ?? IPVA_BY_STATE.find(s => s.abbr === 'SP')!;
  const priceDelta = getPriceDelta(car.model, car.price);
  const lastSnapshot = getLastSnapshot(car.model);
  const annualIpva = calcIpva(car.price, ipvaInfo);
  const combustionIpva = Math.round(car.price * ipvaInfo.standardRate);
  const ipvaSavings = combustionIpva - annualIpva;

  const getFallbackFeatures = (cat: string): string[] => {
    const key = cat === 'Compacto' ? 'compact' : cat === 'SUV' ? 'suv' : cat === 'Luxo' ? 'luxury' : cat === 'Comercial' ? 'commercial' : 'default';
    return t(`details.features.${key}`, { returnObjects: true }) as string[];
  };
  const features = (car.features && car.features.length > 0) ? car.features : getFallbackFeatures(car.cat);

  const brandUrlBase = car.url ?? BRAND_URLS[car.brand] ?? `https://www.google.com/search?q=${encodeURIComponent(car.brand + ' ' + car.model + ' comprar')}`;
  const utmParams = `utm_source=guiapbev&utm_medium=referral&utm_campaign=lead&utm_content=${encodeURIComponent(car.model.toLowerCase().replace(/\s+/g, '-'))}`;
  const brandUrl = `${brandUrlBase}${brandUrlBase.includes('?') ? '&' : '?'}${utmParams}`;

  const handleShare = async () => {
    const price = car.price.toLocaleString('pt-BR');
    const payload = {
      title: `${car.brand} ${car.model}`,
      text: `${car.brand} ${car.model} – R$ ${price} – ${car.range}km PBEV | Guia PBEV Brasil`,
      url: canonicalUrl,
    };
    if (navigator.share) {
      try { await navigator.share(payload); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    }
  };

  const helmetTitle = `${car.brand} ${car.model} — R$ ${car.price.toLocaleString('pt-BR')} | ${car.range} km PBEV | Guia PBEV Brasil`;
  const helmetDesc = `${car.brand} ${car.model}: autonomia PBEV ${car.range} km, ${car.cat.toLowerCase()} elétrico${car.power ? `, ${car.power} cv` : ''}${car.battery ? `, bateria ${car.battery} kWh` : ''}. Preço estimado R$ ${car.price.toLocaleString('pt-BR')}. Compare com outros elétricos no Guia PBEV Brasil.`;
  const helmetImage = car.img.startsWith('/car-images/')
    ? `https://guiapbev.cloud${car.img}`
    : imgSrc;

  return (
    <>
      <Helmet>
        <title>{helmetTitle}</title>
        <meta name="description" content={helmetDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={helmetTitle} />
        <meta property="og:description" content={helmetDesc} />
        <meta property="og:image" content={helmetImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={helmetTitle} />
        <meta name="twitter:description" content={helmetDesc} />
        <meta name="twitter:image" content={helmetImage} />
      </Helmet>

      <div className="text-white min-h-screen bg-black font-sans relative selection:bg-[#00b4ff] selection:text-black">
        {/* Background ambient light */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] pointer-events-none opacity-30"
          style={{ background: accent.color }}
        />

        {/* Top navigation bar */}
        <nav className="bg-[#0a0b12]/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-3 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-[#a0a0a0] hover:text-white transition-colors no-underline text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.backToCatalog', 'Voltar ao catálogo')}</span>
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

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Hero: Image + basic info */}
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            {/* Image */}
            <div
              className="w-full md:w-1/2 rounded-3xl overflow-hidden relative flex items-center justify-center min-h-[280px]"
              style={{
                background: `linear-gradient(165deg, ${accent.bg} 0%, #09090e 35%)`,
                border: `1px solid ${accent.color}15`,
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px] pointer-events-none"
                style={{ background: `linear-gradient(to bottom, ${accent.color}, ${accent.color}00 60%)` }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse 65% 65% at 50% 100%, ${accent.color}1e, transparent)` }}
              />
              <img
                src={imgSrc}
                alt={`${car.brand} ${car.model}`}
                loading="eager"
                referrerPolicy="no-referrer"
                className="relative z-10 w-full max-w-md object-contain drop-shadow-2xl p-6"
              />
            </div>

            {/* Key info */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              {/* Category + brand badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest"
                  style={{ background: accent.bg, color: accent.color, border: `1px solid ${accent.color}28` }}
                >
                  {t(`categories.${car.cat}`)}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent.color }}>
                  {car.brand}
                </span>
                {car.discontinued && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-400/25">
                    Fora de linha
                  </span>
                )}
              </div>

              {/* Model name */}
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-5">
                {car.model}
              </h1>

              {/* Range bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest font-medium flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <BatteryCharging className="w-3.5 h-3.5" />
                    {t('card.rangeLabel', 'Autonomia')} PBEV
                  </span>
                  <span className="text-lg font-black text-white leading-none">
                    {car.range}
                    <span className="text-xs font-normal ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>km</span>
                  </span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${rangePercent}%`, background: `linear-gradient(90deg, ${accent.color}55, ${accent.color})` }}
                  />
                </div>
              </div>

              {/* Price plate */}
              <div
                className="flex items-center justify-between px-5 py-4 rounded-2xl relative overflow-hidden mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent.color}25` }}
              >
                <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: `radial-gradient(ellipse 60% 80% at 0% 50%, ${accent.color}12, transparent)` }} />
                <span className="text-[10px] font-bold uppercase tracking-widest relative z-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {t('details.estimatedPrice')}
                </span>
                <span className="text-2xl font-black tracking-tight relative z-10" style={{ color: '#00b4ff' }}>
                  R$ {car.price.toLocaleString('pt-BR')}
                </span>
                {priceDelta !== null && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full relative z-10 self-start"
                    style={priceDelta < 0
                      ? { background: 'rgba(0,229,160,0.12)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.28)' }
                      : { background: 'rgba(255,140,82,0.12)', color: '#ff8c52', border: '1px solid rgba(255,140,82,0.28)' }
                    }
                    title={`Desde ${lastSnapshot?.date ?? '—'}`}
                  >
                    {priceDelta < 0 ? '↓' : '↑'} R$ {Math.abs(priceDelta).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-2xl transition-all font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? t('card.shareCopied') : t('card.share')}
                </button>
                <a
                  href={brandUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('Lead Click', { model: car.model, brand: car.brand })}
                  className="flex-[2] text-white font-black tracking-normal text-xs py-3 rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-1.5 no-underline whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(135deg, #006ce5, #00b4ff)',
                    boxShadow: '0 4px 16px rgba(0,180,255,0.3)',
                  }}
                >
                  <span>{t('card.buyBtn')}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full mb-8" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Specs grid */}
          <section className="mb-8">
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: accent.color }}>
              <Zap className="w-3.5 h-3.5" />
              {t('details.specs', 'Especificações')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {t('details.power', 'Potência')}
                </div>
                <div className="text-xl font-black text-white leading-none">
                  {estimatedPower}<span className="text-sm font-normal ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>cv</span>
                </div>
              </div>
              {tractionStyle && (
                <div
                  className="rounded-xl px-4 py-3"
                  title={TRACTION_TITLE[car.traction ?? '']}
                  style={{ background: tractionStyle.bg, border: `1px solid ${tractionStyle.color}22` }}
                >
                  <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: `${tractionStyle.color}65` }}>
                    {t('card.traction', 'Tração')}
                  </div>
                  <div className="text-xl font-black leading-none" style={{ color: tractionStyle.color }}>
                    {car.traction}
                  </div>
                </div>
              )}
              {car.torque && (
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {t('details.torque', 'Torque')}
                  </div>
                  <div className="text-xl font-black text-white leading-none">
                    {car.torque}<span className="text-sm font-normal ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>kgfm</span>
                  </div>
                </div>
              )}
              {car.battery && (
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {t('details.battery', 'Bateria')}
                  </div>
                  <div className="text-xl font-black text-white leading-none">
                    {car.battery}<span className="text-sm font-normal ml-1" title="Quilowatt-hora — unidade de energia da bateria" style={{ color: 'rgba(255,255,255,0.35)' }}>kWh</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Warranty & Charging */}
          {(car.warrantyYears || car.chargeAC || car.chargeDC !== undefined) && (() => {
            const { acLabel, dcLabel } = car.battery
              ? calcChargeTime(car.battery, car.chargeAC, car.chargeDC)
              : { acLabel: '', dcLabel: '' };
            return (
              <section className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {car.warrantyYears && (
                    <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                        {t('details.warrantyVehicle')}
                      </div>
                      <div className="text-xl font-black text-white leading-none">
                        {car.warrantyYears}
                        <span className="text-sm font-normal ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('details.years')}</span>
                        {car.warrantyBatteryYears && (
                          <span className="block text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            {t('details.warrantyBattery')}: {car.warrantyBatteryYears} {t('details.years')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {(car.chargeAC || car.chargeDC !== undefined) && (
                    <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                        {t('details.charging', 'Carregamento')}
                      </div>
                      {car.chargeAC && (
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-sm font-black text-white">
                            AC <span style={{ color: 'rgba(255,255,255,0.5)' }}>{car.chargeAC} kW</span>
                          </span>
                          {acLabel && <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.38)' }}>{acLabel}</span>}
                        </div>
                      )}
                      {car.chargeDC === null
                        ? <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('details.noFastCharge')}</div>
                        : car.chargeDC && (
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-black" style={{ color: '#00b4ff' }}>
                              DC <span style={{ color: 'rgba(0,180,255,0.65)' }}>{car.chargeDC} kW</span>
                            </span>
                            {dcLabel && <span className="text-xs font-semibold" style={{ color: 'rgba(0,180,255,0.55)' }}>{dcLabel}</span>}
                          </div>
                        )
                      }
                      {(acLabel || dcLabel) && (
                        <div className="text-[9px] mt-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                          {t('details.chargeTimeNote', 'AC 0→100% · DC 10→80% (estimativa)')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* Divider */}
          <div className="h-px w-full mb-8" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* PBE Certification */}
          {car.pbeRating && (
            <section className="mb-8">
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: accent.color }}>
                <Award className="w-3.5 h-3.5" />
                {t('pbe.title')}
              </h2>
              <div className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
                  style={{ background: PBE_COLORS[car.pbeRating] ?? '#666' }}
                >
                  {car.pbeRating}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-white">{t('pbe.rating')}: {car.pbeRating}</span>
                  {car.energyMJkm && (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {t('pbe.energy')}: <strong className="text-white">{car.energyMJkm} {t('pbe.energyUnit')}</strong>
                    </span>
                  )}
                  {car.conpetSeal !== undefined && (
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {t('pbe.conpet')}: <strong style={{ color: car.conpetSeal ? '#00e5a0' : 'rgba(255,255,255,0.4)' }}>
                        {car.conpetSeal ? t('pbe.conpetYes') : t('pbe.conpetNo')}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* IPVA 2026 */}
          <section className="mb-8">
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: accent.color }}>
              {t('ipva.title')}
            </h2>
            <div className="relative mb-2">
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="w-full appearance-none text-sm font-medium rounded-xl px-4 py-2.5 pr-8 focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
              >
                {IPVA_BY_STATE.map(s => (
                  <option key={s.abbr} value={s.abbr} style={{ background: '#1c1e26' }}>
                    {s.abbr} — {s.name} · {s.bevRate === 0 ? 'Isento' : `${(s.bevRate * 100).toFixed(1)}%`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {t('ipva.annualIpva')}
                </div>
                <div className="text-xl font-black" style={{ color: annualIpva === 0 ? '#00e5a0' : 'white' }}>
                  {annualIpva === 0 ? t('ipva.exempt') : `R$ ${annualIpva.toLocaleString('pt-BR')}`}
                </div>
                {ipvaSavings > 0 && (
                  <div className="text-xs mt-0.5" style={{ color: '#00e5a0' }}>
                    ↓ R$ {ipvaSavings.toLocaleString('pt-BR')} {t('ipva.savingsVsCombustion')}
                  </div>
                )}
              </div>
              <div className="text-right" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <div className="text-xs">{t('ipva.bevRate')} {(ipvaInfo.bevRate * 100).toFixed(1)}%</div>
                {ipvaInfo.condition && (
                  <div className="text-xs mt-1 max-w-[130px] leading-tight" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {ipvaInfo.condition}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs mt-2 text-right" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {'⚠'} Dados de {IPVA_DATA_UPDATED}. Consulte a Sefaz do seu estado.
            </p>
          </section>

          {/* Divider */}
          <div className="h-px w-full mb-8" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Features list */}
          <section className="mb-10">
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: accent.color }}>
              <Zap className="w-3.5 h-3.5" />
              {t('details.featuresTitle', 'Equipamentos & Tecnologia')}
            </h2>
            <ul className="space-y-2">
              {features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-white/60 py-2.5 px-3 rounded-xl transition-colors hover:text-white/80"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accent.color }} />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Bottom CTAs */}
          <div className="flex flex-col gap-3 mb-10">
            <a
              href={brandUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('Lead Click', { model: car.model, brand: car.brand })}
              className="w-full text-white font-black tracking-normal text-sm py-4 rounded-2xl transition-all hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2 no-underline"
              style={{
                background: 'linear-gradient(135deg, #006ce5, #00b4ff)',
                boxShadow: '0 4px 16px rgba(0,180,255,0.3)',
              }}
            >
              {t('card.buyBtn')} <ArrowUpRight className="w-5 h-5" />
            </a>
            <a
              href={`${INSURANCE_AFFILIATE_URL}?utm_source=guiapbev&utm_medium=referral&utm_campaign=insurance&utm_content=${encodeURIComponent(car.model.toLowerCase().replace(/\s+/g, '-'))}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('Insurance Quote Click', { model: car.model, brand: car.brand })}
              className="w-full py-3.5 rounded-2xl transition-all font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 no-underline hover:brightness-110"
              style={{
                background: 'rgba(0,229,160,0.07)',
                border: '1px solid rgba(0,229,160,0.25)',
                color: '#00e5a0',
              }}
            >
              <Shield className="w-4 h-4" />
              {t('details.insuranceBtn')} <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>
            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              ℹ️ {t('details.notASeller')}
            </p>
          </div>

          {/* Compare with similar */}
          {similarCars.length > 0 && (
            <div className="mb-8">
              <h2 className="text-white/40 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <Scale className="w-3.5 h-3.5" /> Compare com similares
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {similarCars.map(similar => (
                  <Link
                    key={toSlug(similar.brand, similar.model)}
                    to={`/comparar/${slug}/${toSlug(similar.brand, similar.model)}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8 hover:border-[#00b4ff]/30 hover:bg-[#00b4ff]/5 transition-all group"
                  >
                    <img
                      src={similar.img.startsWith('/car-images/')
                        ? `${import.meta.env.BASE_URL}${similar.img.substring(1)}`
                        : `https://images.weserv.nl/?url=${encodeURIComponent(similar.img.replace(/^https?:\/\//, ''))}&w=200&q=70&output=webp`}
                      alt={`${similar.brand} ${similar.model}`}
                      className="w-14 h-10 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate group-hover:text-[#00b4ff] transition-colors">
                        {similar.brand} {similar.model}
                      </p>
                      <p className="text-white/40 text-[11px]">{similar.range} km · R$ {(similar.price / 1000).toFixed(0)}k</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to catalog */}
          <div className="text-center pb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#00b4ff] hover:text-white transition-colors no-underline text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('nav.backToCatalog', 'Voltar ao catálogo')}
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
