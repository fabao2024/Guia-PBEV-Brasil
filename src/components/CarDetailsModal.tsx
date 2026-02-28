import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Car } from '../types';
import { BRAND_URLS } from '../constants';
import { X, BatteryCharging, Zap, CheckCircle2, ChevronLeft, ChevronRight, Image as ImageIcon, Scale, Check, Heart, ArrowUpRight } from 'lucide-react';

interface CarDetailsModalProps {
    car: Car;
    onClose: () => void;
    isSelectedForCompare: boolean;
    onToggleCompare: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

const MAX_RANGE_KM = 700;

const CAT_ACCENT: Record<string, { color: string; bg: string }> = {
    Luxo:      { color: '#f5c842', bg: 'rgba(245,200,66,0.07)'  },
    SUV:       { color: '#ff8c52', bg: 'rgba(255,107,43,0.07)'  },
    Compacto:  { color: '#00b4ff', bg: 'rgba(0,180,255,0.07)'   },
    Sedan:     { color: '#b87aff', bg: 'rgba(157,78,255,0.07)'  },
    Comercial: { color: '#8899aa', bg: 'rgba(136,153,170,0.07)' },
};

const TRACTION_STYLE: Record<string, { color: string; bg: string }> = {
    AWD: { color: '#00e5a0', bg: 'rgba(0,229,160,0.09)'   },
    RWD: { color: '#ff7070', bg: 'rgba(255,112,112,0.09)' },
    FWD: { color: '#60c8ff', bg: 'rgba(96,200,255,0.09)'  },
};

export default function CarDetailsModal({ car, onClose, isSelectedForCompare, onToggleCompare, isFavorite, onToggleFavorite }: CarDetailsModalProps) {
    const { t } = useTranslation();

    const gallery = [
        car.img.startsWith('/car-images/')
            ? `${import.meta.env.BASE_URL}${car.img.substring(1)}`
            : car.img.includes('wikimedia.org')
                ? car.img
                : `https://images.weserv.nl/?url=${encodeURIComponent(car.img.replace(/^https?:\/\//, ''))}&w=800&q=80&output=webp`,
    ];

    const [currentIdx, setCurrentIdx] = useState(0);
    const [isImgLoading, setIsImgLoading] = useState(true);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const fallbackImg = `https://placehold.co/600x400/09090e/1c1e26?text=${t('details.imageUnavailable')}`;

    const nextImage = useCallback(() => setCurrentIdx(p => (p + 1) % gallery.length), [gallery.length]);
    const prevImage = useCallback(() => setCurrentIdx(p => (p - 1 + gallery.length) % gallery.length), [gallery.length]);

    useEffect(() => { setIsImgLoading(true); }, [currentIdx]);

    useEffect(() => {
        const handle = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [onClose, nextImage, prevImage]);

    const handleImageError = (idx: number) => {
        setFailedImages(prev => { const s = new Set(prev); s.add(idx); return s; });
    };

    const getFeatures = (car: Car): string[] => {
        if (car.features && car.features.length > 0) {
            return car.features.map(key => t(`featureLabels.${key}`));
        }
        const catKey = car.cat === 'Compacto' ? 'compact' : car.cat === 'SUV' ? 'suv' : car.cat === 'Luxo' ? 'luxury' : car.cat === 'Comercial' ? 'commercial' : 'default';
        return t(`details.features.${catKey}`, { returnObjects: true }) as string[];
    };

    const features = getFeatures(car);
    const activeImageSrc = failedImages.has(currentIdx) ? fallbackImg : gallery[currentIdx];
    const brandUrl = BRAND_URLS[car.brand] || `https://www.google.com/search?q=${encodeURIComponent(car.brand + ' ' + car.model + ' comprar')}`;

    const accent = CAT_ACCENT[car.cat] ?? CAT_ACCENT['Compacto'];
    const tractionStyle = car.traction ? TRACTION_STYLE[car.traction] : null;
    const estimatedPower = car.power ?? Math.round(car.price / 3000);
    const rangePercent = Math.min(Math.round((car.range / MAX_RANGE_KM) * 100), 100);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div
                className="w-full max-w-5xl max-h-[90vh] relative z-10 flex flex-col md:flex-row overflow-hidden rounded-3xl"
                style={{
                    background: '#08090e',
                    border: `1px solid ${accent.color}22`,
                    boxShadow: `0 0 60px ${accent.color}18, 0 32px 80px rgba(0,0,0,0.85)`,
                }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 p-2 rounded-full transition-all backdrop-blur-sm hover:brightness-125"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* ── LEFT: IMAGE PANEL ── */}
                <div
                    className="w-full md:w-1/2 relative select-none flex flex-col justify-center"
                    style={{
                        minHeight: 300,
                        background: `linear-gradient(165deg, ${accent.bg} 0%, #09090e 35%)`,
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                    }}
                >
                    {/* Category accent strip on left edge */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-[2px] z-10 pointer-events-none"
                        style={{ background: `linear-gradient(to bottom, ${accent.color}, ${accent.color}00 60%)` }}
                    />

                    {/* Ambient glows */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse 65% 65% at 50% 100%, ${accent.color}1e, transparent)` }}
                    />
                    <div
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{ background: `radial-gradient(ellipse 50% 50% at 50% 0%, ${accent.color}18, transparent)` }}
                    />

                    {/* Loading */}
                    {isImgLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                            <div
                                className="w-10 h-10 rounded-full border-2 animate-spin"
                                style={{ borderColor: `${accent.color}25`, borderTopColor: `${accent.color}90` }}
                            />
                        </div>
                    )}

                    {/* Image */}
                    <div className="relative z-10 w-full flex items-center justify-center px-8 py-10">
                        <img
                            key={activeImageSrc}
                            src={activeImageSrc}
                            alt={`${car.model} view ${currentIdx + 1}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onLoad={() => setIsImgLoading(false)}
                            onError={() => handleImageError(currentIdx)}
                            className={`w-full max-w-lg object-contain drop-shadow-2xl transition-opacity duration-500 ${isImgLoading ? 'opacity-0' : 'opacity-100'}`}
                        />
                    </div>

                    {/* Fade to bg at bottom */}
                    <div
                        className="absolute inset-x-0 bottom-0 h-16 pointer-events-none z-20"
                        style={{ background: 'linear-gradient(to bottom, transparent, #08090e)' }}
                    />

                    {/* Gallery nav */}
                    {gallery.length > 1 && (
                        <>
                            <button
                                onClick={e => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                                style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                                style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                                {gallery.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={e => { e.stopPropagation(); setCurrentIdx(idx); }}
                                        className="h-1.5 rounded-full transition-all"
                                        style={{
                                            width: idx === currentIdx ? 32 : 8,
                                            background: idx === currentIdx ? accent.color : 'rgba(255,255,255,0.3)',
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {gallery.length > 1 && (
                        <div
                            className="absolute top-4 left-6 z-30 flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full pointer-events-none"
                            style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${accent.color}25`, color: accent.color }}
                        >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{t('details.exteriorMain')}</span>
                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                            <span className="text-white">{currentIdx + 1}/{gallery.length}</span>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: DETAILS PANEL ── */}
                <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 overflow-y-auto custom-scrollbar-dark">

                    {/* Category + brand + favorite badge */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                            className="text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest"
                            style={{ background: accent.bg, color: accent.color, border: `1px solid ${accent.color}28` }}
                        >
                            {t(`categories.${car.cat}`)}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent.color }}>
                            {car.brand}
                        </span>
                        {isFavorite && (
                            <span
                                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                            >
                                <Heart className="w-3 h-3 fill-current" /> {t('details.favorite')}
                            </span>
                        )}
                    </div>

                    {/* Model name */}
                    <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-5">
                        {car.model}
                    </h2>

                    {/* Divider */}
                    <div className="h-px w-full mb-5" style={{ background: 'rgba(255,255,255,0.06)' }} />

                    {/* Range bar */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <span
                                className="text-[9px] uppercase tracking-widest font-medium flex items-center gap-1.5"
                                style={{ color: 'rgba(255,255,255,0.3)' }}
                            >
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

                    {/* Power + Traction + Torque chips */}
                    <div className="flex gap-3 mb-5">
                        <div
                            className={`${tractionStyle || car.torque ? 'flex-1' : 'w-full'} rounded-xl px-4 py-3`}
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                                {t('details.power', 'Potência')}
                            </div>
                            <div className="text-xl font-black text-white leading-none">
                                {estimatedPower}
                                <span className="text-sm font-normal ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>cv</span>
                            </div>
                        </div>
                        {tractionStyle && (
                            <div
                                className="rounded-xl px-4 py-3"
                                style={{ background: tractionStyle.bg, border: `1px solid ${tractionStyle.color}22` }}
                            >
                                <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: `${tractionStyle.color}65` }}>
                                    {t('card.traction', 'Tração')}
                                </div>
                                <div className="text-xl font-black leading-none" style={{ color: tractionStyle.color }}>
                                    {car.traction}
                                </div>
                            </div>
                        )}
                        {car.torque && (
                            <div
                                className="rounded-xl px-4 py-3"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
                                    {t('details.torque', 'Torque')}
                                </div>
                                <div className="text-xl font-black text-white leading-none">
                                    {car.torque}
                                    <span className="text-sm font-normal ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>kgfm</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full mb-5" style={{ background: 'rgba(255,255,255,0.06)' }} />

                    {/* Features list */}
                    <div className="flex-1 mb-6">
                        <h3
                            className="text-[9px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
                            style={{ color: accent.color }}
                        >
                            <Zap className="w-3.5 h-3.5" />
                            {t('details.segmentHighlights')}
                        </h3>
                        <ul className="space-y-2">
                            {features.map((feature, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-start gap-3 text-sm text-white/60 py-2.5 px-3 rounded-xl transition-colors hover:text-white/80"
                                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <CheckCircle2
                                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                                        style={{ color: accent.color }}
                                    />
                                    <span className="leading-relaxed">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Price + Actions */}
                    <div className="flex flex-col gap-3 mt-auto">
                        {/* Price plate */}
                        <div
                            className="flex items-center justify-between px-5 py-4 rounded-2xl relative overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent.color}25` }}
                        >
                            <div
                                className="absolute inset-0 pointer-events-none opacity-30"
                                style={{ background: `radial-gradient(ellipse 60% 80% at 0% 50%, ${accent.color}12, transparent)` }}
                            />
                            <span className="text-[9px] font-bold uppercase tracking-widest relative z-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                {t('details.estimatedPrice')}
                            </span>
                            <span className="text-2xl font-black tracking-tight relative z-10" style={{ color: '#00b4ff' }}>
                                R$ {car.price.toLocaleString('pt-BR')}
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2.5">
                            <button
                                onClick={onToggleCompare}
                                className="flex-[1.5] py-3.5 rounded-2xl transition-all font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2"
                                style={isSelectedForCompare
                                    ? { background: `${accent.color}15`, border: `1px solid ${accent.color}50`, color: accent.color }
                                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }
                                }
                            >
                                {isSelectedForCompare ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                                {isSelectedForCompare ? t('details.comparing') : t('details.compare')}
                            </button>

                            <button
                                onClick={onToggleFavorite}
                                className="py-3.5 px-4 rounded-2xl transition-all font-bold flex items-center justify-center"
                                style={isFavorite
                                    ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }
                                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                                }
                                title={isFavorite ? t('details.removeFavorite') : t('details.addFavorite')}
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>

                            <a
                                href={brandUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-[2] text-white font-black uppercase tracking-wider text-xs py-3.5 rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2 no-underline"
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
            </div>
        </div>
    );
}
