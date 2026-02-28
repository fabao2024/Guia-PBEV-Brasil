import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FilterState, Car } from '../types';
import { BRAND_URLS } from '../constants';

interface AdvancedFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: FilterState;
    onApplyFilters: (filters: FilterState) => void;
    allCars: Car[]; // To calculate real-time results
}

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
    isOpen,
    onClose,
    currentFilters,
    onApplyFilters,
    allCars
}) => {
    const { t } = useTranslation();

    // Local state to hold filters before applying
    const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters);
    const [resultsCount, setResultsCount] = useState<number>(allCars.length);

    // Sync when opened
    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    // Real-time counting
    useEffect(() => {
        const filtered = allCars.filter(car => {
            const priceMatch = car.price >= localFilters.priceRange[0] && car.price <= localFilters.priceRange[1];
            const rangeMatch = car.range >= localFilters.rangeRange[0] && car.range <= localFilters.rangeRange[1];
            const catMatch = localFilters.categories.length === 0 || localFilters.categories.includes(car.cat);
            const brandMatch = localFilters.brands.length === 0 || localFilters.brands.includes(car.brand);
            const tractionMatch = localFilters.traction.length === 0 || (car.traction && localFilters.traction.includes(car.traction));

            return priceMatch && rangeMatch && catMatch && brandMatch && tractionMatch;
        });
        setResultsCount(filtered.length);
    }, [localFilters, allCars]);

    if (!isOpen) return null;

    const handleClear = () => {
        setLocalFilters({
            priceRange: [0, 2000000],
            rangeRange: [0, 1000],
            categories: [],
            brands: [],
            traction: []
        });
    };

    const applyAndClose = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const toggleArrayItem = (key: keyof Pick<FilterState, 'categories' | 'brands' | 'traction'>, value: string) => {
        setLocalFilters(prev => {
            const currentArr = prev[key];
            if (currentArr.includes(value)) {
                return { ...prev, [key]: currentArr.filter(i => i !== value) };
            }
            return { ...prev, [key]: [...currentArr, value] };
        });
    };

    // Extract available brands and categories from DB
    const allAvailableBrands = Object.keys(BRAND_URLS);

    // We need a helper to get logos. 
    // We can use a simple generic fallback or map if we have them. 
    // For now we assume logos are in `/car-images/logos/[brand].png` or we use a fallback online source
    const getBrandLogo = (brand: string) => {
        // Let's use simple clearbits logo API for now
        return `https://logo.clearbit.com/${BRAND_URLS[brand].replace('https://', '').replace('www.', '')}?size=100`;
    };

    const allTractionTypes = ['FWD', 'RWD', 'AWD'];
    const allCategories = ['Urbano', 'Compacto', 'SUV', 'Sedan', 'Luxo', 'Comercial'];

    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end lg:justify-center items-center p-0 lg:p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative w-full lg:w-[480px] h-[90vh] lg:h-auto max-h-[90vh] bg-gradient-to-b from-[#1a1c23] to-[#0f1115] border border-white/10 rounded-t-3xl lg:rounded-3xl shadow-[0_0_50px_rgba(0,180,255,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 lg:slide-in-from-bottom-4 duration-300">

                {/* Header */}
                <div className="flex justify-between items-start p-5 pb-2">
                    <button onClick={handleClear} className="text-[#00b4ff] hover:text-white transition-colors text-sm font-medium">
                        {t('advancedFilters.clearFilters')}
                    </button>
                    <button onClick={onClose} className="text-[#00b4ff] hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="px-6 text-center mb-6">
                    <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight">
                        {t('advancedFilters.title')}
                    </h2>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-8 custom-scrollbar">

                    {/* MARCA */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">{t('advancedFilters.brand')}</h3>
                        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-6 px-6 relative w-[calc(100%+3rem)]">
                            {allAvailableBrands.map(brand => {
                                const isSelected = localFilters.brands.includes(brand);
                                return (
                                    <button
                                        key={brand}
                                        onClick={() => toggleArrayItem('brands', brand)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-full border-2 flex justify-center items-center overflow-hidden transition-all duration-300 relative group ${isSelected
                                            ? 'border-[#00b4ff] bg-[#00b4ff]/10 shadow-[0_0_15px_rgba(0,180,255,0.4)]'
                                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                            }`}
                                        title={brand}
                                    >
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                                            <img
                                                src={getBrandLogo(brand)}
                                                alt={brand}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    // Fallback to text if image fails to load
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                            <span className="hidden text-[10px] font-bold text-black uppercase tracking-tighter absolute inset-0 flex items-center justify-center">
                                                {brand.slice(0, 3)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* FAIXA DE PREÇO */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">{t('advancedFilters.priceRange')}</h3>
                        <div className="px-2">
                            <DualRangeSlider
                                min={0} max={2000000} step={10000}
                                value={localFilters.priceRange}
                                onChange={(val) => setLocalFilters({ ...localFilters, priceRange: val })}
                                formatLabel={(v) => `R$ ${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M+' : (v / 1000).toFixed(0) + 'k'}`}
                            />
                        </div>
                        <div className="flex justify-center mt-6">
                            <span className="text-white/80 font-mono text-sm">
                                R$ {localFilters.priceRange[0].toLocaleString('pt-BR')} - R$ {localFilters.priceRange[1].toLocaleString('pt-BR')}
                            </span>
                        </div>
                    </div>

                    {/* AUTONOMIA PBEV */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">{t('advancedFilters.rangePBEV')}</h3>
                        <div className="px-2">
                            <DualRangeSlider
                                min={0} max={800} step={10}
                                value={localFilters.rangeRange}
                                onChange={(val) => setLocalFilters({ ...localFilters, rangeRange: val })}
                                formatLabel={(v) => `${v}km`}
                            />
                        </div>
                    </div>

                    {/* TIPO DE TRAÇÃO */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">{t('advancedFilters.tractionType')}</h3>
                        <div className="flex flex-wrap gap-2">
                            {allTractionTypes.map(traction => (
                                <PillButton
                                    key={traction}
                                    label={traction}
                                    isSelected={localFilters.traction.includes(traction)}
                                    onClick={() => toggleArrayItem('traction', traction)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* CATEGORIA */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">{t('advancedFilters.category')}</h3>
                        <div className="flex flex-wrap gap-2">
                            {allCategories.map(cat => (
                                <PillButton
                                    key={cat}
                                    label={t(`categories.${cat}`)}
                                    isSelected={localFilters.categories.includes(cat)}
                                    onClick={() => toggleArrayItem('categories', cat)}
                                />
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer Button - Fixed */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/90 to-transparent">
                    <button
                        onClick={applyAndClose}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00b4ff] to-[#007acc] text-white font-bold text-lg shadow-[0_0_20px_rgba(0,180,255,0.4)] hover:shadow-[0_0_30px_rgba(0,180,255,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {t('advancedFilters.seeResults', { count: resultsCount })}
                    </button>
                </div>

            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-fade-edges { mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
      `}</style>
        </div>
    );
};

// UI Components
const PillButton = ({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${isSelected
            ? 'border-[#00b4ff] bg-[#00b4ff]/10 text-white shadow-[0_0_15px_rgba(0,180,255,0.4)]'
            : 'border-white/20 text-[#a0a0a0] hover:border-white/40 hover:text-white'
            }`}
    >
        {label}
    </button>
);

// Advanced Dual Range Slider building on native DOM elements
const DualRangeSlider = ({
    min, max, step, value, onChange, formatLabel
}: {
    min: number, max: number, step: number, value: [number, number], onChange: (val: [number, number]) => void, formatLabel: (v: number) => string
}) => {
    const [minVal, setMinVal] = useState(value[0]);
    const [maxVal, setMaxVal] = useState(value[1]);
    const minValRef = useRef(value[0]);
    const maxValRef = useRef(value[1]);
    const range = useRef<HTMLDivElement>(null);

    useEffect(() => { setMinVal(value[0]); setMaxVal(value[1]); }, [value]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), maxVal - step);
        setMinVal(value);
        minValRef.current = value;
        onChange([value, maxVal]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), minVal + step);
        setMaxVal(value);
        maxValRef.current = value;
        onChange([minVal, value]);
    };

    const minPercent = Math.round(((minVal - min) / (max - min)) * 100);
    const maxPercent = Math.round(((maxVal - min) / (max - min)) * 100);

    return (
        <div className="relative w-full h-8 flex items-center">
            {/* Background Track */}
            <div className="absolute w-full h-1.5 bg-white/10 rounded-full" />

            {/* Active Track (Glowing Blue) */}
            <div
                ref={range}
                className="absolute h-1.5 bg-gradient-to-r from-[#00b4ff] to-[#00b4ff] rounded-full shadow-[0_0_10px_rgba(0,180,255,0.6)]"
                style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
            />

            {/* Inputs overlay each other */}
            <input
                type="range" min={min} max={max} step={step} value={minVal} onChange={handleMinChange}
                className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-30 dual-slider-thumb"
            />
            <input
                type="range" min={min} max={max} step={step} value={maxVal} onChange={handleMaxChange}
                // max thumb z-index must be higher so it can be dragged when close to min
                className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-40 dual-slider-thumb"
            />

            <div className="absolute w-full -bottom-6 flex justify-between text-xs text-[#888] font-mono select-none">
                <span>{formatLabel(min)}</span>
                <span>{formatLabel(max)}</span>
            </div>

            <style>{`
        .dual-slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: all;
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 180, 255, 0.5);
          position: relative;
        }
      `}</style>
        </div>
    );
};
