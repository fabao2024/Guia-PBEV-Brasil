import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Zap, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  ELETROPOSTOS,
  OPERADORES,
  OPERADOR_COLOR,
  DEFAULT_OPERADOR_COLOR,
  gmapsUrl,
  plugshareUrl,
} from '../data/eletropostosData';

interface ChargingMapModalProps {
  onClose: () => void;
}

export const ChargingMapModal: React.FC<ChargingMapModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const [minKw, setMinKw] = useState(0);
  const [selectedOp, setSelectedOp] = useState<string | null>(null);

  const filtered = ELETROPOSTOS.filter(e =>
    e.potenciaDC >= minKw &&
    (!selectedOp || e.operador === selectedOp)
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [-18.0, -48.5],
        zoom: 4,
        zoomControl: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18,
      }).addTo(map);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers whenever filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    import('leaflet').then((L) => {
      // Remove existing circle markers layer group if any
      map.eachLayer((layer) => {
        if ((layer as unknown as { _isEletroposto?: boolean })._isEletroposto) {
          map.removeLayer(layer);
        }
      });

      filtered.forEach((e) => {
        const color = OPERADOR_COLOR[e.operador] ?? DEFAULT_OPERADOR_COLOR;
        const radius = 5 + Math.round((e.potenciaDC / 350) * 9); // 5–14 px

        const circle = L.circleMarker([e.lat, e.lng], {
          radius,
          fillColor: color,
          color: '#ffffff',
          weight: 1,
          opacity: 0.9,
          fillOpacity: 0.85,
        }) as import('leaflet').CircleMarker & { _isEletroposto?: boolean };

        circle._isEletroposto = true;

        const gm = gmapsUrl(e.lat, e.lng);
        const ps = plugshareUrl(e.lat, e.lng);

        circle.bindPopup(
          `<div style="font-family:sans-serif;min-width:200px;line-height:1.6;">
            <strong style="color:${color};font-size:13px;">${e.nome}</strong><br/>
            <span style="color:#aaa;font-size:11px;">${e.cidade} — ${e.uf}</span>
            <hr style="border-color:rgba(255,255,255,0.1);margin:6px 0 5px;"/>
            <div style="margin-bottom:4px;">
              <span style="color:#ccc;font-size:12px;">⚡ <b style="color:#fff;">${e.potenciaDC} kW</b> DC &nbsp;·&nbsp; 🔌 ${e.conector}</span>
            </div>
            <div style="color:#888;font-size:11px;margin-bottom:8px;">Operador: ${e.operador}</div>
            <div style="display:flex;gap:6px;">
              <a href="${gm}" target="_blank" rel="noopener noreferrer"
                 style="flex:1;text-align:center;padding:5px 0;background:#1a73e8;color:#fff;border-radius:6px;font-size:11px;font-weight:bold;text-decoration:none;">
                📍 Google Maps
              </a>
              <a href="${ps}" target="_blank" rel="noopener noreferrer"
                 style="flex:1;text-align:center;padding:5px 0;background:#2d7dd2;color:#fff;border-radius:6px;font-size:11px;font-weight:bold;text-decoration:none;">
                🔌 PlugShare
              </a>
            </div>
          </div>`,
          { className: 'dark-popup' }
        );

        circle.addTo(map);
      });
    });
  }, [filtered.length, minKw, selectedOp]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalDCKw = filtered.reduce((acc, e) => acc + e.potenciaDC, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full h-full md:w-[960px] md:h-[680px] md:max-h-[92vh] bg-[#0f1115] border border-white/10 md:rounded-3xl shadow-[0_0_60px_rgba(0,180,255,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#00b4ff]/10 border border-[#00b4ff]/30 p-2 rounded-xl">
              <MapPin className="w-4 h-4 text-[#00b4ff]" />
            </div>
            <div>
              <h2 className="text-white font-black text-base leading-none">{t('chargingMap.title')}</h2>
              <p className="text-[#888] text-[11px] mt-0.5">{t('chargingMap.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters + Stats bar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-white/2 flex-shrink-0">
          {/* Potência mínima */}
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#00b4ff] flex-shrink-0" />
            <span className="text-white/60 text-xs whitespace-nowrap">{t('chargingMap.minPower')}:</span>
            <select
              value={minKw}
              onChange={e => setMinKw(Number(e.target.value))}
              className="border border-white/10 rounded-lg text-white text-xs px-2 py-1 focus:outline-none focus:border-[#00b4ff]/50"
              style={{ backgroundColor: '#1a1c23', color: '#fff' }}
            >
              <option value={0}   style={{ background: '#1a1c23', color: '#fff' }}>Todos</option>
              <option value={100} style={{ background: '#1a1c23', color: '#fff' }}>≥ 100 kW</option>
              <option value={150} style={{ background: '#1a1c23', color: '#fff' }}>≥ 150 kW</option>
              <option value={200} style={{ background: '#1a1c23', color: '#fff' }}>≥ 200 kW</option>
              <option value={250} style={{ background: '#1a1c23', color: '#fff' }}>≥ 250 kW</option>
              <option value={350} style={{ background: '#1a1c23', color: '#fff' }}>350 kW</option>
            </select>
          </div>

          {/* Operador */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            <select
              value={selectedOp ?? ''}
              onChange={e => setSelectedOp(e.target.value || null)}
              className="border border-white/10 rounded-lg text-white text-xs px-2 py-1 focus:outline-none focus:border-[#00b4ff]/50"
              style={{ backgroundColor: '#1a1c23', color: '#fff' }}
            >
              <option value="" style={{ background: '#1a1c23', color: '#fff' }}>{t('chargingMap.allOperators')}</option>
              {OPERADORES.map(op => (
                <option key={op} value={op} style={{ background: '#1a1c23', color: '#fff' }}>{op}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="ml-auto flex items-center gap-4 flex-shrink-0">
            <span className="text-white/50 text-xs whitespace-nowrap">
              <span className="text-white font-bold">{filtered.length}</span> {t('chargingMap.stations')}
            </span>
            <span className="text-[#00b4ff]/70 text-xs whitespace-nowrap">
              ⚡ avg <span className="text-[#00b4ff] font-bold">{filtered.length > 0 ? Math.round(totalDCKw / filtered.length) : 0} kW</span>
            </span>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative overflow-hidden">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 border-t border-white/5 bg-[#0a0b12]/60 flex-shrink-0">
          {Object.entries(OPERADOR_COLOR).map(([op, color]) => (
            <button
              key={op}
              onClick={() => setSelectedOp(selectedOp === op ? null : op)}
              className={`flex items-center gap-1.5 transition-opacity ${selectedOp && selectedOp !== op ? 'opacity-30' : 'opacity-100'}`}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-[11px] text-white/60 hover:text-white/90">{op}</span>
            </button>
          ))}
          <span className="ml-auto text-[10px] text-white/25 italic flex-shrink-0">{t('chargingMap.source')}</span>
        </div>
      </div>

    </div>
  );
};
