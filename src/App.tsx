import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CAR_DB } from './constants';
import Sidebar from './components/Sidebar';
import CarCard from './components/CarCard';
import ChatWidget from './components/ChatWidget';
import CarDetailsModal from './components/CarDetailsModal';
import ComparisonModal from './components/ComparisonModal';
import LanguageToggle from './components/LanguageToggle';
import AddVehicleModal from './components/AddVehicleModal';
import SuccessModal from './components/SuccessModal';
import SavingsSimulatorModal from './components/SavingsSimulatorModal';
import { Zap, Printer, Search, SlidersHorizontal, Scale, X, ArrowRight, Heart, Plus, BarChart2 } from 'lucide-react';
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

  // New States for Add Vehicle Feature
  const [userCars, setUserCars] = useState<Car[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);

  const filteredCars = useMemo(() => {
    let cars = [...CAR_DB, ...userCars];

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
  }, [filters, showFavoritesOnly, favorites, userCars]);

  // Combined reset for filters and favorites mode
  const handleResetFilters = () => {
    resetFilters();
    setShowFavoritesOnly(false);
  };

  const handleAddCar = (newCar: Car) => {
    setUserCars(prev => [newCar, ...prev]);
    setIsAddModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="text-white h-screen flex flex-col overflow-hidden bg-black font-sans relative selection:bg-[#00b4ff] selection:text-black">

      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00b4ff]/10 rounded-full blur-[150px] pointer-events-none opacity-50"></div>

      {/* HEADER — single row on all sizes */}
      <header className="bg-[#0a0b12]/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-3 md:py-4 flex-shrink-0 z-20 shadow-lg relative">
        <div className="max-w-[1600px] mx-auto w-full flex flex-row items-center justify-between gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <div className="bg-[#1a1a1a] border border-[#00b4ff]/30 text-[#00b4ff] p-2 md:p-3 rounded-xl shadow-[0_0_15px_rgba(0,180,255,0.2)] flex-shrink-0">
              <Zap className="w-5 h-5 md:w-6 md:h-6 fill-current animate-pulse opacity-90" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black text-white tracking-tight leading-none">PBEV <span className="text-[#00b4ff]">{t('header.titleSuffix')}</span></h1>
              <p className="hidden md:block text-xs text-[#a0a0a0] font-bold uppercase tracking-widest mt-0.5">{t('header.subtitle')}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">

            {/* Favorites */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all border ${showFavoritesOnly ? 'bg-[#00b4ff]/10 border-[#00b4ff]/50 text-[#00b4ff]' : 'bg-white/5 border-white/10 text-[#a0a0a0] hover:text-white hover:bg-white/10'}`}
              title={t('header.viewFavorites')}
            >
              <Heart className={`w-4 h-4 md:w-5 md:h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="text-sm font-bold hidden md:inline">{t('header.favorites')}</span>
              {favorites.length > 0 && (
                <span className="bg-[#00b4ff] text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">{favorites.length}</span>
              )}
            </button>

            {/* Vehicle count — desktop only */}
            <div className="hidden md:block text-right">
              <div className="text-xs text-[#666666] uppercase font-bold tracking-wider">{t('header.vehiclesInDb')}</div>
              <div className="text-2xl font-black text-white leading-none">{filteredCars.length}</div>
            </div>

            {/* Language toggle */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-0.5">
              <LanguageToggle />
            </div>

            {/* Simulator — desktop only (mobile has it in the sticky bar below) */}
            <button
              onClick={() => setIsSimulatorModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/30 hover:bg-[#00b4ff]/20 rounded-xl font-black transition-all uppercase tracking-widest text-[10px]"
            >
              <BarChart2 className="w-4 h-4" />
              {t('simulator.headerBtn', 'Simulador')}
            </button>

            {/* Add vehicle */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#00b4ff] hover:bg-[#33c9ff] hover:-translate-y-0.5 text-black px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-black transition-all shadow-[0_0_20px_rgba(0,180,255,0.3)]"
              title={t('addVehicle.headerBtn', 'Adicionar Veículo')}
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline uppercase text-sm tracking-wide">{t('addVehicle.headerBtn', 'Adicionar')}</span>
            </button>

            {/* Print — desktop only */}
            <button
              onClick={() => window.print()}
              className="hidden md:block text-[#666666] hover:text-white transition p-2"
              title={t('header.print')}
            >
              <Printer className="w-5 h-5" />
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

          {/* Mobile Action Row: Filter + Simulator */}
          <div className="md:hidden mb-4 sticky top-0 z-30 flex gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex-1 bg-[#0e0f1a]/95 backdrop-blur-xl border border-white/10 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#1a1a1a] active:scale-95 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#00b4ff]" />
              <span className="text-sm">{t('filterMobile.filterVehicles')}</span>
            </button>
            <button
              onClick={() => setIsSimulatorModalOpen(true)}
              className="bg-[#00b4ff]/10 border border-[#00b4ff]/30 text-[#00b4ff] font-black py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#00b4ff]/20 active:scale-95 transition-all whitespace-nowrap"
            >
              <BarChart2 className="w-4 h-4" />
              <span className="text-[11px] uppercase tracking-wide font-black">{t('simulator.headerBtn', 'Simulador')}</span>
            </button>
          </div>

          {/* Favorites Header Info */}
          {showFavoritesOnly && (
            <div className="mb-6 flex items-center justify-between bg-[#00b4ff]/5 border border-[#00b4ff]/20 p-5 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="bg-[#00b4ff]/10 p-3 rounded-xl border border-[#00b4ff]/30">
                  <Heart className="w-6 h-6 text-[#00b4ff] fill-current drop-shadow-[0_0_8px_rgba(0,180,255,0.5)]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{t('empty.myFavorites')}</h3>
                  <p className="text-sm text-[#a0a0a0]">{t('empty.showingSaved')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFavoritesOnly(false)}
                className="text-sm font-bold text-[#00b4ff] hover:text-white transition-colors uppercase tracking-wider bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg"
              >
                {t('empty.viewAll')}
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-6 pb-20">
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
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-300">
              <div className="bg-[#121212] p-8 rounded-full mb-6 shadow-[0_0_30px_rgba(0,180,255,0.1)] border border-white/5 relative">
                <div className="absolute inset-0 bg-[#00b4ff]/10 rounded-full blur-xl"></div>
                {showFavoritesOnly ? (
                  <Heart className="w-12 h-12 text-[#00b4ff]/40 fill-[#00b4ff]/10 relative z-10" />
                ) : (
                  <Search className="w-12 h-12 text-[#00b4ff]/50 relative z-10" />
                )}
              </div>
              <h3 className="text-3xl font-black text-white mb-3 tracking-tight">
                {showFavoritesOnly ? t('empty.noFavorites') : t('empty.noVehicles')}
              </h3>
              <p className="text-[#a0a0a0] max-w-md mx-auto text-lg">
                {showFavoritesOnly
                  ? t('empty.noFavoritesDesc')
                  : t('empty.noVehiclesDesc')}
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-8 text-black bg-white hover:bg-gray-200 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 uppercase tracking-wide text-sm"
              >
                {showFavoritesOnly ? t('empty.backToCatalog') : t('empty.clearFilters')}
              </button>
            </div>
          )}

          <footer className="mt-auto text-center text-xs text-[#444444] border-t border-white/10 pt-8 pb-8">
            <p><strong className="text-[#666666]">{t('footer.dataSource')}</strong> {t('footer.dataDesc')}</p>
            <p className="mt-2 text-[#333333]">{t('footer.disclaimer')}</p>
          </footer>
        </main>

        {/* COMPARISON BAR (Bottom Fixed) */}
        {compareList.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0b12]/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] p-4 animate-in slide-in-from-bottom-full duration-300">
            <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 overflow-x-auto pb-1 md:pb-0">
                <div className="flex items-center gap-3 mr-2">
                  <div className="bg-[#00b4ff]/10 border border-[#00b4ff]/30 p-2.5 rounded-xl">
                    <Scale className="w-5 h-5 text-[#00b4ff]" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black text-[#00b4ff] uppercase tracking-widest">{t('compareBar.compare')}</p>
                    <p className="text-sm font-bold text-white">{t('compareBar.selectedOf3', { count: compareList.length })}</p>
                  </div>
                </div>

                {/* Thumbnails */}
                {compareList.map((c, i) => (
                  <div key={i} className="relative group shrink-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-[#00b4ff]/50 transition-colors">
                      <img
                        src={c.img.startsWith('/car-images/')
                          ? `${import.meta.env.BASE_URL}${c.img.substring(1)}`
                          : c.img.includes('wikimedia.org')
                            ? c.img
                            : `https://images.weserv.nl/?url=${encodeURIComponent(c.img.replace(/^https?:\/\//, ''))}&w=200&q=80&output=webp`}
                        alt={c.model}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                    <button
                      onClick={() => removeFromCompare(c)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ef4444] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={clearCompare}
                  className="text-xs font-bold text-[#666666] hover:text-[#ef4444] uppercase tracking-wider px-2 transition-colors hidden sm:block"
                >
                  {t('compareBar.clear')}
                </button>
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="bg-transparent border border-[#00b4ff] text-[#00b4ff] hover:bg-[#00b4ff] hover:text-black pl-5 pr-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 uppercase tracking-wide"
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



        {/* Add Vehicle Modal */}
        <AddVehicleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCar}
        />

        {/* Success Modal */}
        {isSuccessModalOpen && (
          <SuccessModal
            onGoToCatalog={() => setIsSuccessModalOpen(false)}
            onAddAnother={() => {
              setIsSuccessModalOpen(false);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {/* Simulator Modal */}
        {isSimulatorModalOpen && (
          <SavingsSimulatorModal onClose={() => setIsSimulatorModalOpen(false)} />
        )}

        {/* AI CHAT */}
        <ChatWidget compareBarVisible={compareList.length > 0} />
      </div>
    </div>
  );
}
