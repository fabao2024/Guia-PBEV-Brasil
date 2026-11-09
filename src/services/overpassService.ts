/** OpenStreetMap discovery includes AC, DC and locations with missing electrical details. */
import type { Eletroposto } from '../data/eletropostosData';
import type { MapCharger } from '../types/chargers';
import { importOsmCharger } from '../utils/chargerImport';
import { toRouteCharger } from '../utils/chargerCatalog';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export type OsmSearchResult =
  | { status: 'success'; stations: MapCharger[] }
  | { status: 'error'; reason: 'http' | 'network' | 'timeout' | 'invalid-response'; httpStatus?: number }
  | { status: 'aborted' };

/** User-triggered, bounded requests only. The local snapshot is the primary map data source. */
export async function searchOsmChargers(
  bbox: { south: number; north: number; west: number; east: number },
  signal?: AbortSignal,
): Promise<OsmSearchResult> {
  if (signal?.aborted) return { status: 'aborted' };
  const { south, west, north, east } = bbox;
  const bboxStr = `${south.toFixed(5)},${west.toFixed(5)},${north.toFixed(5)},${east.toFixed(5)}`;
  const query = '[out:json][timeout:15];area["ISO3166-1"="BR"]["admin_level"="2"]->.br;' +
    `nwr["amenity"="charging_station"](area.br)(${bboxStr});out center meta;`;
  try {
    const timeout = AbortSignal.timeout(15_000);
    const sig = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const response = await fetch(OVERPASS_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`, signal: sig,
    });
    if (!response.ok) return { status: 'error', reason: 'http', httpStatus: response.status };
    const data: { elements?: unknown[]; remark?: string } = await response.json();
    if (!Array.isArray(data?.elements) || data.remark) return { status: 'error', reason: 'invalid-response' };
    const consultedAt = new Date().toISOString().slice(0, 10);
    return { status: 'success', stations: data.elements.flatMap(element => {
      const site = importOsmCharger(element, consultedAt);
      return site ? [site] : [];
    }) };
  } catch (error) {
    if (signal?.aborted) return { status: 'aborted' };
    const name = error instanceof Error ? error.name : '';
    return { status: 'error', reason: name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'network' };
  }
}

/** Route planner retains its stricter DC >= 30 kW contract. */
export async function fetchOsmChargers(
  bbox: { south: number; north: number; west: number; east: number },
  signal?: AbortSignal,
): Promise<Eletroposto[]> {
  const result = await searchOsmChargers(bbox, signal);
  return result.status === 'success' ? result.stations.flatMap(site => {
    const routeCharger = toRouteCharger(site);
    return routeCharger ? [routeCharger] : [];
  }) : [];
}
