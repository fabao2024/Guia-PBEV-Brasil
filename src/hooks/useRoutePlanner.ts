import { useState, useCallback, useMemo } from 'react';
import { useORSRoute } from './useORSRoute';
import { buildChargingStops } from '../utils/routeGeometry';
import { ELETROPOSTOS } from '../data/eletropostosData';
import { CAR_DB } from '../constants';
import { resolveOcmKey, saveOcmKey, clearOcmKey, fetchDcChargers } from '../services/ocmService';
import { fetchOsmChargers } from '../services/overpassService';
import { polylineBbox, mergeChargerSources } from '../utils/mergeChargers';
import type { Car } from '../types';
import type {
  GeoLocation,
  RouteResult,
  RoutePlannerForm,
} from '../types/routePlanner';

export const DEFAULT_CHARGER_RADIUS_KM = 30;
export const DEFAULT_DEPART_PCT = 80;   // saída com 80% de bateria
export const DEFAULT_ARRIVE_PCT = 15;   // chegar com mín. 15% de bateria

export type PlannerStatus = 'idle' | 'routing' | 'ready' | 'error';

// ─── Driving conditions ───────────────────────────────────────────────────────
export type ConditionTemp    = 'freezing' | 'cold' | 'ideal' | 'hot';
export type ConditionTerrain = 'flat' | 'hilly' | 'mountain';
export type ConditionDriving = 'eco' | 'normal' | 'sport';

/**
 * Fatores empíricos baseados em testes de campo de EVs:
 * - Temperatura: WLTP cai ~35% no gelo, ~22% no frio, ~12% no calor intenso
 * - Relevo: subidas consomem mais que descidas regeneram (~80% de eficiência regenerativa)
 * - Condução: estilo agressivo ≈ −15%, econômico ≈ +10%
 */
export const CONDITION_FACTORS = {
  temp: {
    freezing: { factor: 0.65, label: '< 0°C',   icon: '🥶' },
    cold:     { factor: 0.78, label: '0–10°C',   icon: '❄️' },
    ideal:    { factor: 1.00, label: '15–25°C',  icon: '🌤' },
    hot:      { factor: 0.88, label: '> 35°C',   icon: '☀️' },
  },
  terrain: {
    flat:     { factor: 1.05, label: 'Plano',      icon: '━' },
    hilly:    { factor: 0.92, label: 'Ondulado',   icon: '〜' },
    mountain: { factor: 0.78, label: 'Montanhoso', icon: '▲' },
  },
  driving: {
    eco:    { factor: 1.10, label: 'Econômica', icon: '🍃' },
    normal: { factor: 1.00, label: 'Normal',    icon: '→' },
    sport:  { factor: 0.85, label: 'Esportiva', icon: '⚡' },
  },
} as const;

interface RoutePlannerReturn {
  form: RoutePlannerForm;
  status: PlannerStatus;
  errorMessage: string | null;
  result: RouteResult | null;
  chargerRadiusKm: number;
  setChargerRadiusKm: (r: number) => void;
  departPct: number;
  setDepartPct: (v: number) => void;
  arrivePct: number;
  setArrivePct: (v: number) => void;
  baseConsumptionKwh: number | null;    // derivado do carro (kWh/100km), null se battery ausente
  customConsumptionKwh: number | null;  // override manual do usuário
  effectiveConsumptionKwh: number | null; // custom ?? base
  setCustomConsumptionKwh: (v: number | null) => void;
  suggestedRangeKm: number;        // base (derivado do consumo efetivo e %)
  effectiveRangeKm: number;        // customRangeKm ?? suggestedRangeKm (sem condições)
  adjustedRangeKm: number;         // effectiveRangeKm × conditionsMultiplier (usado no cálculo)
  conditionsMultiplier: number;    // produto dos 3 fatores
  conditionTemp: ConditionTemp;
  conditionTerrain: ConditionTerrain;
  conditionDriving: ConditionDriving;
  setConditionTemp: (v: ConditionTemp) => void;
  setConditionTerrain: (v: ConditionTerrain) => void;
  setConditionDriving: (v: ConditionDriving) => void;
  customRangeKm: number | null;
  setCustomRangeKm: (v: number | null) => void;
  orsHasKey: boolean;
  orsApiKey: string;
  setOrsKey: (key: string) => void;
  removeOrsKey: () => void;
  ocmApiKey: string;
  ocmHasKey: boolean;
  setOcmKey: (key: string) => void;
  removeOcmKey: () => void;
  setSelectedCar: (car: Car | null) => void;
  setOrigin: (loc: GeoLocation | null, query?: string) => void;
  setDestination: (loc: GeoLocation | null, query?: string) => void;
  setOriginQuery: (q: string) => void;
  setDestinationQuery: (q: string) => void;
  calculate: () => Promise<void>;
  reset: () => void;
}

