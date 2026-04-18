import { describe, it, expect } from 'vitest';
import {
  haversineKm,
  buildCumulativeDistances,
  segmentRoute,
  findNearbyChargers,
  buildChargingStops,
} from '../routeGeometry';
import type { LatLng } from '../../types/routePlanner';
import type { Eletroposto } from '../../data/eletropostosData';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const SP: LatLng = [-23.5505, -46.6333];
const RJ: LatLng = [-22.9068, -43.1729];

// Polyline simples de 4 pontos ao longo da Dutra (~360 km em linha reta)
const DUTRA_POLYLINE: LatLng[] = [
  [-23.5505, -46.6333], // SP capital
  [-23.2000, -45.9000], // São José dos Campos (~80 km)
  [-22.8000, -44.3000], // Resende (~240 km)
  [-22.9068, -43.1729], // Rio de Janeiro (~360 km)
];

// Eletroposto em São José dos Campos (próximo do ponto 1 da Dutra, ~80 km)
const CHARGER_SJC: Eletroposto = {
  id: 999,
  nome: 'Test Charger SJC',
  operador: 'TestOp',
  cidade: 'São José dos Campos',
  uf: 'SP',
  lat: -23.2100,
  lng: -45.8800,
  potenciaDC: 150,
  conector: 'CCS2',
};

// Eletroposto em Resende (próximo do ponto 2 da Dutra, ~240 km)
const CHARGER_RESENDE: Eletroposto = {
  id: 997,
  nome: 'Test Charger Resende',
  operador: 'TestOp',
  cidade: 'Resende',
  uf: 'RJ',
  lat: -22.8100,
  lng: -44.2900,
  potenciaDC: 100,
  conector: 'CCS2',
};

// Eletroposto distante (Manaus) — deve ser filtrado em qualquer rota BR-Sul
const CHARGER_MANAUS: Eletroposto = {
  id: 998,
  nome: 'Test Charger Manaus',
  operador: 'TestOp',
  cidade: 'Manaus',
  uf: 'AM',
  lat: -3.1190,
  lng: -60.0217,
  potenciaDC: 50,
  conector: 'CCS2',
};

// ─── haversineKm ─────────────────────────────────────────────────────────────

describe('haversineKm()', () => {
  it('retorna 0 para o mesmo ponto', () => {
    expect(haversineKm(SP, SP)).toBe(0);
  });

  it('calcula distância SP→RJ dentro de margem de 5%', () => {
    const dist = haversineKm(SP, RJ);
    expect(dist).toBeGreaterThan(340);
    expect(dist).toBeLessThan(375);
  });

  it('é simétrico (A→B = B→A)', () => {
    expect(haversineKm(SP, RJ)).toBeCloseTo(haversineKm(RJ, SP), 5);
  });

  it('retorna valor positivo para pontos diferentes', () => {
    expect(haversineKm(SP, RJ)).toBeGreaterThan(0);
  });
});

// ─── buildCumulativeDistances ─────────────────────────────────────────────────

describe('buildCumulativeDistances()', () => {
  it('primeiro elemento é sempre 0', () => {
    const cum = buildCumulativeDistances(DUTRA_POLYLINE);
    expect(cum[0]).toBe(0);
  });

  it('retorna array com mesmo tamanho da polyline', () => {
    const cum = buildCumulativeDistances(DUTRA_POLYLINE);
    expect(cum).toHaveLength(DUTRA_POLYLINE.length);
  });

  it('distâncias são monotonicamente crescentes', () => {
    const cum = buildCumulativeDistances(DUTRA_POLYLINE);
    for (let i = 1; i < cum.length; i++) {
      expect(cum[i]).toBeGreaterThan(cum[i - 1]);
    }
  });

  it('retorna [0] para polyline de 1 ponto', () => {
    const cum = buildCumulativeDistances([SP]);
    expect(cum).toEqual([0]);
  });

  it('retorna [0, d] para polyline de 2 pontos', () => {
    const cum = buildCumulativeDistances([SP, RJ]);
    expect(cum[0]).toBe(0);
    expect(cum[1]).toBeGreaterThan(0);
  });
});

