/**
 * OpenChargeMap (OCM) — status e descoberta de eletropostos
 *
 * fetchChargersStatus: status de pontos já conhecidos (disponível/manutenção).
 * fetchDcChargers:     descobre todos os DC chargers numa bbox — expande a
 *                      cobertura do planejador com referências individuais.
 *
 * StatusTypeID relevantes:
 *   50  → Operational          → disponível
 *   75  → Operational (pago)   → disponível
 *  100  → Currently Unavailable → em manutenção
 *  150  → Planned               → em manutenção
 *  200  → Removed               → em manutenção
 *  null / outros                → desconhecido
 */

import type { Eletroposto } from '../data/eletropostosData';
import { importOcmCharger } from '../utils/chargerImport';
import { toRouteCharger } from '../utils/chargerCatalog';
import { clearSessionApiKey, resolveSessionApiKey, saveSessionApiKey } from '../utils/apiKeyStorage';

export type ChargerStatus = 'available' | 'maintenance' | 'unknown';

export interface OcmError { kind: 'unauthorized' | 'rate_limit' | 'network'; message: string }

const OCM_KEY_STORAGE = 'ocm-api-key';
const OCM_KEY_ENV = import.meta.env.DEV
  ? (import.meta.env.VITE_OCM_API_KEY as string | undefined)?.trim() ?? ''
  : '';
const OCM_BASE = 'https://api.openchargemap.io/v3/poi';

interface OcmConnection {
  ConnectionTypeID?: number;
  CurrentTypeID?: number;  // 30 = DC
  PowerKW?: number;
  ConnectionType?: { ID?: number; Title?: string };
  CurrentType?: { ID?: number };
}

interface OcmPoiFull {
  [key: string]: unknown;
  ID: number;
  AddressInfo: {
    Title: string;
    Town?: string;
    StateOrProvince?: string;
    Latitude: number;
    Longitude: number;
    CountryID?: number;
    Country?: { ID?: number };
  };
  DataProviderID?: number;
  DataProvider?: { ID?: number; Title?: string; License?: string; IsOpenDataLicensed?: boolean };
  OperatorID?: number;
  OperatorInfo?: { ID?: number; Title?: string };
  StatusType?: { ID: number };
  Connections?: OcmConnection[];
}

function ocmPoiToEletroposto(poi: OcmPoiFull): Eletroposto | null {
  const providerId = poi.DataProviderID ?? poi.DataProvider?.ID;
  // OCM's published contributor terms apply to provider 1; other feeds need explicit license metadata.
  const provider = providerId === 1
    ? { ID: 1, Title: 'Open Charge Map Contributors', IsOpenDataLicensed: true, License: 'CC BY 4.0' }
    : poi.DataProvider;
  const operatorId = poi.OperatorID ?? poi.OperatorInfo?.ID ?? 1;
  const connections = poi.Connections ?? [];
  const site = importOcmCharger({
    ...poi, DataProviderID: providerId, OperatorID: operatorId,
    AddressInfo: { ...poi.AddressInfo, CountryID: poi.AddressInfo?.CountryID ?? poi.AddressInfo?.Country?.ID },
    Connections: connections.map(connection => ({ ...connection,
      ConnectionTypeID: connection.ConnectionTypeID ?? connection.ConnectionType?.ID,
      CurrentTypeID: connection.CurrentTypeID ?? connection.CurrentType?.ID,
    })),
  }, {
    consultedAt: new Date().toISOString().slice(0, 10), providers: provider ? [provider] : [],
    operators: poi.OperatorInfo ? [{ ID: operatorId, Title: poi.OperatorInfo.Title }] : [],
    connectionTypes: connections.filter(connection => connection.ConnectionType?.Title).map(connection => ({
      ID: connection.ConnectionTypeID ?? connection.ConnectionType?.ID, Title: connection.ConnectionType!.Title,
    })),
  });
  return site ? toRouteCharger(site) : null;
}

export function resolveOcmKey(): string {
  return resolveSessionApiKey(OCM_KEY_STORAGE, OCM_KEY_ENV);
}

export function saveOcmKey(key: string): void {
  saveSessionApiKey(OCM_KEY_STORAGE, key);
}

export function clearOcmKey(): void {
  clearSessionApiKey(OCM_KEY_STORAGE);
}

function mapOcmStatus(statusId: number | null | undefined): ChargerStatus {
  if (!statusId) return 'unknown';
  if (statusId === 50 || statusId === 75) return 'available';
  if (statusId === 100 || statusId === 150 || statusId === 200) return 'maintenance';
  return 'unknown';
}

/** Equirectangular approximation — good enough for ≤ 300 m matching */
function approxDistKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * 111;
  const dLng = (lng2 - lng1) * 111 * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
  return Math.sqrt(dLat ** 2 + dLng ** 2);
}

interface OcmPoi {
  AddressInfo: { Latitude: number; Longitude: number };
  StatusType?: { ID: number };
}

// ─── Cache de POIs da última descoberta ──────────────────────────────────────
// Preenchido por fetchDcChargers; permite que o modal faça matching de status
// sem uma segunda chamada à API.
interface CachedPoi { lat: number; lng: number; statusId: number | null }
let _ocmPoiCache: CachedPoi[] = [];

/**
 * Faz matching de status para uma lista de chargers locais usando o cache
 * da última chamada fetchDcChargers. Síncrono — sem chamada de rede.
 * Retorna mapa vazio se o cache ainda não foi populado.
 */