const DEFAULT_CAR = CAR_DB.find((c) => c.chargeDC != null) ?? CAR_DB[0];

const initialForm = (): RoutePlannerForm => ({
  selectedCar: DEFAULT_CAR,
  originQuery: '',
  destinationQuery: '',
  originLocation: null,
  destinationLocation: null,
});

export function useRoutePlanner(): RoutePlannerReturn {
  const [form, setForm] = useState<RoutePlannerForm>(initialForm);
  const [status, setStatus] = useState<PlannerStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [chargerRadiusKm, setChargerRadiusKm] = useState(DEFAULT_CHARGER_RADIUS_KM);
  const [departPct, setDepartPct] = useState(DEFAULT_DEPART_PCT);
  const [arrivePct, setArrivePct] = useState(DEFAULT_ARRIVE_PCT);
  const [customRangeKm, setCustomRangeKm] = useState<number | null>(null);
  const [customConsumptionKwh, setCustomConsumptionKwhRaw] = useState<number | null>(null);

  // Ao mudar consumo manualmente, reseta override de autonomia para recalcular automaticamente
  const setCustomConsumptionKwh = useCallback((v: number | null) => {
    setCustomConsumptionKwhRaw(v);
    setCustomRangeKm(null);
  }, []);

  // Driving conditions
  const [conditionTemp, setConditionTemp] = useState<ConditionTemp>('ideal');
  const [conditionTerrain, setConditionTerrain] = useState<ConditionTerrain>('flat');
  const [conditionDriving, setConditionDriving] = useState<ConditionDriving>('normal');

  // OCM key — persisted in localStorage
  const [ocmApiKey, setOcmApiKeyState] = useState(() => resolveOcmKey());

  const setOcmKey = useCallback((key: string) => {
    saveOcmKey(key);
    setOcmApiKeyState(key.trim());
  }, []);

  const removeOcmKey = useCallback(() => {
    clearOcmKey();
    setOcmApiKeyState('');
  }, []);

  const ors = useORSRoute();

  // Consumo base derivado do carro (kWh/100km) — null se battery não cadastrada
  const baseConsumptionKwh = useMemo(() => {
    const car = form.selectedCar;
    if (!car?.battery) return null;
    // 0.93 = fator de capacidade utilizável (usable ~93% do bruto declarado pelo fabricante)
    return parseFloat((car.battery * 0.93 / car.range * 100).toFixed(2));
  }, [form.selectedCar]);

  // Consumo efetivo: override manual ou derivado do carro
  const effectiveConsumptionKwh = customConsumptionKwh ?? baseConsumptionKwh;

  // Sugestão de autonomia por trecho baseada no consumo efetivo
  const suggestedRangeKm = useMemo(() => {
    const car = form.selectedCar;
    if (!car) return 0;
    if (effectiveConsumptionKwh && car.battery) {
      // autonomia real = bateria / consumo × 100; × fração de bateria usada
      return Math.round(car.battery / effectiveConsumptionKwh * 100 * (departPct - arrivePct) / 100);
    }
    // fallback para carros sem battery cadastrada
    return Math.round(car.range * (departPct - arrivePct) / 100);
  }, [form.selectedCar, effectiveConsumptionKwh, departPct, arrivePct]);

  // Override manual ou sugestão (sem fatores de condição)
  const effectiveRangeKm = customRangeKm ?? suggestedRangeKm;

  // Multiplicador combinado das condições
  const conditionsMultiplier = useMemo(() => {
    const t = CONDITION_FACTORS.temp[conditionTemp].factor;
    const r = CONDITION_FACTORS.terrain[conditionTerrain].factor;
    const d = CONDITION_FACTORS.driving[conditionDriving].factor;
    return parseFloat((t * r * d).toFixed(4));
  }, [conditionTemp, conditionTerrain, conditionDriving]);

  // Autonomia real ajustada pelas condições — é o que vai para o buildChargingStops
  const adjustedRangeKm = Math.max(10, Math.round(effectiveRangeKm * conditionsMultiplier));

  const setSelectedCar = useCallback((car: Car | null) => {
    setForm((f) => ({ ...f, selectedCar: car }));
    setCustomRangeKm(null);
    setCustomConsumptionKwh(null);
    setResult(null);
    setStatus('idle');
  }, []);

  const setOrigin = useCallback((loc: GeoLocation | null, query?: string) => {
    setForm((f) => ({
      ...f,
      originLocation: loc,
      originQuery: query ?? loc?.displayName ?? f.originQuery,
    }));
    setResult(null);
    setStatus('idle');
  }, []);

  const setDestination = useCallback((loc: GeoLocation | null, query?: string) => {
    setForm((f) => ({
      ...f,
      destinationLocation: loc,
      destinationQuery: query ?? loc?.displayName ?? f.destinationQuery,
    }));
    setResult(null);
    setStatus('idle');
  }, []);

  const setOriginQuery = useCallback((q: string) => {
    setForm((f) => ({ ...f, originQuery: q, originLocation: null }));
  }, []);

  const setDestinationQuery = useCallback((q: string) => {
    setForm((f) => ({ ...f, destinationQuery: q, destinationLocation: null }));
  }, []);

  const calculate = useCallback(async () => {
    const { selectedCar, originLocation, destinationLocation } = form;

    if (!selectedCar || !originLocation || !destinationLocation) {
      setErrorMessage('Selecione um veículo, origem e destino.');
      setStatus('error');
      return;
    }

    if (departPct <= arrivePct) {
      setErrorMessage('A bateria de saída deve ser maior que a de chegada.');
      setStatus('error');
      return;
    }

    setStatus('routing');
    setErrorMessage(null);

    const originLatLng: [number, number] = [originLocation.lat, originLocation.lng];
    const destLatLng: [number, number] = [destinationLocation.lat, destinationLocation.lng];

    const routeData = await ors.calculate(originLatLng, destLatLng);

    if (!routeData) {
      setErrorMessage(ors.errorMessage ?? 'Erro ao calcular rota.');
      setStatus('error');
      return;
    }

    // Enriquece a base estática com chargers externos (OCM + OSM) em paralelo.
    // Ambas as chamadas são não-bloqueantes: falha silenciosa → usa apenas estáticos.
    const bbox = polylineBbox(routeData.polyline, chargerRadiusKm);
    const [ocmResults, osmResults] = await Promise.allSettled([
      fetchDcChargers(bbox, ocmApiKey),
      fetchOsmChargers(bbox),
    ]);
    const ocmChargers = ocmResults.status === 'fulfilled' ? ocmResults.value : [];
    const osmChargers = osmResults.status === 'fulfilled' ? osmResults.value : [];
    const allChargers = mergeChargerSources(ELETROPOSTOS, [...ocmChargers, ...osmChargers]);

    // Usa o range ajustado pelas condições para calcular as paradas
    const chargingStops = buildChargingStops(
      routeData.polyline,
      adjustedRangeKm,
      allChargers,
      chargerRadiusKm,
    );

    setResult({
      origin: originLocation,
      destination: destinationLocation,
      totalDistanceKm: routeData.totalDistanceKm,
      estimatedDurationMin: routeData.estimatedDurationMin,
      polyline: routeData.polyline,
      chargingStops,
      effectiveRangeKm: adjustedRangeKm,   // salva o valor ajustado no resultado
      car: selectedCar,
    });
    setStatus('ready');
  }, [form, ors, departPct, arrivePct, chargerRadiusKm, adjustedRangeKm]);

  const reset = useCallback(() => {
    setForm(initialForm());
    setStatus('idle');
    setErrorMessage(null);
    setResult(null);
    setCustomRangeKm(null);
    setCustomConsumptionKwh(null);
  }, []);

  return {
    form,
    status,
    errorMessage: errorMessage ?? ors.errorMessage,
    result,
    chargerRadiusKm,
    setChargerRadiusKm,
    departPct,
    setDepartPct,
    arrivePct,
    setArrivePct,
    baseConsumptionKwh,
    customConsumptionKwh,
    effectiveConsumptionKwh,
    setCustomConsumptionKwh,
    suggestedRangeKm,
    effectiveRangeKm,
    adjustedRangeKm,
    conditionsMultiplier,
    conditionTemp,
    conditionTerrain,
    conditionDriving,
    setConditionTemp,
    setConditionTerrain,
    setConditionDriving,
    customRangeKm,
    setCustomRangeKm,
    orsHasKey: ors.hasKey,
    orsApiKey: ors.apiKey,
    setOrsKey: ors.setKey,
    removeOrsKey: ors.removeKey,
    ocmApiKey,
    ocmHasKey: ocmApiKey.length > 0,
    setOcmKey,
    removeOcmKey,
    setSelectedCar,
    setOrigin,
    setDestination,
    setOriginQuery,
    setDestinationQuery,
    calculate,
    reset,
  };
}
