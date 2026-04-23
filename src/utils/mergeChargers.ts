import type { Eletroposto } from '../data/eletropostosData';
import type { LatLng } from '../types/routePlanner';
import { haversineKm } from './routeGeometry';

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
 * Chargers dinâmicos dentro de `dedupeKm` de um estático são descartados.
 * Chargers dinâmicos entre si: o primeiro a chegar vence.
 */
export function mergeChargerSources(
  staticList: Eletroposto[],
  dynamicList: Eletroposto[],
  dedupeKm = 0.2,
): Eletroposto[] {
  if (dynamicList.length === 0) return staticList;

  const result: Eletroposto[] = [...staticList];

  for (const dyn of dynamicList) {
    const duplicate = result.some(
      (existing) =>
        haversineKm([existing.lat, existing.lng], [dyn.lat, dyn.lng]) <= dedupeKm,
    );
    if (!duplicate) result.push(dyn);
  }

  return result;
}