// ─── segmentRoute ─────────────────────────────────────────────────────────────

describe('segmentRoute()', () => {
  it('retorna array vazio se a rota cabe em uma carga', () => {
    const stops = segmentRoute(DUTRA_POLYLINE, 9999);
    expect(stops).toHaveLength(0);
  });

  it('retorna array vazio para polyline com menos de 2 pontos', () => {
    expect(segmentRoute([SP], 200)).toHaveLength(0);
    expect(segmentRoute([], 200)).toHaveLength(0);
  });

  it('retorna array vazio com effectiveRange <= 0', () => {
    expect(segmentRoute(DUTRA_POLYLINE, 0)).toHaveLength(0);
    expect(segmentRoute(DUTRA_POLYLINE, -50)).toHaveLength(0);
  });

  it('gera ao menos 1 parada para rota longa com autonomia pequena', () => {
    const stops = segmentRoute(DUTRA_POLYLINE, 200);
    expect(stops.length).toBeGreaterThanOrEqual(1);
  });

  it('paradas têm índice sequencial começando em 1', () => {
    const stops = segmentRoute(DUTRA_POLYLINE, 100);
    stops.forEach((stop, i) => {
      expect(stop.index).toBe(i + 1);
    });
  });

  it('distanceFromStartKm aumenta entre paradas', () => {
    const stops = segmentRoute(DUTRA_POLYLINE, 100);
    for (let i = 1; i < stops.length; i++) {
      expect(stops[i].distanceFromStartKm).toBeGreaterThan(
        stops[i - 1].distanceFromStartKm,
      );
    }
  });

  it('cada parada respeita o intervalo de autonomia efetiva (polyline densa)', () => {
    // Polyline densa simulando ORS: 1 ponto a cada ~10 km ao longo de 600 km
    const dense: LatLng[] = Array.from({ length: 61 }, (_, i) => [
      -23.5505 + i * 0.09,
      -46.6333 + i * 0.04,
    ]);
    const effectiveRange = 150;
    const stops = segmentRoute(dense, effectiveRange);
    expect(stops.length).toBeGreaterThan(0);
    let prevDist = 0;
    for (const stop of stops) {
      const gap = stop.distanceFromStartKm - prevDist;
      expect(gap).toBeLessThanOrEqual(effectiveRange * 1.15);
      prevDist = stop.distanceFromStartKm;
    }
  });
});

// ─── findNearbyChargers ───────────────────────────────────────────────────────

describe('findNearbyChargers()', () => {
  const allChargers = [CHARGER_SJC, CHARGER_MANAUS];

  it('retorna eletroposto dentro do raio', () => {
    const result = findNearbyChargers([-23.2000, -45.9000], allChargers, 20);
    expect(result.some((c) => c.id === CHARGER_SJC.id)).toBe(true);
  });

  it('exclui eletroposto fora do raio', () => {
    const result = findNearbyChargers([-23.2000, -45.9000], allChargers, 20);
    expect(result.some((c) => c.id === CHARGER_MANAUS.id)).toBe(false);
  });

  it('retorna array vazio quando nenhum eletroposto está no raio', () => {
    const result = findNearbyChargers([0, 0], allChargers, 10);
    expect(result).toHaveLength(0);
  });

  it('inclui campo distanceKm no resultado', () => {
    const result = findNearbyChargers([-23.2000, -45.9000], allChargers, 20);
    for (const c of result) {
      expect(typeof c.distanceKm).toBe('number');
      expect(c.distanceKm).toBeGreaterThanOrEqual(0);
    }
  });

  it('ordena por distância ASC', () => {
    const near1: Eletroposto = { ...CHARGER_SJC, id: 1, lat: -23.2050, lng: -45.8850 };
    const near2: Eletroposto = { ...CHARGER_SJC, id: 2, lat: -23.2500, lng: -45.9500 };
    const result = findNearbyChargers([-23.2000, -45.9000], [near2, near1], 100);
    if (result.length >= 2) {
      expect(result[0].distanceKm).toBeLessThanOrEqual(result[1].distanceKm);
    }
  });

  it('respeita limite máximo de resultados', () => {
    const many: Eletroposto[] = Array.from({ length: 20 }, (_, i) => ({
      ...CHARGER_SJC,
      id: i,
      lat: -23.2000 + i * 0.001,
      lng: -45.9000 + i * 0.001,
    }));
    const result = findNearbyChargers([-23.2000, -45.9000], many, 500, 5);
    expect(result.length).toBeLessThanOrEqual(5);
  });
});

