
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Car } from '../types';
import { X, Check, Minus, Map, Battery, Car as CarIcon, DollarSign, Zap, Gauge, Activity } from 'lucide-react';

interface ComparisonModalProps {
   cars: Car[];
   onClose: () => void;
   onRemove: (car: Car) => void;
}

export default function ComparisonModal({ cars, onClose, onRemove }: ComparisonModalProps) {
   const { t } = useTranslation();

   const getFallbackFeatures = (cat: string): string[] => {
      const key = cat === 'Compacto' ? 'compact' : cat === 'SUV' ? 'suv' : cat === 'Luxo' ? 'luxury' : cat === 'Comercial' ? 'commercial' : 'default';
      return t(`comparison.featureList.${key}`, { returnObjects: true }) as string[];
   };
   const getCarFeatures = (car: Car): string[] =>
      (car.features && car.features.length > 0) ? car.features : getFallbackFeatures(car.cat);

   return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4 md:p-6">
         <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={onClose}
         />
         <div className="bg-black w-full max-w-6xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden rounded-none sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200 border-0 sm:border border-white/10">

            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="bg-[#00b4ff]/10 p-2.5 rounded-xl border border-[#00b4ff]/30 shadow-[0_0_15px_rgba(0,180,255,0.2)]">
                     <Zap className="w-6 h-6 text-[#00b4ff] drop-shadow-[0_0_5px_rgba(0,180,255,0.5)]" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-white tracking-widest uppercase">{t('comparison.title')}</h2>
                     <p className="text-xs text-[#a0a0a0] font-bold uppercase tracking-widest mt-1">{t('comparison.subtitle')}</p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="text-[#666666] hover:text-[#ef4444] hover:bg-white/5 p-2 rounded-full transition-colors border border-transparent hover:border-[#ef4444]/30"
               >
                  <X className="w-6 h-6" />
               </button>
            </div>

            {/* Mobile horizontal scroll hint */}
            <div className="sm:hidden flex items-center justify-center gap-2 py-2 bg-[#050505] border-b border-white/5">
               <span className="text-[10px] text-white/25 font-medium tracking-wider">← deslize para ver todos →</span>
            </div>

            {/* Comparison Table Container */}
            <div className="flex-1 overflow-auto bg-[#050505] p-4 sm:p-6 custom-scrollbar-dark">
               <div className="min-w-[800px] grid" style={{ gridTemplateColumns: `150px repeat(${cars.length}, minmax(240px, 1fr))` }}>

                  {/* LABELS COLUMN */}
                  <div className="flex flex-col gap-4 py-4 pr-4">
                     <div className="h-40"></div> {/* Spacer for Images */}
                     <div className="font-black text-[#666666] text-xs uppercase tracking-widest h-10 flex items-center">{t('comparison.model')}</div>
                     <div className="font-black text-[#666666] text-xs uppercase tracking-widest h-10 flex items-center">{t('comparison.price')}</div>
                     <div className="font-black text-[#666666] text-xs uppercase tracking-widest h-10 flex items-center">{t('comparison.range')}</div>
                     <div className="font-black text-[#666666] text-xs uppercase tracking-widest h-10 flex items-center">{t('comparison.power')}</div>
                     <div className="font-black text-[#666666] text-xs uppercase tracking-widest h-10 flex items-center">{t('comparison.torque')}</div>
                     <div className="font-black text-[#666666] text-xs uppercase tracking-widest h-10 flex items-center">{t('comparison.battery', 'Bateria')}</div>
                     <div className="font-black text-[#666666] text-xs uppercase tracking-widest h-10 flex items-center">{t('comparison.category')}</div>
                     <div className="font-black text-[#666666] text-xs uppercase tracking-widest h-10 flex items-center">{t('comparison.features')}</div>
                  </div>

                  {/* CAR COLUMNS */}
                  {cars.map((car, idx) => (
                     <div key={idx} className="flex flex-col gap-4 bg-[#111111] p-5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5 mx-2 relative group hover:border-[#00b4ff]/30 hover:shadow-[0_0_20px_rgba(0,180,255,0.1)] transition-all">

                        {/* Remove Button */}
                        <button
                           onClick={() => onRemove(car)}
                           className="absolute top-3 right-3 text-[#666666] hover:text-[#ef4444] bg-black/80 backdrop-blur-md rounded-full p-1.5 border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all z-10 hover:border-[#ef4444]/30"
                           title={t('comparison.remove')}
                        >
                           <X className="w-4 h-4" />
                        </button>

                        {/* Image */}
                        <div className="h-40 rounded-xl overflow-hidden bg-[#000000] relative">
                           <img
                              src={car.img.startsWith('/car-images/')
                                 ? `${import.meta.env.BASE_URL}${car.img.substring(1)}`
                                 : car.img.includes('wikimedia.org')
                                    ? car.img
                                    : `https://images.weserv.nl/?url=${encodeURIComponent(car.img.replace(/^https?:\/\//, ''))}&w=400&q=80&output=webp`}
                              alt={car.model}
                              className="w-full h-full object-cover animate-in fade-in duration-500 filter brightness-90 group-hover:brightness-100 transition-all"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                              <span className="text-[#a0a0a0] text-[10px] font-black uppercase tracking-widest">{car.brand}</span>
                           </div>
                        </div>

                        {/* Data Rows */}
                        <div className="h-10 flex items-center">
                           <span className="font-black text-white text-xl leading-tight drop-shadow-sm">{car.model}</span>
                        </div>

                        <div className="h-10 flex items-center">
                           <span className="font-black text-[#00b4ff] flex items-center gap-1 drop-shadow-[0_0_5px_rgba(0,180,255,0.3)]">
                              <DollarSign className="w-4 h-4" />
                              {car.price >= 1000000 ? `${(car.price / 1000000).toFixed(1)} mi` : `${(car.price / 1000).toFixed(0)}k`}
                           </span>
                        </div>

                        <div className="h-10 flex items-center">
                           <span className="font-bold text-white flex items-center gap-1.5">
                              <Map className="w-4 h-4 text-[#00b4ff]" />
                              {car.range} <span className="text-[#a0a0a0] text-sm">km</span>
                           </span>
                        </div>

                        <div className="h-10 flex items-center">
                           <span className="font-bold text-white flex items-center gap-1.5">
                              <Gauge className="w-4 h-4 text-[#00b4ff]" />
                              {car.power ? `${car.power} cv` : <span className="text-[#666666] font-bold uppercase tracking-widest text-xs">{t('details.notAvailable')}</span>}
                           </span>
                        </div>

                        <div className="h-10 flex items-center">
                           <span className="font-bold text-white flex items-center gap-1.5">
                              <Activity className="w-4 h-4 text-[#00b4ff]" />
                              {car.torque ? `${car.torque} kgfm` : <span className="text-[#666666] font-bold uppercase tracking-widest text-xs">{t('details.notAvailable')}</span>}
                           </span>
                        </div>

                        <div className="h-10 flex items-center">
                           <span className="font-bold text-white flex items-center gap-1.5">
                              <Battery className="w-4 h-4 text-[#00b4ff]" />
                              {car.battery ? `${car.battery} kWh` : <span className="text-[#666666] font-bold uppercase tracking-widest text-xs">{t('details.notAvailable')}</span>}
                           </span>
                        </div>

                        <div className="h-10 flex items-center">
                           <span className="px-2.5 py-1 bg-black/50 border border-white/10 rounded-lg text-[10px] font-black text-[#a0a0a0] uppercase tracking-widest">
                              {t(`categories.${car.cat}`)}
                           </span>
                        </div>

                        <div className="flex-1 mt-4 border-t border-white/5 pt-4">
                           <ul className="space-y-3">
                              {getCarFeatures(car).map((feat, i) => (
                                 <li key={i} className="flex items-start gap-3 text-xs text-[#a0a0a0] font-medium leading-relaxed">
                                    <Check className="w-4 h-4 text-[#00b4ff] mt-0.5 flex-shrink-0 drop-shadow-[0_0_3px_rgba(0,180,255,0.4)]" />
                                    {feat}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  ))}

                  {/* Empty Slots Filler */}
                  {cars.length < 3 && (
                     <div className="mx-2 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-[#666666] gap-4 min-h-[400px] bg-white/5">
                        <div className="bg-[#111111] p-5 rounded-full border border-white/5 shadow-inner">
                           <Minus className="w-8 h-8 text-[#333333]" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{t('comparison.emptySlot')}</span>
                     </div>
                  )}

               </div>
            </div>

            <div className="p-5 bg-black border-t border-white/10 text-center text-[10px] font-black text-[#666666] uppercase tracking-widest">
               {t('comparison.footer')}
            </div>
         </div>
      </div>
   );
}
