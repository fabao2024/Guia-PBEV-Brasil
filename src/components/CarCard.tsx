
import React, { useState } from 'react';
import { Car } from '../types';
import { BRAND_URLS } from '../constants';
import { Map, Car as CarIcon, Scale, Check, ImageOff, ExternalLink, Heart } from 'lucide-react';

interface CarCardProps {
  car: Car;
  onClick: () => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (e: React.MouseEvent) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onClick, isSelectedForCompare, onToggleCompare, isFavorite, onToggleFavorite }) => {
  const isLux = car.cat === "Luxo";
  const isCom = car.cat === "Comercial";
  const isNew = (["Neta", "Geely", "Kia", "Chevrolet", "Omoda", "GAC", "Zeekr", "GWM"].includes(car.brand) && !["Ora 03 Skin BEV48", "Ora 03 GT BEV63"].includes(car.model)) || car.model.includes("Captiva") || car.model.includes("Buzz");

  // Simple state machine: Loading -> Loaded OR Error
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(car.img);

  // Get Brand URL or fallback to a Brazil-specific Google Search
  const brandUrl = BRAND_URLS[car.brand] || `https://www.google.com/search?q=${encodeURIComponent(car.brand + " Brasil")}`;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl overflow-hidden relative group shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer border ${isSelectedForCompare ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-200'}`}
    >
      {/* Compare Button (Top Left) */}
      <button
        onClick={onToggleCompare}
        className={`absolute top-3 left-3 z-20 p-1.5 rounded-lg border shadow-sm transition-all ${isSelectedForCompare
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white/90 backdrop-blur border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300'
          }`}
        title={isSelectedForCompare ? "Remover da comparação" : "Comparar"}
      >
        {isSelectedForCompare ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
      </button>

      {/* Official Site Link (Top Left - Offset) */}
      <a
        href={brandUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 left-12 z-20 p-1.5 rounded-lg border shadow-sm bg-white/90 backdrop-blur border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all"
        title={`Site Oficial ${car.brand}`}
      >
        <ExternalLink className="w-4 h-4" />
      </a>

      {/* Favorite Button (Top Right) */}
      <button
        onClick={onToggleFavorite}
        className={`absolute top-3 right-3 z-20 p-1.5 rounded-lg border shadow-sm transition-all ${isFavorite
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'bg-white/90 backdrop-blur border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200'
          }`}
        title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Image Container */}
      <div className="relative pb-[56.25%] overflow-hidden bg-slate-100">
        {/* Badges - Moved down to allow space for Heart Button */}
        <div className="absolute top-12 right-3 z-10 flex gap-1 flex-wrap justify-end pl-2">
          {isLux && <span className="text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide bg-slate-900 text-yellow-400 shadow-sm">Premium</span>}
          {isCom && <span className="text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide bg-slate-600 text-white shadow-sm">Comercial</span>}
          {isNew && <span className="text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide bg-blue-600 text-white shadow-sm">Novidade</span>}
        </div>

        {/* Loading Placeholder (Skeleton) */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-0">
            <CarIcon className="w-8 h-8 text-slate-300 opacity-50" />
          </div>
        )}

        {/* Error Placeholder */}
        {hasError && (
          <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-0">
            <div className="flex flex-col items-center text-slate-400">
              <ImageOff className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-bold uppercase">Indisponível</span>
            </div>
          </div>
        )}

        {/* Actual Image */}
        {!hasError && (
          <img
            src={car.img.startsWith('/car-images/')
              ? `${import.meta.env.BASE_URL}${car.img.substring(1)}`
              : `https://images.weserv.nl/?url=${encodeURIComponent(car.img.replace(/^https?:\/\//, ''))}&w=800&q=80&output=webp`
            }
            alt={car.model}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={() => { setHasError(true); setIsLoading(false); }}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          />
        )}

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent p-4 pt-12 pointer-events-none">
          <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1">{car.brand}</p>
          <h3 className="text-white text-xl font-bold leading-none shadow-black drop-shadow-md">{car.model}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-baseline mb-4 pb-4 border-b border-slate-100">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preço Estimado</span>
          <span className="text-xl font-bold text-blue-600">R$ {car.price.toLocaleString('pt-BR')}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mt-auto">
          <div className="flex flex-col bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Autonomia</span>
            <span className="font-bold text-slate-700 flex items-center">
              <Map className="w-3 h-3 text-blue-400 mr-2" />
              {car.range} km
            </span>
          </div>
          <div className="flex flex-col bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Categoria</span>
            <span className="font-bold text-slate-700 flex items-center">
              <CarIcon className="w-3 h-3 text-blue-400 mr-2" />
              {car.cat}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
