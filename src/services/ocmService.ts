/**
 * OpenChargeMap (OCM) — status e descoberta de eletropostos
 *
 * fetchChargersStatus: status de pontos já conhecidos (disponível/manutenção).
 * fetchDcChargers:     descobre todos os DC chargers numa bbox — expande a
 *                      cobertura do planejador além da base estática de 160 pontos.
 *
 * StatusTypeID relevantes:
 *   50  → Operational          → disponível
 *   75  → Operational (pago)   → disponível
 *  100  → Currently Unavailable → em manutenção
 *  150  → Planned               → em manutenção
 *  200  → Removed               → em manutenção
 *  null / outros                → desconhecido
 */

import type { Eletroposto, ConnectorType } from '../data/eletropostosData';

export type ChargerStatus = 'available' | 'maintenance' | 'unknown';

export interface OcmError { kind: 'unauthorized' | 'rate_limit' | 'network'; message: string }

const OCM_KEY_STORAGE = 'ocm-api-key';
const OCM_KEY_ENV = (import.meta.env.VITE_OCM_API_KEY as string | undefined)?.trim() ?? '';
const OCM_BASE = 'https://api.openchargemap.io/v3/poi';

// IDs dinâmicos OCM: offset para não colidir com estáticos (1-999)
const OCM_ID_OFFSET = 100_000;

const BR_FULL_TO_UF: Record<string, string> = {
  'Acre':'AC','Alagoas':'AL','Amapá':'AP','Amazonas':'AM','Bahia':'BA',
  'Ceará':'CE','Distrito Federal':'DF','Espírito Santo':'ES','Goiás':'GO',
  'Maranhão':'MA','Mato Grosso':'MT','Mato Grosso do Sul':'MS','Minas Gerais':'MG',
  'Pará':'PA','Paraíba':'PB','Paraná':'PR','Pernambuco':'PE','Piauí':'PI',
  'Rio de Janeiro':'RJ','Rio Grande do Norte':'RN','Rio Grande do Sul':'RS',
  'Rondônia':'RO','Roraima':'RR','Santa Catarina':'SC','São Paulo':'SP',
  'Sergipe':'SE','Tocantins':'TO',
};

const VALID_UF = new Set(Object.values(BR_FULL_TO_UF));

function resolveUf(province: string | undefined): string {
  if (!province) return '';
  const up = province.toUpperCase();
  if (VALID_UF.has(up)) return up;
  return BR_FULL_TO_UF[province] ?? '';
}

interface OcmConnection {
  CurrentTypeID?: number;  // 30 = DC
  PowerKW?: number;
  ConnectionType?: { Title?: string };
}

interface OcmPoiFull {
  ID: number;
  AddressInfo: {
    Title: string;
    Town?: string;
    StateOrProvince?: string;
    Latitude: number;
    Longitude: number;
  };
  OperatorInfo?: { Title?: string };
  StatusType?: { ID: number };
  Connections?: OcmConnection[];
}

function ocmConnectorType(connections: OcmConnection[]): ConnectorType | null {
  const dcConns = connections.filter((c) => c.CurrentTypeID === 30);
  if (dcConns.length === 0) return null;

  let hasCcs2 = false;
  let hasChademo = false;
  let hasTesla = false;
  let hasGbt = false;

  for (const c of dcConns) {
    const t = (c.ConnectionType?.Title ?? '').toLowerCase();
    if (t.includes('ccs') || t.includes('type 2 combo') || t.includes('iec 62196-3')) hasCcs2 = true;
    if (t.includes('chademo')) hasChademo = true;
    if (t.includes('tesla')) hasTesla = true;
    if (t.includes('gb/t')) hasGbt = true;
  }

  if (hasCcs2 && hasChademo) return 'CCS2+CHAdeMO';
  if (hasCcs2) return 'CCS2';
  if (hasChademo) return 'CHAdeMO';
  if (hasTesla) return 'Supercharger';
  if (hasGbt) return 'GB/T';
  return 'CCS2'; // fallback para DC sem tipo explícito
}

function ocmPoiToEletroposto(poi: OcmPoiFull): Eletroposto | null {
  const { ID, AddressInfo, OperatorInfo, Connections } = poi;
  if (!Connections || Connections.length === 0) return null;

  const connector = ocmConnectorType(Connections);
  if (!connector) return null;

  const dcConns = Connections.filter((c) => c.CurrentTypeID === 30);
  const maxKw = Math.max(0, ...dcConns.map((c) => c.PowerKW ?? 0));
  if (maxKw < 30 && maxKw !== 0) return null; // potência informada mas < 30 kW

  return {
    id: OCM_ID_OFFSET + ID,
    nome: AddressInfo.Title,
    operador: OperatorInfo?.Title ?? 'OCM',
    cidade: AddressInfo.Town ?? '',
    uf: resolveUf(AddressInfo.StateOrProvince),
    lat: AddressInfo.Latitude,
    lng: AddressInfo.Longitude,
    potenciaDC: maxKw > 0 ? maxKw : 30,
    conector: connector,
  };
}

export function resolveOcmKey(): string {
  return OCM_KEY_ENV || (localStorage.getItem(OCM_KEY_STORAGE) ?? '');
}

export function saveOcmKey(key: string): void {
  localStorage.setItem(OCM_KEY_STORAGE, key.trim());
}

export function clearOcmKey(): void {
  localStorage.removeItem(OCM_KEY_STORAGE);
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
