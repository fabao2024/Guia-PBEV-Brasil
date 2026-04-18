import type { LatLng } from '../types/routePlanner';

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
export const ORS_KEY_STORAGE = 'ors-api-key';
export const ORS_KEY_ENV = import.meta.env.VITE_ORS_API_KEY as string | undefined;

export interface ORSRouteResult {
  polyline: LatLng[];        // [lat, lng] — já invertido do GeoJSON [lng, lat]
  totalDistanceKm: number;
  estimatedDurationMin: number;
}

export type ORSErrorKind = 'unauthorized' | 'rate_limit' | 'network' | 'unknown';

export class ORSError extends Error {
  constructor(
    public kind: ORSErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'ORSError';
  }
}

/**
 * Resolve a chave ORS: variável de ambiente > localStorage.
 * Retorna string vazia se nenhuma chave está disponível.
 */
export function resolveOrsKey(): string {
  if (ORS_KEY_ENV) return ORS_KEY_ENV;
  try {
    return localStorage.getItem(ORS_KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

export function saveOrsKey(key: string): void {
  try {
    localStorage.setItem(ORS_KEY_STORAGE, key.trim());
  } catch { /* quota exceeded — falha silenciosa */ }
}

export function clearOrsKey(): void {
  try {
    localStorage.removeItem(ORS_KEY_STORAGE);
  } catch { /* silent */ }
}

/**
 * Calcula uma rota rodoviária entre dois pontos via OpenRouteService.
 *
 * Nota: ORS retorna coordenadas em [lng, lat] (GeoJSON padrão).
 * Esta função inverte para [lat, lng] (formato Leaflet / LatLng do projeto).
 *
 * Lança ORSError com `kind` diferenciado para 401/403, 429 e falhas de rede.
 */
export async function fetchRoute(
  origin: LatLng,
  destination: LatLng,
  apiKey: string,
): Promise<ORSRouteResult> {
  const body = {
    coordinates: [
      [origin[1], origin[0]],      // [lng, lat] — formato ORS
      [destination[1], destination[0]],
    ],
    instructions: false,
  };

  let res: Response;
  try {
    res = await fetch(ORS_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ORSError('network', 'Falha de rede ao calcular rota.');
  }

  if (res.status === 401 || res.status === 403) {
    throw new ORSError('unauthorized', 'Chave ORS inválida ou sem permissão.');
  }
  if (res.status === 429) {
    throw new ORSError('rate_limit', 'Limite de requisições ORS atingido.');
  }
  if (!res.ok) {
    throw new ORSError('unknown', `ORS retornou ${res.status}: ${res.statusText}`);
  }

  const geojson = await res.json();

  const feature = geojson?.features?.[0];
  if (!feature) {
    throw new ORSError('unknown', 'Resposta ORS sem features.');
  }

  // GeoJSON coordinates: [[lng, lat], ...] → inverter para [[lat, lng], ...]
  const polyline: LatLng[] = (
    feature.geometry.coordinates as [number, number][]
  ).map(([lng, lat]) => [lat, lng]);

  const summary = feature.properties?.summary ?? {};
  const totalDistanceKm = (summary.distance ?? 0) / 1000;
  const estimatedDurationMin = Math.round((summary.duration ?? 0) / 60);

  return { polyline, totalDistanceKm, estimatedDurationMin };
}
