
import React, { useEffect, useState, useCallback } from 'react';
import { Car } from '../types';
import { BRAND_URLS } from '../constants';
import { X, Map, Car as CarIcon, Battery, Zap, CheckCircle2, DollarSign, ChevronLeft, ChevronRight, Image as ImageIcon, Scale, Check, Loader2, Heart, Gauge, Activity } from 'lucide-react';

interface CarDetailsModalProps {
    car: Car;
    onClose: () => void;
    isSelectedForCompare: boolean;
    onToggleCompare: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

export default function CarDetailsModal({ car, onClose, isSelectedForCompare, onToggleCompare, isFavorite, onToggleFavorite }: CarDetailsModalProps) {

    const gallery = [
        car.img.startsWith('/car-images/')
            ? `${import.meta.env.BASE_URL}${car.img.substring(1)}`
            : car.img
    ];

    const [currentIdx, setCurrentIdx] = useState(0);
    const [isImgLoading, setIsImgLoading] = useState(true);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const fallbackImg = "https://placehold.co/600x400/e2e8f0/94a3b8?text=Imagem+Indisponível";

    const nextImage = useCallback(() => {
        setCurrentIdx((prev) => (prev + 1) % gallery.length);
    }, [gallery.length]);

    const prevImage = useCallback(() => {
        setCurrentIdx((prev) => (prev - 1 + gallery.length) % gallery.length);
    }, [gallery.length]);

    // Reset loading state whenever image index changes
    useEffect(() => {
        setIsImgLoading(true);
    }, [currentIdx]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, nextImage, prevImage]);

