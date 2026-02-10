import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CAR_DB } from './constants';
import Sidebar from './components/Sidebar';
import CarCard from './components/CarCard';
import ChatWidget from './components/ChatWidget';
import CarDetailsModal from './components/CarDetailsModal';
import ComparisonModal from './components/ComparisonModal';
import LanguageToggle from './components/LanguageToggle';
import { Zap, Printer, Search, SlidersHorizontal, Scale, X, ArrowRight, Heart } from 'lucide-react';
import { useCarFilter } from './hooks/useCarFilter';
import { useFavorites } from './hooks/useFavorites';
import { useCompare } from './hooks/useCompare';
import { Car } from './types';

export default function App() {
  const { t } = useTranslation();
  const { filters, setFilters, allBrands, resetFilters } = useCarFilter(CAR_DB);
  const { favorites, showFavoritesOnly, setShowFavoritesOnly, toggleFavorite } = useFavorites();
  const {
    compareList,
    setCompareList,
    isCompareModalOpen,
    setIsCompareModalOpen,
    toggleCompare,
    removeFromCompare,
    clearCompare
  } = useCompare();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const filteredCars = useMemo(() => {
    let cars = CAR_DB;

    // First filter by favorites if enabled
    if (showFavoritesOnly) {
      cars = cars.filter(c => favorites.includes(c.model));
    }

    return cars.filter(car => {
      if (car.price > filters.maxPrice) return false;
      if (car.range < filters.minRange) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(car.brand)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(car.cat)) return false;
      return true;
    });
  }, [filters, showFavoritesOnly, favorites]);

  // Combined reset for filters and favorites mode
  const handleResetFilters = () => {
    resetFilters();
    setShowFavoritesOnly(false);
  };

  return (
    <div className="text-slate-800 h-screen flex flex-col overflow-hidden bg-slate-50 font-sans">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0 z-20 shadow-sm">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-3 rounded-xl shadow-lg shadow-blue-200">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">PBEV <span className="text-blue-600">2025</span></h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('header.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${showFavoritesOnly ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 text-slate-500 hover:text-red-500'}`}
              title={t('header.viewFavorites')}
            >
              <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="text-sm font-bold hidden sm:inline">{t('header.favorites')}</span>
              {favorites.length > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{favorites.length}</span>
              )}
            </button>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <div className="hidden md:block text-right">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t('header.vehiclesInDb')}</div>
              <div className="text-2xl font-black text-slate-800 leading-none">{filteredCars.length}</div>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
            <LanguageToggle />
            <button
              onClick={() => window.print()}
              className="text-slate-400 hover:text-blue-600 transition p-2"
              title={t('header.print')}
            >
              <Printer className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden max-w-[1600px] mx-auto w-full relative">

        {/* SIDEBAR */}
        <Sidebar
          filters={filters}
          setFilters={setFilters}
          allBrands={allBrands}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth relative w-full pb-32">

          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-6 sticky top-0 z-30">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-full bg-white/90 backdrop-blur border border-slate-300 text-slate-700 font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-white"
            >
              <SlidersHorizontal className="w-5 h-5" /> {t('filterMobile.filterVehicles')}
            </button>
          </div>

          {/* Favorites Header Info */}
          {showFavoritesOnly && (
            <div className="mb-6 flex items-center justify-between bg-red-50 border border-red-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <Heart className="w-5 h-5 text-red-600 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{t('empty.myFavorites')}</h3>
                  <p className="text-sm text-slate-500">{t('empty.showingSaved')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFavoritesOnly(false)}
                className="text-sm font-bold text-red-600 hover:underline"
              >
                {t('empty.viewAll')}
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
            {filteredCars.map((car, index) => (
              <CarCard
                key={`${car.model}-${index}`}
                car={car}
                onClick={() => setSelectedCar(car)}
                isSelectedForCompare={!!compareList.find(c => c.model === car.model)}
                onToggleCompare={(e) => { e.stopPropagation(); toggleCompare(car); }}
                isFavorite={favorites.includes(car.model)}
                onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(car); }}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredCars.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="bg-white p-8 rounded-full mb-6 shadow-sm border border-slate-100">
                {showFavoritesOnly ? (
                  <Heart className="w-10 h-10 text-red-200 fill-red-50" />
                ) : (
                  <Search className="w-10 h-10 text-blue-200" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                {showFavoritesOnly ? t('empty.noFavorites') : t('empty.noVehicles')}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {showFavoritesOnly
                  ? t('empty.noFavoritesDesc')
                  : t('empty.noVehiclesDesc')}
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 text-blue-600 font-bold hover:underline"
              >
                {showFavoritesOnly ? t('empty.backToCatalog') : t('empty.clearFilters')}
              </button>
            </div>
          )}

          <footer className="mt-auto text-center text-xs text-slate-400 border-t border-slate-200 pt-8 pb-8">
            <p><strong>{t('footer.dataSource')}</strong> {t('footer.dataDesc')}</p>
            <p className="mt-1">{t('footer.disclaimer')}</p>
          </footer>
        </main>

        {/* COMPARISON BAR (Bottom Fixed) */}
        {compareList.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-blue-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 animate-in slide-in-from-bottom-full duration-300">
            <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 overflow-x-auto pb-1 md:pb-0">
                <div className="flex items-center gap-2 mr-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Scale className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t('compareBar.compare')}</p>
                    <p className="text-sm font-bold text-slate-800">{t('compareBar.selectedOf3', { count: compareList.length })}</p>
                  </div>
                </div>

                {/* Thumbnails */}
                {compareList.map((c, i) => (
                  <div key={i} className="relative group shrink-0">
                    <img src={c.img} alt={c.model} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />
                    <button
                      onClick={() => removeFromCompare(c)}
                      className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={clearCompare}
                  className="text-xs font-bold text-slate-500 hover:text-red-500 uppercase tracking-wide px-3 py-2 transition-colors hidden sm:block"
                >
                  {t('compareBar.clear')}
                </button>
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-3 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  {t('compareBar.compareNow')} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {selectedCar && (
          <CarDetailsModal
            car={selectedCar}
            onClose={() => setSelectedCar(null)}
            isSelectedForCompare={!!compareList.find(c => c.model === selectedCar.model)}
            onToggleCompare={() => toggleCompare(selectedCar)}
            isFavorite={favorites.includes(selectedCar.model)}
            onToggleFavorite={() => toggleFavorite(selectedCar)}
          />
        )}

        {/* Comparison Modal */}
        {isCompareModalOpen && (
          <ComparisonModal
            cars={compareList}
            onClose={() => setIsCompareModalOpen(false)}
            onRemove={(car) => {
              removeFromCompare(car);
              if (compareList.length <= 1) setIsCompareModalOpen(false);
            }}
          />
        )}

        {/* AI CHAT */}
        <ChatWidget />
      </div>
    </div>
  );
}