export function matchStatusFromOcmCache(
  chargers: Array<{ id: number; lat: number; lng: number }>,
): Map<number, ChargerStatus> {
  if (_ocmPoiCache.length === 0) return new Map();
  const MATCH_KM = 0.3;
  const result = new Map<number, ChargerStatus>();
  for (const charger of chargers) {
    let best: ChargerStatus = 'unknown';
    let bestDist = MATCH_KM;
    for (const poi of _ocmPoiCache) {
      const d = approxDistKm(charger.lat, charger.lng, poi.lat, poi.lng);
      if (d < bestDist) { bestDist = d; best = mapOcmStatus(poi.statusId); }
    }
    result.set(charger.id, best);
  }
  return result;
}

/**
 * Busca status para uma lista de eletropostos locais via OCM.
 * Uma única requisição cobre toda a bounding box das paradas.
 * Retorna Map<localId, ChargerStatus>.
 */
export async function fetchChargersStatus(
  chargers: Array<{ id: number; lat: number; lng: number }>,
  apiKey: string,
  signal?: AbortSignal,
): Promise<Map<number, ChargerStatus>> {
  if (!apiKey || chargers.length === 0) return new Map();

  const lats = chargers.map((c) => c.lat);
  const lngs = chargers.map((c) => c.lng);
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

  // Diagonal do bounding box / 2 + 5 km de padding, máx 200 km (limite OCM)
  const halfDiag = approxDistKm(Math.min(...lats), Math.min(...lngs), Math.max(...lats), Math.max(...lngs)) / 2;
  const radiusKm = Math.min(Math.ceil(halfDiag) + 5, 200);

  const params = new URLSearchParams({
    output: 'json',
    countrycode: 'BR',
    latitude: String(centerLat),
    longitude: String(centerLng),
    distance: String(radiusKm),
    distanceunit: 'KM',
    maxresults: '300',
    levelid: '3',      // DC apenas
    compact: 'true',
    verbose: 'false',
    key: apiKey,
  });

  const timeout = AbortSignal.timeout(10_000);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeout])
    : timeout;

  const response = await fetch(`${OCM_BASE}?${params}`, { signal: combinedSignal });

  if (response.status === 401 || response.status === 403) {
    throw { kind: 'unauthorized', message: 'Chave OCM inválida.' } satisfies OcmError;
  }
  if (response.status === 429) {
    throw { kind: 'rate_limit', message: 'Limite OCM atingido — tente em alguns minutos.' } satisfies OcmError;
  }
  if (!response.ok) {
    throw { kind: 'network', message: `OCM ${response.status}` } satisfies OcmError;
  }

  const pois: OcmPoi[] = await response.json();

  // Associar cada eletroposto local ao POI OCM mais próximo (≤ 300 m)
  const MATCH_KM = 0.3;
  const result = new Map<number, ChargerStatus>();

  for (const charger of chargers) {
    let best: ChargerStatus = 'unknown';
    let bestDist = MATCH_KM;

    for (const poi of pois) {
      const d = approxDistKm(charger.lat, charger.lng, poi.AddressInfo.Latitude, poi.AddressInfo.Longitude);
      if (d < bestDist) {
        bestDist = d;
        best = mapOcmStatus(poi.StatusType?.ID);
      }
    }

    result.set(charger.id, best);
  }

  return result;
}

/**
 * Descobre todos os eletropostos DC na bbox da rota via OCM.
 * Retorna array vazio em qualquer erro (não-bloqueante).
 * Requer chave OCM válida; sem chave retorna vazio imediatamente.
 */
export async function fetchDcChargers(
  bbox: { south: number; north: number; west: number; east: number },
  apiKey: string,
  signal?: AbortSignal,
): Promise<Eletroposto[]> {
  if (!apiKey) return [];

  const centerLat = (bbox.south + bbox.north) / 2;
  const centerLng = (bbox.west + bbox.east) / 2;
  const halfDiagLat = (bbox.north - bbox.south) * 111 / 2;
  const halfDiagLng = (bbox.east - bbox.west) * 111 * Math.cos(centerLat * Math.PI / 180) / 2;
  const radiusKm = Math.min(Math.ceil(Math.sqrt(halfDiagLat ** 2 + halfDiagLng ** 2)) + 5, 500);

  const params = new URLSearchParams({
    output: 'json',
    countrycode: 'BR',
    latitude: String(centerLat),
    longitude: String(centerLng),
    distance: String(radiusKm),
    distanceunit: 'KM',
    maxresults: '500',
    levelid: '3',       // DC apenas
    compact: 'false',   // inclui Connections com PowerKW e ConnectionType
    verbose: 'false',
    key: apiKey,
  });

  try {
    const timeout = AbortSignal.timeout(12_000);
    const sig = signal ? AbortSignal.any([signal, timeout]) : timeout;

    const resp = await fetch(`${OCM_BASE}?${params}`, { signal: sig });
    if (resp.status === 401 || resp.status === 403) return [];
    if (!resp.ok) return [];

    const pois: OcmPoiFull[] = await resp.json();

    // Popula cache para uso síncrono de status no modal (evita segunda chamada)
    _ocmPoiCache = pois.map((p) => ({
      lat: p.AddressInfo.Latitude,
      lng: p.AddressInfo.Longitude,
      statusId: p.StatusType?.ID ?? null,
    }));

    return pois.flatMap((poi) => {
      const ep = ocmPoiToEletroposto(poi);
      return ep ? [ep] : [];
    });
  } catch {
    return [];
  }
}
