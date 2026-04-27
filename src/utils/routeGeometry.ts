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

// ─── Main: build charging stops (greedy furthest-reachable + SOC tracking) ───

/**
 * Calcula as paradas de recarga ao longo da rota usando algoritmo guloso com
 * rastreamento real de SoC:
 *
 * 1. Projeta todos os eletropostos dentro de `radiusKm` da polyline.
 * 2. A cada iteração, calcula o alcance real com o SoC atual e seleciona o
 *    eletroposto mais distante que ainda é alcançável.
 * 3. Look-ahead: calcula quanto carregar (mínimo para o próximo trecho).
 *    Se o carro já tem SoC suficiente para o próximo passo → passa sem parar.
 * 4. Só cria uma parada quando o carro PRECISA carregar — elimina paradas de
 *    poucos minutos causadas por chargers próximos.
 * 5. Se o delta de recarga calculado for menor que `minUsefulSocDelta`, carrega
 *    até `departPct` para evitar paradas de poucos minutos (overhead real ≈ 8 min).
 * 6. Gap de cobertura: cria parada de aviso no limite do alcance real.
 *
 * `departPct` / `arrivePct`: SoC de saída e reserva mínima de chegada (%).
 * `effectiveRangeKm`: distância de departPct até arrivePct nas condições atuais.
 * `minUsefulSocDelta`: delta mínimo de SoC que justifica parar (0 = desabilitado).
 */
export function buildChargingStops(
  polyline: LatLng[],
  effectiveRangeKm: number,
  chargers: Eletroposto[],
  radiusKm = 10,
  departPct = 80,
  arrivePct = 15,
  minUsefulSocDelta = 0,
): ChargingStop[] {
  if (polyline.length < 2 || effectiveRangeKm <= 0) return [];

  const cumDists = buildCumulativeDistances(polyline);
  const totalKm = cumDists[cumDists.length - 1];

  if (totalKm <= effectiveRangeKm) return [];

  const consumptionPctPerKm = (departPct - arrivePct) / effectiveRangeKm;
  const projected = projectChargersOntoRoute(polyline, cumDists, chargers, radiusKm);

  // Greedy furthest-reachable dentro de maxReachKm a partir de fromDist
  const greedyBest = (fromDist: number, maxReachKm: number): ChargerProjection | null => {
    const candidates = projected.filter(
      (p) => p.routeDistKm > fromDist + 0.5 && p.routeDistKm <= fromDist + maxReachKm,
    );
    if (candidates.length === 0) return null;
    return candidates.reduce((a, b) =>
      (b.routeDistKm - b.lateralDistKm * 2) > (a.routeDistKm - a.lateralDistKm * 2) ? b : a,
    );
  };

  // SoC mínimo de saída para cobrir nextKm com reserva arrivePct
  const minDepartSoc = (nextKm: number): number =>
    Math.min(departPct, Math.max(arrivePct, Math.ceil(arrivePct + nextKm * consumptionPctPerKm)));

  const stops: ChargingStop[] = [];
  let currentDist = 0;
  let currentSocPct = departPct;
  let stopIndex = 1;

  // Cap de segurança contra loop infinito em edges exóticos
  const maxIter = Math.ceil(totalKm / 5) + 20;

  for (let iter = 0; iter < maxIter; iter++) {
    const remainingRangeKm = (currentSocPct - arrivePct) / consumptionPctPerKm;

    if (currentDist + remainingRangeKm >= totalKm) break; // destino alcançável

    const best = greedyBest(currentDist, remainingRangeKm);

    if (!best) {
      // ─── Gap de cobertura ────────────────────────────────────────────────────
      const gapDist = currentDist + remainingRangeKm;
      const limitIdx = findPolylineIndexAtDist(cumDists, gapDist);
      const stopPos = polyline[limitIdx];
      const gapNearby = findNearbyChargers(stopPos, chargers, radiusKm);
      stops.push({
        index: stopIndex++,
        position: stopPos,
        distanceFromStartKm: gapDist,
        selectedCharger: gapNearby[0] ?? null,
        nearbyChargers: gapNearby.slice(1),
        arrivalSocPct: Math.round(arrivePct),
        departureSocPct: Math.round(departPct), // gap: assume recarga completa
      });
      currentDist = gapDist;
      currentSocPct = departPct;
      continue;
    }

    // SoC real ao chegar neste carregador
    const segmentKm = best.routeDistKm - currentDist;
    const arrivalSocPct = currentSocPct - segmentKm * consumptionPctPerKm;

    // Look-ahead: quanto carregar aqui para o próximo trecho?
    // Usa alcance máximo (departPct) para encontrar o próximo passo planejado
    const distToEnd = totalKm - best.routeDistKm;
    const nextBest = distToEnd > effectiveRangeKm
      ? greedyBest(best.routeDistKm, effectiveRangeKm)
      : null;
    const nextSegmentKm = nextBest
      ? nextBest.routeDistKm - best.routeDistKm
      : Math.min(distToEnd, effectiveRangeKm);
    let departureSocPct = minDepartSoc(nextSegmentKm);

    // Se a recarga necessária é menor que o mínimo útil, carrega até departPct.
    // Evita paradas de poucos minutos que não compensam o overhead de parar.
    if (minUsefulSocDelta > 0 && (departureSocPct - Math.max(0, arrivalSocPct)) < minUsefulSocDelta) {
      departureSocPct = departPct;
    }

    // Se o SoC de chegada já cobre o próximo trecho → passa sem parar
    if (arrivalSocPct >= departureSocPct) {
      currentSocPct = arrivalSocPct;
      currentDist = best.routeDistKm;
      continue;
    }

    // ─── Parada necessária ───────────────────────────────────────────────────
    const stopPosition = polyline[best.polylineIdx];
    const selectedCharger: NearbyCharger = {
      id: best.charger.id,
      nome: best.charger.nome,
      operador: best.charger.operador,
      cidade: best.charger.cidade,
      uf: best.charger.uf,
      lat: best.charger.lat,
      lng: best.charger.lng,
      potenciaDC: best.charger.potenciaDC,
      conector: best.charger.conector,
      distanceKm: best.lateralDistKm,
    };
    const nearbyChargers = findNearbyChargers(stopPosition, chargers, radiusKm)
      .filter((c) => c.id !== best.charger.id);

    stops.push({
      index: stopIndex++,
      position: stopPosition,
      distanceFromStartKm: best.routeDistKm,
      selectedCharger,
      nearbyChargers,
      arrivalSocPct: Math.max(0, Math.round(arrivalSocPct)),
      departureSocPct: Math.round(departureSocPct),
    });

    currentSocPct = departureSocPct;
    currentDist = best.routeDistKm;
  }

  return stops;
}
