
import React from 'react';
import { Car } from '../types';
import { X, Check, Minus, Map, Battery, Car as CarIcon, DollarSign, Zap } from 'lucide-react';

interface ComparisonModalProps {
  cars: Car[];
  onClose: () => void;
  onRemove: (car: Car) => void;
}

export default function ComparisonModal({ cars, onClose, onRemove }: ComparisonModalProps) {
  // Helper to generate features (duplicated logic for consistency)
  const getFeatures = (cat: string) => {
    switch(cat) {
      case 'Compacto': return ['Multimídia HD', 'Câmera Ré', 'Sensor Estac.'];
      case 'SUV': return ['Piloto Adaptativo', 'Porta-malas Elét.', 'Faróis LED'];
      case 'Luxo': return ['Som Surround', 'Teto Panorâmico', 'Direção Autônoma'];
      case 'Comercial': return ['Carga Ampliada', 'Gestão Frota', 'Piso Reforçado'];
      default: return ['Ar Digital', 'Vidros One-Touch', 'Direção Assistida'];
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl relative z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900">Comparativo de Veículos</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Lado a Lado</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comparison Table Container */}
        <div className="flex-1 overflow-auto bg-slate-50 p-6 custom-scrollbar">
          <div className="min-w-[800px] grid" style={{ gridTemplateColumns: `150px repeat(${cars.length}, minmax(240px, 1fr))` }}>
            
            {/* LABELS COLUMN */}
            <div className="flex flex-col gap-4 py-4 pr-4">
               <div className="h-40"></div> {/* Spacer for Images */}
               <div className="font-bold text-slate-400 text-xs uppercase tracking-wider h-10 flex items-center">Modelo</div>
               <div className="font-bold text-slate-400 text-xs uppercase tracking-wider h-10 flex items-center">Preço</div>
               <div className="font-bold text-slate-400 text-xs uppercase tracking-wider h-10 flex items-center">Autonomia</div>
               <div className="font-bold text-slate-400 text-xs uppercase tracking-wider h-10 flex items-center">Categoria</div>
               <div className="font-bold text-slate-400 text-xs uppercase tracking-wider h-10 flex items-center">Recursos</div>
            </div>

            {/* CAR COLUMNS */}
            {cars.map((car, idx) => (
              <div key={idx} className="flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mx-2 relative group hover:border-blue-300 transition-colors">
                 
                 {/* Remove Button */}
                 <button 
                    onClick={() => onRemove(car)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 bg-white rounded-full p-1 border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Remover"
                 >
                    <X className="w-4 h-4" />
                 </button>

                 {/* Image */}
                 <div className="h-40 rounded-xl overflow-hidden bg-slate-100 relative">
                    <img 
                        src={car.img} 
                        alt={car.model} 
                        className="w-full h-full object-cover animate-in fade-in duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                        <span className="text-white text-xs font-bold uppercase">{car.brand}</span>
                    </div>
                 </div>

                 {/* Data Rows */}
                 <div className="h-10 flex items-center">
                    <span className="font-black text-slate-800 text-lg leading-tight">{car.model}</span>
                 </div>
                 
                 <div className="h-10 flex items-center">
                    <span className="font-bold text-blue-600 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {car.price.toLocaleString('pt-BR')}
                    </span>
                 </div>

                 <div className="h-10 flex items-center">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Map className="w-4 h-4 text-slate-400" />
                        {car.range} km
                    </span>
                 </div>

                 <div className="h-10 flex items-center">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 uppercase">
                        {car.cat}
                    </span>
                 </div>

                 <div className="flex-1 mt-2">
                    <ul className="space-y-2">
                        {getFeatures(car.cat).map((feat, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-500 leading-tight">
                                <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {feat}
                            </li>
                        ))}
                    </ul>
                 </div>
              </div>
            ))}

            {/* Empty Slots Filler */}
            {cars.length < 3 && (
                <div className="mx-2 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-2 min-h-[400px]">
                    <div className="bg-slate-50 p-4 rounded-full">
                         <Minus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">Espaço Vazio</span>
                </div>
            )}
            
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-400">
            Comparativo gerado com base nos dados PBEV 2025.
        </div>
      </div>
    </div>
  );
}
