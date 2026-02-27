import React from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X } from 'lucide-react';
import { FilterState } from '../types';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  allBrands: string[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ filters, setFilters, allBrands, isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }));
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, minRange: Number(e.target.value) }));
  };

  const handleCategoryChange = (cat: string) => {
    setFilters(prev => {
      const newCats = prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: newCats };
    });
  };

  const handleBrandChange = (brand: string) => {
    setFilters(prev => {
      const newBrands = prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand];
      return { ...prev, brands: newBrands };
    });
  };

  const clearFilters = () => {
    setFilters({
      maxPrice: 1500000,
      minRange: 100,
      categories: [],
      brands: []
    });
  };

  const formatPrice = (val: number) => {
    return val >= 1500000 ? "R$ 1.5M+" : `R$ ${(val / 1000).toFixed(0)}k`;
  };

  const baseClasses = "bg-[#0a0b12]/90 backdrop-blur-xl border-r border-[#00b4ff]/10 overflow-y-auto p-6 shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-40 transition-transform duration-300 ease-in-out custom-scrollbar-dark";
  const responsiveClasses = isOpen
    ? "fixed inset-0 w-full md:w-80 translate-x-0"
    : "fixed inset-0 w-full md:w-80 -translate-x-full md:relative md:translate-x-0 md:block hidden";

  const categories = ["Compacto", "SUV", "Sedan", "Luxo", "Comercial"];

  return (
    <aside className={`${baseClasses} ${responsiveClasses}`}>

      <div className="flex justify-between items-center mb-8">
        <h2 className="font-black text-white flex items-center gap-3 text-lg tracking-wide uppercase">
          <SlidersHorizontal className="text-[#00b4ff] w-5 h-5 drop-shadow-[0_0_5px_rgba(0,180,255,0.5)]" /> {t('sidebar.filters')}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={clearFilters} className="text-xs font-black text-[#00b4ff] hover:bg-[#00b4ff] hover:text-black uppercase bg-[#00b4ff]/10 px-3 py-1.5 rounded-full transition-all border border-[#00b4ff]/30 tracking-wider">
            {t('sidebar.clear')}
          </button>
          <button onClick={onClose} className="md:hidden text-[#666666] hover:text-[#00b4ff] transition-colors bg-white/5 p-1.5 rounded-lg border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-10">
        <label className="block text-xs font-black text-[#a0a0a0] uppercase mb-4 tracking-widest">{t('sidebar.maxPrice')}</label>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-black text-white tracking-tighter drop-shadow-md">{formatPrice(filters.maxPrice)}</span>
        </div>
        <input
          type="range"
          min="100000"
          max="1500000"
          step="50000"
          value={filters.maxPrice}
          onChange={handlePriceChange}
          className="w-full accent-[#00b4ff] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#666666] mt-3 font-black tracking-wider uppercase">
          <span>R$ 100k</span>
          <span>R$ 1.5M</span>
        </div>
      </div>

      {/* Range Filter */}
      <div className="mb-10">
        <label className="block text-xs font-black text-[#a0a0a0] uppercase mb-4 tracking-widest">{t('sidebar.range')}</label>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-black text-white tracking-tighter drop-shadow-md">{filters.minRange} <span className="text-lg text-[#00b4ff]">km</span></span>
        </div>
        <input
          type="range"
          min="100"
          max="600"
          step="10"
          value={filters.minRange}
          onChange={handleRangeChange}
          className="w-full accent-[#00b4ff] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#666666] mt-3 font-black tracking-wider uppercase">
          <span>100 km</span>
          <span>600 km+</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-10">
        <label className="block text-xs font-black text-[#a0a0a0] uppercase mb-4 tracking-widest">{t('sidebar.category')}</label>
        <div className="space-y-3">
          {categories.map(cat => (
            <label key={cat} className={`flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-3 -ml-3 rounded-xl transition-all border border-transparent hover:border-white/10 ${filters.categories.includes(cat) ? 'bg-[#00b4ff]/5 border-[#00b4ff]/20 shadow-[0_0_10px_rgba(0,180,255,0.05)]' : ''}`}>
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
                className="w-5 h-5 rounded text-[#00b4ff] focus:ring-[#00b4ff] bg-black/50 border-white/20 transition cursor-pointer checked:bg-[#00b4ff] checked:border-[#00b4ff]"
              />
              <span className={`text-sm font-bold tracking-wide transition-colors ${filters.categories.includes(cat) ? 'text-[#00b4ff] drop-shadow-[0_0_5px_rgba(0,180,255,0.3)]' : 'text-white/70 group-hover:text-white'}`}>
                {cat === "Compacto" ? t('sidebar.catCompact') :
                  cat === "SUV" ? t('sidebar.catSUV') :
                    cat === "Luxo" ? t('sidebar.catLuxury') :
                      cat === "Comercial" ? t('sidebar.catCommercial') : cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands Filter */}
      <div className="mb-6">
        <label className="block text-xs font-black text-[#a0a0a0] uppercase mb-4 tracking-widest">{t('sidebar.brands')}</label>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar-dark">
          {allBrands.map(brand => (
            <label key={brand} className={`flex items-center gap-3 cursor-pointer group p-2 -ml-2 rounded-xl transition-all border border-transparent hover:border-white/10 ${filters.brands.includes(brand) ? 'bg-[#00b4ff]/5 border-[#00b4ff]/20 shadow-[0_0_10px_rgba(0,180,255,0.05)]' : 'hover:bg-white/5'}`}>
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="w-4.5 h-4.5 rounded text-[#00b4ff] focus:ring-[#00b4ff] bg-black/50 border-white/20 transition cursor-pointer checked:bg-[#00b4ff] checked:border-[#00b4ff]"
              />
              <span className={`text-sm font-bold tracking-wide transition-colors ${filters.brands.includes(brand) ? 'text-[#00b4ff]' : 'text-white/70 group-hover:text-white'}`}>
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

    </aside>
  );
}
