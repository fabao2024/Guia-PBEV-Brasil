import type { Eletroposto } from '../data/eletropostosData';
import type { LatLng, NearbyCharger, ChargingStop } from '../types/routePlanner';

const EARTH_RADIUS_KM = 6371;

/** Distância em km entre dois pontos usando a fórmula haversine. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Pré-computa distâncias acumuladas (km) ao longo de uma polyline.
 * O índice 0 vale sempre 0; índice i = soma das distâncias dos segmentos 0..i-1.
 */
export function buildCumulativeDistances(polyline: LatLng[]): number[] {
  const cum: number[] = new Array(polyline.length).fill(0);
  for (let i = 1; i < polyline.length; i++) {
    cum[i] = cum[i - 1] + haversineKm(polyline[i - 1], polyline[i]);
  }
  return cum;
}

/**
 * Segmenta a rota em trechos de até `effectiveRangeKm` (algoritmo geométrico puro,
 * sem considerar onde estão os eletropostos).
 * Usado internamente como fallback quando não há eletropostos na rota.
 * Retorna array vazio se a rota cabe em uma carga.
 */
export function segmentRoute(
  polyline: LatLng[],
  effectiveRangeKm: number,
): Omit<ChargingStop, 'nearbyChargers'>[] {
  if (polyline.length < 2 || effectiveRangeKm <= 0) return [];

  const cum = buildCumulativeDistances(polyline);
  const totalKm = cum[cum.length - 1];

  if (totalKm <= effectiveRangeKm) return [];

  const stops: Omit<ChargingStop, 'nearbyChargers'>[] = [];
  let nextThreshold = effectiveRangeKm;
  let stopIndex = 1;

  for (let i = 1; i < polyline.length; i++) {
    if (cum[i] >= nextThreshold) {
      const safeIndex = i - 1 > 0 ? i - 1 : i;
      stops.push({
        index: stopIndex++,
        position: polyline[safeIndex],
        distanceFromStartKm: cum[safeIndex],
      });
      nextThreshold = cum[safeIndex] + effectiveRangeKm;
      if (totalKm - cum[safeIndex] <= effectiveRangeKm) break;
    }
  }

  return stops;
}

/**
 * Encontra eletropostos dentro de `radiusKm` de um ponto.
 * Ordenados por distância ASC, depois por potência DC DESC.
 * Limitado a `maxResults` resultados.
 */
export function findNearbyChargers(
  point: LatLng,
  chargers: Eletroposto[],
  radiusKm = 10,
  maxResults = 5,
): NearbyCharger[] {
  return chargers
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      operador: c.operador,
      cidade: c.cidade,
      uf: c.uf,
      lat: c.lat,
      lng: c.lng,
      potenciaDC: c.potenciaDC,
      conector: c.conector,
      distanceKm: haversineKm(point, [c.lat, c.lng]),
    }))
    .filter((c) => c.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm || b.potenciaDC - a.potenciaDC)
    .slice(0, maxResults);
}

// ─── Internal: project chargers onto route ────────────────────────────────────

interface ChargerProjection {
  charger: Eletroposto;
  routeDistKm: number;   // distância acumulada no ponto da polyline mais próximo
  lateralDistKm: number; // distância lateral eletroposto → polyline
  polylineIdx: number;
}

/**
 * Para cada eletroposto dentro de `radiusKm` de qualquer ponto da polyline,
 * retorna sua posição projetada (distância de rota).
 *
 * Usa pré-filtro de bounding box para reduzir iterações:
 * só testa eletropostos dentro do envelope geográfico da rota + radiusKm.
 */
