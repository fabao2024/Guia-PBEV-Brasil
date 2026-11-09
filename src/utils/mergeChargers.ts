import type { Eletroposto } from '../data/eletropostosData';
import type { LatLng } from '../types/routePlanner';
import { haversineKm } from './routeGeometry';
import { isLocatedCharger, locationStatus } from './chargerLocations';

/**
 * Bounding box da polyline + padding em km.
 * Usado para delimitar a área de busca de eletropostos externos.
 */
export function polylineBbox(
  polyline: LatLng[],
  paddingKm: number,
): { south: number; north: number; west: number; east: number } {
  const pad = paddingKm / 111;
  const lats = polyline.map((p) => p[0]);
  const lngs = polyline.map((p) => p[1]);
  return {
    south: Math.min(...lats) - pad,
    north: Math.max(...lats) + pad,
    west:  Math.min(...lngs) - pad,
    east:  Math.max(...lngs) + pad,
  };
}

/**
 * Funde listas dinâmicas (OCM, OSM) com a base estática.
 * Exclui registros sem evidência. Posições confirmadas precedem as aproximadas;
 * depois vale a consulta mais recente; resultados dinâmicos desempatam no mesmo dia.
 */
export function mergeChargerSources(
  staticList: Eletroposto[],
  dynamicList: Eletroposto[],
  dedupeKm = 0.2,
): Eletroposto[] {
  const candidates = [...dynamicList, ...staticList].filter(isLocatedCharger)
    .sort((a, b) => Number(locationStatus(b) === 'confirmed') - Number(locationStatus(a) === 'confirmed') ||
      (b.location!.consultedAt ?? '').localeCompare(a.location!.consultedAt ?? ''));
  const result: Eletroposto[] = [];

  for (const dyn of candidates) {
    const duplicate = result.some(
      (existing) =>
        (existing.id === dyn.id || (existing.location?.sourceUrl === dyn.location?.sourceUrl)) ||
        haversineKm([existing.lat, existing.lng], [dyn.lat, dyn.lng]) <= dedupeKm,
    );
    if (!duplicate) result.push(dyn);
  }

  return result;
}
