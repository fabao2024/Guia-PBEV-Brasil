/**
 * OpenStreetMap via Overpass API — descoberta de eletropostos DC.
 * Gratuito, sem chave. Timeout 15s; falha silenciosa (fallback para base estática).
 */

import type { Eletroposto, ConnectorType } from '../data/eletropostosData';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// IDs gerados dinamicamente: offset 200_000 para não colidir com estáticos (1-999) e OCM (100_001+)
const OSM_ID_OFFSET = 200_000;

// Subset de abreviações BR que o OSM pode omitir
const VALID_UF = new Set([
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
  'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
  'RO','RR','RS','SC','SE','SP','TO',
]);

const BR_FULL_TO_UF: Record<string, string> = {
  'Acre':'AC','Alagoas':'AL','Amapá':'AP','Amazonas':'AM','Bahia':'BA',
  'Ceará':'CE','Distrito Federal':'DF','Espírito Santo':'ES','Goiás':'GO',
  'Maranhão':'MA','Mato Grosso':'MT','Mato Grosso do Sul':'MS','Minas Gerais':'MG',
  'Pará':'PA','Paraíba':'PB','Paraná':'PR','Pernambuco':'PE','Piauí':'PI',
  'Rio de Janeiro':'RJ','Rio Grande do Norte':'RN','Rio Grande do Sul':'RS',
  'Rondônia':'RO','Roraima':'RR','Santa Catarina':'SC','São Paulo':'SP',
  'Sergipe':'SE','Tocantins':'TO',
};

interface OsmElement {
  type: 'node' | 'way';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function parseKw(s: string | undefined): number {
  if (!s) return 0;
  const m = s.match(/(\d+(?:\.\d+)?)\s*(k?w)/i);
  if (!m) return 0;
  const v = parseFloat(m[1]);
  return m[2].toLowerCase() === 'kw' ? Math.round(v) : Math.round(v / 1000);
}

function resolveUf(tags: Record<string, string>): string {
  const raw = tags['addr:state'] ?? '';
  const up = raw.toUpperCase();
  if (VALID_UF.has(up)) return up;
  return BR_FULL_TO_UF[raw] ?? '';
}

function resolveConnector(tags: Record<string, string>): ConnectorType | null {
  const ccs2 = 'socket:ccs2' in tags || 'socket:type2_combo' in tags;
  const chademo = 'socket:chademo' in tags;
  const tesla = 'socket:tesla_supercharger' in tags || 'socket:tesla_ccs' in tags;
  const gbt = 'socket:gb_t' in tags;

  if (ccs2 && chademo) return 'CCS2+CHAdeMO';
  if (ccs2) return 'CCS2';
  if (chademo) return 'CHAdeMO';
  if (tesla) return 'Supercharger';
  if (gbt) return 'GB/T';
  return null;
}

function toEletroposto(el: OsmElement, seqIdx: number): Eletroposto | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;

  const tags = el.tags ?? {};
  const connector = resolveConnector(tags);
  if (!connector) return null;

  // Potência DC máxima declarada
  const powerCandidates = [
    tags['socket:ccs2:output'],
    tags['socket:chademo:output'],
    tags['socket:tesla_supercharger:output'],
    tags['socket:gb_t:output'],
    tags['maxpower'],
    tags['charge:maxpower'],
  ];
  let maxKw = Math.max(0, ...powerCandidates.map(parseKw));
  if (maxKw < 30) {
    // Se não há dado de potência mas há conector DC, assume 30 kW mínimo
    if (maxKw === 0) maxKw = 30;
    else return null; // potência informada mas < 30 kW — provavelmente AC
  }

  return {
    id: OSM_ID_OFFSET + seqIdx,
    nome: tags.name ?? tags.brand ?? tags.operator ?? 'Eletroposto OSM',
    operador: tags.operator ?? tags.brand ?? tags.network ?? 'OSM',
    cidade: tags['addr:city'] ?? tags['addr:town'] ?? '',
    uf: resolveUf(tags),
    lat,
    lng: lon,
    potenciaDC: maxKw,
    conector: connector,
  };
}

/**
 * Busca eletropostos DC no OpenStreetMap via Overpass API.
 * Retorna array vazio em qualquer erro (não-bloqueante).
 */
export async function fetchOsmChargers(
  bbox: { south: number; north: number; west: number; east: number },
  signal?: AbortSignal,
): Promise<Eletroposto[]> {
  const { south, west, north, east } = bbox;
  const bboxStr = `${south.toFixed(5)},${west.toFixed(5)},${north.toFixed(5)},${east.toFixed(5)}`;

  const query =
    `[out:json][timeout:15];` +
    `(node["amenity"="charging_station"](${bboxStr});` +
    `way["amenity"="charging_station"](${bboxStr}););` +
    `out center tags;`;

  try {
    const timeout = AbortSignal.timeout(15_000);
    const sig = signal ? AbortSignal.any([signal, timeout]) : timeout;

    const resp = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: sig,
    });

    if (!resp.ok) return [];

    const data: { elements: OsmElement[] } = await resp.json();
    const results: Eletroposto[] = [];
    let idx = 0;

    for (const el of data.elements) {
      const ep = toEletroposto(el, idx++);
      if (ep) results.push(ep);
    }

    return results;
  } catch {
    return [];
  }
}