    const handleImageError = (index: number) => {
        // If error, we switch to fallback. We keep loading true until fallback loads.
        setFailedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(index);
            return newSet;
        });
    };

    const handleImageLoad = () => {
        setIsImgLoading(false);
    };

    const getFeatures = (cat: string) => {
        switch (cat) {
            case 'Compacto': return ['Central Multimídia HD', 'Câmera de Ré', 'Integração Smartphone', 'Sensor de Estacionamento', 'Frenagem de Emergência Urbana'];
            case 'SUV': return ['Piloto Automático Adaptativo', 'Porta-malas Elétrico', 'Faróis Full LED', 'Assistente de Permanência em Faixa', 'Monitoramento de Ponto Cego'];
            case 'Luxo': return ['Sistema de Som Premium Surround', 'Teto Solar Panorâmico', 'Bancos com Ajuste Elétrico e Massagem', 'Direção Autônoma Nível 2+', 'Suspensão a Ar Adaptativa'];
            case 'Comercial': return ['Capacidade de Carga Ampliada', 'Sistema de Gestão de Frota', 'Piso de Carga Reforçado', 'Abertura de Portas 180°', 'Carregamento Rápido DC'];
            default: return ['Ar Condicionado Digital', 'Vidros Elétricos One-Touch', 'Direção Assistida', 'Freios ABS com EBD', '6 Airbags'];
        }
    };

    const features = getFeatures(car.cat);
    const activeImageSrc = failedImages.has(currentIdx) ? fallbackImg : gallery[currentIdx];

    const getImageLabel = (idx: number) => {
        return "Exterior Principal";
    };

    const brandUrl = BRAND_URLS[car.brand] || `https://www.google.com/search?q=${encodeURIComponent(car.brand + " " + car.model + " comprar")}`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row overflow-hidden ring-1 ring-slate-900/5">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white md:text-slate-500 md:bg-white md:hover:bg-slate-100 md:shadow-sm p-2 rounded-full transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Carousel / Image Section */}
                <div className="w-full md:w-1/2 bg-slate-100 relative min-h-[300px] md:min-h-full group select-none flex flex-col justify-center bg-zinc-900">

                    {/* Main Image */}
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">

                        {/* Loading Spinner / Placeholder */}
                        {isImgLoading && (
                            <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center z-0">
                                <Loader2 className="w-10 h-10 text-zinc-600 animate-spin" />
                            </div>
                        )}

                        <img
                            key={activeImageSrc} // Remount if source changes (e.g. to fallback) to re-trigger load events cleanly
                            src={activeImageSrc}
                            alt={`${car.model} view ${currentIdx + 1}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onLoad={handleImageLoad}
                            onError={() => handleImageError(currentIdx)}
                            className={`w-full h-full object-cover transition-opacity duration-500 ${isImgLoading ? 'opacity-0' : 'opacity-100'}`}
                        />

                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                    </div>

                    {/* Navigation Controls */}
                    {gallery.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-all hover:scale-110 border border-white/20"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-all hover:scale-110 border border-white/20"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {gallery.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setCurrentIdx(idx); }}
                                        className={`h-1.5 rounded-full transition-all shadow-sm ${idx === currentIdx
                                            ? 'bg-white w-8'
                                            : 'bg-white/40 hover:bg-white/70 w-2'
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Mobile Title Overlay */}
                    <div className="absolute bottom-8 left-6 text-white md:hidden pointer-events-none z-10">
                        <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">{car.brand}</p>
                        <h2 className="text-3xl font-extrabold shadow-black drop-shadow-md">{car.model}</h2>
                    </div>

                    {/* Image Counter Badge */}
                    {gallery.length > 1 && (
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none border border-white/10">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{getImageLabel(currentIdx)}</span>
                            <span className="opacity-50">|</span>
                            <span>{currentIdx + 1}/{gallery.length}</span>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-6 md:p-10 bg-white flex flex-col">
                    <div className="hidden md:block mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide border border-slate-200">{car.cat}</span>
                            <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{car.brand}</span>
                            {isFavorite && (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-500 border border-red-100 px-2.5 py-0.5 rounded-md">
                                    <Heart className="w-3 h-3 fill-current" /> Favorito
                                </span>
                            )}
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{car.model}</h2>
                    </div>

                    {/* Key Specs Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" /> Preço Estimado
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                                {car.price >= 1000000 ? `R$ ${(car.price / 1000000).toFixed(1)} mi` : `R$ ${(car.price / 1000).toFixed(0)}k`}
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <Map className="w-3.5 h-3.5" /> Autonomia PBEV
                            </p>
                            <p className="text-2xl font-bold text-slate-800">{car.range} km</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5" /> Potência
                            </p>
                            <p className="text-2xl font-bold text-slate-800">
                                {car.power ? `${car.power} cv` : 'N/D'}
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" /> Torque
                            </p>
                            <p className="text-2xl font-bold text-slate-800">
                                {car.torque ? `${car.torque} kgfm` : 'N/D'}
                            </p>
                        </div>        </div>
                    {/* Features */}
                    <div className="mb-8 flex-1">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Destaques do Segmento
                        </h3>
                        <ul className="space-y-3">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span className="leading-snug">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA & Compare */}
                    <div className="flex gap-3">
                        <button
                            onClick={onToggleCompare}
                            className={`flex-1 py-4 rounded-xl transition-all font-bold flex items-center justify-center gap-2 border-2 ${isSelectedForCompare
                                ? 'bg-blue-50 border-blue-600 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            {isSelectedForCompare ? <Check className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                            {isSelectedForCompare ? "Comparando" : "Comparar"}
                        </button>
                        <button
                            onClick={onToggleFavorite}
                            className={`w-14 py-4 rounded-xl transition-all font-bold flex items-center justify-center border-2 ${isFavorite
                                ? 'bg-red-50 border-red-200 text-red-500'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200'
                                }`}
                            title={isFavorite ? "Remover Favorito" : "Favoritar"}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <a
                            href={brandUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-2 group no-underline"
                        >
                            Tenho Interesse
                            <Zap className="w-4 h-4 text-yellow-400 group-hover:animate-pulse" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