function projectChargersOntoRoute(
  polyline: LatLng[],
  cumDists: number[],
  chargers: Eletroposto[],
  radiusKm: number,
): ChargerProjection[] {
  // Bounding box da polyline com buffer = radiusKm em graus (aprox.)
  const buffer = (radiusKm / 111) * 1.2;
  const latMin = Math.min(...polyline.map((p) => p[0])) - buffer;
  const latMax = Math.max(...polyline.map((p) => p[0])) + buffer;
  const lngMin = Math.min(...polyline.map((p) => p[1])) - buffer;
  const lngMax = Math.max(...polyline.map((p) => p[1])) + buffer;

  const candidates = chargers.filter(
    (c) => c.lat >= latMin && c.lat <= latMax && c.lng >= lngMin && c.lng <= lngMax,
  );

  const result: ChargerProjection[] = [];

  for (const charger of candidates) {
    let bestDist = Infinity;
    let bestIdx = -1;

    for (let i = 0; i < polyline.length; i++) {
      const d = haversineKm(polyline[i], [charger.lat, charger.lng]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0 && bestDist <= radiusKm) {
      result.push({
        charger,
        routeDistKm: cumDists[bestIdx],
        lateralDistKm: bestDist,
        polylineIdx: bestIdx,
      });
    }
  }

  // Ordena por posição na rota
  return result.sort((a, b) => a.routeDistKm - b.routeDistKm);
}

/** Retorna o índice da polyline mais próximo de `targetKm` (busca binária). */
function findPolylineIndexAtDist(cumDists: number[], targetKm: number): number {
  let lo = 0;
  let hi = cumDists.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumDists[mid] < targetKm) lo = mid + 1;
    else hi = mid;
  }
  return Math.min(lo, cumDists.length - 1);
}

// ─── Main: build charging stops (greedy furthest-reachable) ──────────────────

/**
 * Calcula as paradas de recarga ao longo da rota usando algoritmo guloso:
 *
 * 1. Projeta todos os eletropostos dentro de `radiusKm` da polyline.
 * 2. A cada iteração, seleciona o eletroposto mais distante que ainda é
 *    alcançável com a autonomia restante → minimiza o número de paradas.
 * 3. A parada é criada NO eletroposto (não num ponto matemático arbitrário).
 * 4. Se não houver eletroposto alcançável (gap real de cobertura), cria uma
 *    parada de aviso no limite do range para informar o usuário.
 *
 * Resultado: drasticamente menos "Nenhum eletroposto DC em X km".
 */
export function buildChargingStops(
  polyline: LatLng[],
  effectiveRangeKm: number,
  chargers: Eletroposto[],
  radiusKm = 10,
): ChargingStop[] {
  if (polyline.length < 2 || effectiveRangeKm <= 0) return [];

  const cumDists = buildCumulativeDistances(polyline);
  const totalKm = cumDists[cumDists.length - 1];

  if (totalKm <= effectiveRangeKm) return [];

  // Todos os eletropostos projetados sobre a rota, ordenados por distância de rota
  const projected = projectChargersOntoRoute(polyline, cumDists, chargers, radiusKm);

  const stops: ChargingStop[] = [];
  let currentDist = 0;  // posição atual na rota (km desde a origem)
  let stopIndex = 1;

  while (currentDist + effectiveRangeKm < totalKm) {
    const reachableLimit = currentDist + effectiveRangeKm;

    // Eletropostos alcançáveis a partir da posição atual
    // (à frente por pelo menos 500m para não ficar preso no mesmo ponto)
    const reachable = projected.filter(
      (p) => p.routeDistKm > currentDist + 0.5 && p.routeDistKm <= reachableLimit,
    );

    if (reachable.length === 0) {
      // ─── Gap de cobertura real ───────────────────────────────────────────────
      // Nenhum eletroposto na rota dentro do range. Posiciona a parada no
      // limite da autonomia e busca radialmente (pode ainda achar algum).
      const limitIdx = findPolylineIndexAtDist(cumDists, reachableLimit);
      const stopPos = polyline[limitIdx];
      stops.push({
        index: stopIndex++,
        position: stopPos,
        distanceFromStartKm: reachableLimit,
        nearbyChargers: findNearbyChargers(stopPos, chargers, radiusKm),
      });
      currentDist = reachableLimit;
    } else {
      // ─── Parada no eletroposto mais distante alcançável (guloso) ────────────
      const best = reachable[reachable.length - 1];

      // Busca todos os eletropostos próximos ao ponto da parada para mostrar opções
      const nearbyChargers = findNearbyChargers(
        [best.charger.lat, best.charger.lng],
        chargers,
        radiusKm,
      );

      stops.push({
        index: stopIndex++,
        position: polyline[best.polylineIdx],
        distanceFromStartKm: best.routeDistKm,
        nearbyChargers,
      });
      currentDist = best.routeDistKm;
    }
  }

  return stops;
}