// ─── buildChargingStops (algoritmo guloso) ────────────────────────────────────

describe('buildChargingStops()', () => {
  it('retorna array vazio se rota cabe em uma carga', () => {
    const stops = buildChargingStops(DUTRA_POLYLINE, 9999, [CHARGER_SJC]);
    expect(stops).toHaveLength(0);
  });

  it('cada parada tem campo nearbyChargers', () => {
    const stops = buildChargingStops(DUTRA_POLYLINE, 100, [CHARGER_SJC, CHARGER_MANAUS]);
    for (const stop of stops) {
      expect(Array.isArray(stop.nearbyChargers)).toBe(true);
    }
  });

  it('nearbyChargers contém apenas eletropostos dentro do raio (30 km)', () => {
    const stops = buildChargingStops(DUTRA_POLYLINE, 100, [CHARGER_SJC, CHARGER_MANAUS], 30);
    for (const stop of stops) {
      for (const c of stop.nearbyChargers) {
        expect(c.distanceKm).toBeLessThanOrEqual(30);
      }
    }
  });

  it('paradas têm índice sequencial começando em 1', () => {
    const stops = buildChargingStops(DUTRA_POLYLINE, 100, [CHARGER_SJC], 30);
    stops.forEach((stop, i) => expect(stop.index).toBe(i + 1));
  });

  it('não cria parada desnecessária quando destino é alcançável após última parada', () => {
    // Rota ~360 km, range 200 km: 1 parada seria suficiente se houver carregador
    const stops = buildChargingStops(DUTRA_POLYLINE, 200, [CHARGER_SJC, CHARGER_RESENDE], 30);
    // Com guloso, a parada deve ser em Resende (~240 km) pois é a mais distante alcançável
    // a partir de 0 km com range de 200 km a partir de SJC (~80 km)
    expect(stops.length).toBeGreaterThanOrEqual(1);
    // Após a última parada, o restante deve caber em uma carga
    if (stops.length > 0) {
      const lastStop = stops[stops.length - 1];
      const dutraCumDists = [0, 80, 240, 360]; // aprox. km acumulados
      // distância até destino após última parada < 200 km (valor de range)
      expect(360 - lastStop.distanceFromStartKm).toBeLessThan(200);
    }
  });

  it('parada é posicionada próxima ao eletroposto quando há um na rota', () => {
    // Com range 200 km, SJC (~80 km) está no range mas Resende (~240 km) também
    // Guloso: deve parar em Resende (mais distante alcançável)
    const stops = buildChargingStops(DUTRA_POLYLINE, 250, [CHARGER_SJC, CHARGER_RESENDE], 30);
    if (stops.length > 0) {
      const firstStop = stops[0];
      // A parada deve incluir o carregador mais próximo
      expect(firstStop.nearbyChargers.length).toBeGreaterThan(0);
    }
  });

  it('sem eletropostos na rota: fallback para gap de cobertura', () => {
    // Nenhum eletroposto próximo à Dutra → paradas de cobertura com nearbyChargers vazio
    const stops = buildChargingStops(DUTRA_POLYLINE, 100, [CHARGER_MANAUS], 10);
    expect(stops.length).toBeGreaterThan(0);
    // Todos os stops devem ter nearbyChargers vazio (Manaus está longe)
    for (const stop of stops) {
      expect(stop.nearbyChargers).toHaveLength(0);
    }
  });

  it('retorna array vazio para polyline inválida', () => {
    expect(buildChargingStops([], 200, [CHARGER_SJC])).toHaveLength(0);
    expect(buildChargingStops([SP], 200, [CHARGER_SJC])).toHaveLength(0);
  });
});
