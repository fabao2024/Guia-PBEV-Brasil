import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Car } from '../types';
import { BRAND_URLS } from '../constants';
import { Check, ImageOff, ExternalLink, Heart, BatteryCharging, Scale, ArrowUpRight } from 'lucide-react';

interface CarCardProps {
  car: Car;
  onClick: () => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (e: React.MouseEvent) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

// Reference max range for the progress bar (longest EV in BR market ~700km)
const MAX_RANGE_KM = 700;

// Category-specific accent system — each segment gets its own color identity
const CAT_ACCENT: Record<string, { color: string; bg: string }> = {
  Luxo:      { color: '#f5c842', bg: 'rgba(245,200,66,0.07)'  },
  SUV:       { color: '#ff8c52', bg: 'rgba(255,107,43,0.07)'  },
  Compacto:  { color: '#00b4ff', bg: 'rgba(0,180,255,0.07)'   },
  Sedan:     { color: '#b87aff', bg: 'rgba(157,78,255,0.07)'  },
  Comercial: { color: '#8899aa', bg: 'rgba(136,153,170,0.07)' },
};

// Traction type visual coding
const TRACTION_STYLE: Record<string, { color: string; bg: string }> = {
  AWD: { color: '#00e5a0', bg: 'rgba(0,229,160,0.09)'   },
  RWD: { color: '#ff7070', bg: 'rgba(255,112,112,0.09)' },
  FWD: { color: '#60c8ff', bg: 'rgba(96,200,255,0.09)'  },
};

const CarCard: React.FC<CarCardProps> = ({
  car, onClick, isSelectedForCompare, onToggleCompare, isFavorite, onToggleFavorite,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isNew = (
    ['Neta', 'Geely', 'Kia', 'Chevrolet', 'Omoda', 'GAC', 'Zeekr', 'GWM'].includes(car.brand) &&
    !['Ora 03 Skin BEV48', 'Ora 03 GT BEV63'].includes(car.model)
  ) || car.model.includes('Captiva') || car.model.includes('Buzz');

  const brandUrl = BRAND_URLS[car.brand] || `https://www.google.com/search?q=${encodeURIComponent(car.brand + ' Brasil')}`;
  const rangePercent = Math.min(Math.round((car.range / MAX_RANGE_KM) * 100), 100);
  const accent = CAT_ACCENT[car.cat] ?? CAT_ACCENT['Compacto'];
  const tractionStyle = car.traction ? TRACTION_STYLE[car.traction] : null;
  const estimatedPower = car.power ?? Math.round(car.price / 3000);

  const imgSrc = car.img.startsWith('/car-images/')
    ? `${import.meta.env.BASE_URL}${car.img.substring(1)}`
    : car.img.includes('wikimedia.org')
      ? car.img
      : `https://images.weserv.nl/?url=${encodeURIComponent(car.img.replace(/^https?:\/\//, ''))}&w=800&q=80&output=webp`;

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col h-full cursor-pointer rounded-2xl overflow-hidden group transition-[box-shadow,transform] duration-300 hover:-translate-y-1"
      style={{
        background: `linear-gradient(165deg, ${accent.bg} 0%, #08090e 28%)`,
        border: `1px solid ${isSelectedForCompare ? '#00b4ff' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isSelectedForCompare
          ? '0 0 0 1px #00b4ff, 0 16px 48px rgba(0,180,255,0.18)'
          : '0 8px 40px rgba(0,0,0,0.7)',
      }}
    >
      {/* Category accent strip on left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] z-20 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${accent.color}, ${accent.color}00 65%)`,
          opacity: isSelectedForCompare ? 1 : 0.55,
        }}
      />

      {/* ── IMAGE AREA ── */}
      <div className="relative overflow-hidden min-h-[145px] sm:min-h-[195px]" style={{ background: '#09090e' }}>

        {/* Category-colored ambient glow at base of image */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-40 group-hover:opacity-65"
          style={{
            background: `radial-gradient(ellipse 60% 65% at 50% 100%, ${accent.color}22, transparent)`,
          }}
        />
        {/* Top ambient */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            background: `radial-gradient(ellipse 55% 55% at 50% -5%, ${accent.color}18, transparent)`,
          }}
        />

        {/* Loading spinner in category color */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: `${accent.color}25`, borderTopColor: `${accent.color}90` }}
            />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 px-4">
            <ImageOff className="w-7 h-7 text-white/15" />
            <span className="text-[10px] text-white/25 uppercase tracking-widest">{t('card.unavailable')}</span>
          </div>
        )}

        {/* Car image — scales up on hover via group */}
        {!hasError && (
          <img
            src={imgSrc}
            alt={car.model}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => { setHasError(true); setIsLoading(false); }}
            className={`relative z-10 w-full object-contain px-4 pt-8 pb-2 max-h-[155px] sm:max-h-[205px] transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.04] ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          />
        )}

        {/* Action buttons — top left cluster */}
        <div className="absolute top-3 left-3 z-30 flex gap-1.5">
          <button
            onClick={onToggleCompare}
            className="p-1.5 rounded-lg border backdrop-blur-sm transition-all"
            style={isSelectedForCompare
              ? { background: '#00b4ff', borderColor: '#00b4ff', color: '#000' }
              : { background: 'rgba(5,5,12,0.55)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }
            }
            title={isSelectedForCompare ? t('card.removeCompare') : t('card.compare')}
          >
            {isSelectedForCompare ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
          </button>
          <a
            href={brandUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-1.5 rounded-lg border backdrop-blur-sm transition-all"
            style={{ background: 'rgba(5,5,12,0.55)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}
            title={t('card.officialSite', { brand: car.brand })}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Favorite — top right */}
        <button
          onClick={onToggleFavorite}
          className="absolute top-3 right-3 z-30 p-1.5 rounded-lg border backdrop-blur-sm transition-all"
          style={isFavorite
            ? { background: 'rgba(5,5,12,0.6)', borderColor: 'rgba(239,68,68,0.5)', color: '#ef4444' }
            : { background: 'rgba(5,5,12,0.55)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }
          }
          title={isFavorite ? t('card.removeFavorite') : t('card.addFavorite')}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* NEW badge — positioned left of the favorite button */}
        {isNew && (
          <span
            className="absolute top-3 z-30 text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-widest"
            style={{
              right: '2.85rem',
              background: 'rgba(0,180,255,0.14)',
              color: '#00b4ff',
              border: '1px solid rgba(0,180,255,0.28)',
            }}
          >
            {t('card.newBadge', 'Novo')}
          </span>
        )}

        {/* Soft fade at the image-to-content transition */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #08090e)' }}
        />
      </div>

      {/* ── DATA SECTION ── */}
      <div className="flex-1 flex flex-col px-3 sm:px-4 pt-2 sm:pt-3 pb-3 sm:pb-4 gap-2 sm:gap-3">

        {/* Brand name + category pill */}
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: accent.color }}
          >
            {car.brand}
          </span>
          <span
            className="text-[8px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.08em]"
            style={{ background: accent.bg, color: accent.color, border: `1px solid ${accent.color}28` }}
          >
            {t(`categories.${car.cat}`)}
          </span>
        </div>

        {/* Model name */}
        <h2 className="text-[0.95rem] sm:text-[1.08rem] font-black text-white leading-tight tracking-tight -mt-1">
          {car.model}
        </h2>

        {/* Thin separator */}
        <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

        {/* Range bar — central visual data element */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-[9px] uppercase tracking-widest font-medium flex items-center gap-1"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <BatteryCharging className="w-3 h-3" />
              {t('card.rangeLabel', 'Autonomia')}
            </span>
            <span className="text-sm font-black text-white leading-none">
              {car.range}
              <span className="text-[9px] font-normal ml-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>km</span>
            </span>
          </div>
          {/* Filled progress bar */}
          <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${rangePercent}%`,
                background: `linear-gradient(90deg, ${accent.color}55, ${accent.color})`,
              }}
            />
          </div>
        </div>

        {/* Power + Traction chips */}
        <div className="flex gap-2">
          <div
            className={`${tractionStyle ? 'flex-1' : 'w-full'} rounded-xl px-3 py-2`}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="text-[8px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {t('details.power', 'Potência')}
            </div>
            <div className="text-sm font-black text-white leading-none">
              {estimatedPower}
              <span className="text-[9px] font-normal ml-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>cv</span>
            </div>
          </div>
          {tractionStyle && (
            <div
              className="rounded-xl px-3 py-2"
              style={{ background: tractionStyle.bg, border: `1px solid ${tractionStyle.color}22` }}
            >
              <div className="text-[8px] uppercase tracking-widest mb-0.5" style={{ color: `${tractionStyle.color}65` }}>
                {t('card.traction')}
              </div>
              <div className="text-sm font-black leading-none" style={{ color: tractionStyle.color }}>
                {car.traction}
              </div>
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-end gap-3 pt-0.5">
          <div className="flex-1 min-w-0">
            <div className="text-[8px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
              {t('comparison.price', 'Preço')}
            </div>
            <div
              className="text-[1rem] font-black tracking-tight leading-none truncate"
              style={{ color: '#00b4ff' }}
            >
              R$&nbsp;{car.price.toLocaleString('pt-BR')}
            </div>
          </div>
          <button
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-white transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #006ce5, #00b4ff)',
              boxShadow: '0 4px 16px rgba(0,180,255,0.28)',
            }}
          >
            <span>{t('card.buyBtn')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inset glow when selected for comparison */}
      {isSelectedForCompare && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ boxShadow: 'inset 0 0 40px rgba(0,180,255,0.05)' }}
        />
      )}
    </div>
  );
};

export default CarCard;
