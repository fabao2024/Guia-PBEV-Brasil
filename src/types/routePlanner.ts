import type { Car } from '../types';

/** Coordenada geográfica no formato Leaflet [lat, lng] */
export type LatLng = [number, number];

/** Status operacional de um eletroposto (via OCM) */
export type ChargerStatus = 'available' | 'maintenance' | 'unknown';

/** Localização resolvida pelo Nominatim */
export interface GeoLocation {
  displayName: string;
  lat: number;
  lng: number;
  placeId: number;
}

/** Sugestão de autocomplete antes de ser confirmada */
export interface GeoSuggestion {
  displayName: string;
  lat: number;
  lng: number;
  placeId: number;
  type: string;
}

/** Eletroposto próximo de uma parada de recarga */
export interface NearbyCharger {
  id: number;
  nome: string;
  operador: string;
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  potenciaDC: number;
  conector: string;
  distanceKm: number;
}

/** Parada de recarga planejada ao longo da rota */
export interface ChargingStop {
  index: number;                        // nº sequencial da parada (1-based)
  position: LatLng;                     // coordenadas do carregador selecionado (ou ponto limite em gap)
  distanceFromStartKm: number;          // distância acumulada desde a origem
  selectedCharger: NearbyCharger | null; // eletroposto escolhido pelo algoritmo (null = gap sem cobertura)
  nearbyChargers: NearbyCharger[];      // alternativas próximas ao selecionado
}

/** Resultado completo do planejamento de rota */
export interface RouteResult {
  origin: GeoLocation;
  destination: GeoLocation;
  totalDistanceKm: number;
  estimatedDurationMin: number;
  polyline: LatLng[];
  chargingStops: ChargingStop[];
  effectiveRangeKm: number; // range * 0.8
  car: Car;
}

/** Estado do formulário do planner */
export interface RoutePlannerForm {
  selectedCar: Car | null;
  originQuery: string;
  destinationQuery: string;
  originLocation: GeoLocation | null;
  destinationLocation: GeoLocation | null;
}

/** Estado global do hook orquestrador */
export type RoutePlannerStatus = 'idle' | 'routing' | 'ready' | 'error';

export interface RoutePlannerState {
  form: RoutePlannerForm;
  status: RoutePlannerStatus;
  errorMessage: string | null;
  result: RouteResult | null;
  orsApiKey: string;
  hasOrsKey: boolean;
}
