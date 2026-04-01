import React, { useEffect, useRef } from 'react';
import { X, MapPin, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ELETROPOSTOS_POR_ESTADO, TOTAL_BRASIL, TOTAL_DC_BRASIL } from '../data/eletropostos';

interface ChargingMapModalProps {
  onClose: () => void;
}

export const ChargingMapModal: React.FC<ChargingMapModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues and Vite bundling warnings
    import('leaflet').then((L) => {
      // Fix default marker icon path broken by Vite
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [-14.235, -51.925],
        zoom: 4,
        zoomControl: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;

      // Dark tile layer (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18,
      }).addTo(map);

      const maxTotal = Math.max(...ELETROPOSTOS_POR_ESTADO.map(e => e.total));

      ELETROPOSTOS_POR_ESTADO.forEach((estado) => {
        const radius = 10 + (estado.total / maxTotal) * 35;
        const opacity = 0.3 + (estado.total / maxTotal) * 0.55;

        const circle = L.circleMarker([estado.lat, estado.lng], {
          radius,
          fillColor: '#00b4ff',
          color: '#ffffff',
          weight: 1,
          opacity: 0.8,
          fillOpacity: opacity,
        }).addTo(map);

        circle.bindPopup(
          `<div style="font-family:sans-serif;min-width:160px;">
            <strong style="color:#00b4ff;font-size:14px;">${estado.uf} — ${estado.nome}</strong><br/>
            <span style="color:#ccc;">Total: <b style="color:#fff;">${estado.total.toLocaleString('pt-BR')}</b> eletropostos</span><br/>
            <span style="color:#ccc;">DC (rápida): <b style="color:#00b4ff;">⚡ ${estado.dcCount}</b></span>
          </div>`,
          { className: 'dark-popup' }
        );

        // UF label
        L.marker([estado.lat, estado.lng], {
          icon: L.divIcon({
            className: '',
            html: `<span style="color:#fff;font-size:10px;font-weight:bold;text-shadow:0 1px 3px rgba(0,0,0,0.9);pointer-events:none;white-space:nowrap;">${estado.uf}</span>`,
            iconAnchor: [10, -8],
          }),
          interactive: false,
        }).addTo(map);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full h-full md:w-[900px] md:h-[620px] md:max-h-[90vh] bg-[#0f1115] border border-white/10 md:rounded-3xl shadow-[0_0_60px_rgba(0,180,255,0.2)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#00b4ff]/10 border border-[#00b4ff]/30 p-2 rounded-xl">
              <MapPin className="w-5 h-5 text-[#00b4ff]" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg leading-none">{t('chargingMap.title')}</h2>
              <p className="text-[#888] text-xs mt-0.5">{t('chargingMap.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 px-5 py-3 border-b border-white/5 bg-white/2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00b4ff] shadow-[0_0_8px_rgba(0,180,255,0.8)]" />
            <span className="text-white/70 text-xs">{t('chargingMap.totalStations')}: <strong className="text-white">{TOTAL_BRASIL.toLocaleString('pt-BR')}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-[#00b4ff]" />
            <span className="text-white/70 text-xs">{t('chargingMap.dcStations')}: <strong className="text-[#00b4ff]">{TOTAL_DC_BRASIL.toLocaleString('pt-BR')}</strong></span>
          </div>
          <div className="ml-auto text-[10px] text-white/30 italic">
            {t('chargingMap.source')}
          </div>
        </div>

        {/* Map container */}
        <div className="flex-1 relative overflow-hidden">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-white/5 bg-[#0a0b12]/60 flex-shrink-0">
          <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{t('chargingMap.legend')}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00b4ff] opacity-40" />
            <span className="text-[11px] text-white/50">{t('chargingMap.legendFew')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#00b4ff] opacity-85" />
            <span className="text-[11px] text-white/50">{t('chargingMap.legendMany')}</span>
          </div>
          <span className="ml-auto text-[10px] text-white/30">{t('chargingMap.clickToSeeDetails')}</span>
        </div>
      </div>

      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #1a1c23;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.6);
          color: #ccc;
        }
        .dark-popup .leaflet-popup-tip {
          background: #1a1c23;
        }
        .dark-popup .leaflet-popup-close-button {
          color: #888;
        }
      `}</style>
    </div>
  );
};
