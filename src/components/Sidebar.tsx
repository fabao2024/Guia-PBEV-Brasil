
import React from 'react';
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
    return val >= 1500000 ? "R$ 1.5M+" : `R$ ${(val/1000).toFixed(0)}k`;
  };

  const baseClasses = "bg-white border-r border-slate-200 overflow-y-auto p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 transition-transform duration-300 ease-in-out";
  const responsiveClasses = isOpen 
    ? "fixed inset-0 w-full md:w-80 translate-x-0" 
    : "fixed inset-0 w-full md:w-80 -translate-x-full md:relative md:translate-x-0 md:block hidden";

  const categories = ["Compacto", "SUV", "Sedan", "Luxo", "Comercial"];

  return (
    <aside className={`${baseClasses} ${responsiveClasses}`}>
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
          <SlidersHorizontal className="text-blue-600 w-5 h-5" /> Filtros
        </h2>
        <div className="flex items-center gap-2">
            <button onClick={clearFilters} className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase bg-blue-50 px-3 py-1 rounded-full transition-colors">
            Limpar
            </button>
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-10">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Preço Máximo</label>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{formatPrice(filters.maxPrice)}</span>
        </div>
        <input 
          type="range" 
          min="100000" 
          max="1500000" 
          step="50000" 
          value={filters.maxPrice} 
          onChange={handlePriceChange}
          className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>R$ 100k</span>
            <span>R$ 1.5M</span>
        </div>
      </div>

      {/* Range Filter */}
      <div className="mb-10">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Autonomia (PBEV)</label>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{filters.minRange} km</span>
        </div>
        <input 
          type="range" 
          min="100" 
          max="600" 
          step="10" 
          value={filters.minRange} 
          onChange={handleRangeChange}
          className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
            <span>100 km</span>
            <span>600 km+</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-10">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Categoria</label>
        <div className="space-y-3">
          {categories.map(cat => (
             <label key={cat} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 -ml-2 rounded-lg transition-colors">
                <input 
                    type="checkbox" 
                    checked={filters.categories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition cursor-pointer"
                />
                <span className={`text-sm font-medium transition group-hover:text-blue-600 ${filters.categories.includes(cat) ? 'text-blue-700' : 'text-slate-600'}`}>
                    {cat === "Compacto" ? "Compacto / Urbano" : 
                     cat === "SUV" ? "SUV / Crossover" : 
                     cat === "Luxo" ? "Luxo / Performance" : 
                     cat === "Comercial" ? "Comercial / Van" : cat}
                </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Marcas</label>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {allBrands.map(brand => (
             <label key={brand} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 -ml-1.5 rounded-lg transition-colors">
                <input 
                    type="checkbox" 
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition cursor-pointer"
                />
                <span className={`text-sm font-medium transition ${filters.brands.includes(brand) ? 'text-blue-700' : 'text-slate-600'}`}>
                    {brand}
                </span>
            </label>
          ))}
        </div>
      </div>

    </aside>
  );
}
