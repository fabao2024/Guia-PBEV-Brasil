/**
 * OpenChargeMap (OCM) — status de eletropostos
 *
 * Faz UMA chamada por bounding-box cobrindo todas as paradas da rota,
 * depois associa cada eletroposto local ao POI OCM mais próximo (≤ 300 m).
 *
 * StatusTypeID relevantes:
 *   50  → Operational          → disponível
 *   75  → Operational (pago)   → disponível
 *  100  → Currently Unavailable → em manutenção
 *  150  → Planned               → em manutenção
 *  200  → Removed               → em manutenção
 *  null / outros                → desconhecido
 *
 * NOTA: OCM não expõe ocupação em tempo real para a maioria das redes
 * brasileiras (requer integração OCPI/EVSE-level com as operadoras).
 */

export type ChargerStatus = 'available' | 'maintenance' | 'unknown';

export interface OcmError { kind: 'unauthorized' | 'rate_limit' | 'network'; message: string }

const OCM_KEY_STORAGE = 'ocm-api-key';
const OCM_KEY_ENV = (import.meta.env.VITE_OCM_API_KEY as string | undefined)?.trim() ?? '';
const OCM_BASE = 'https://api.openchargemap.io/v3/poi';

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
