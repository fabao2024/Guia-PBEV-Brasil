import type { GeoSuggestion } from '../types/routePlanner';

const BASE_URL = 'https://nominatim.openstreetmap.org/search';
const TIMEOUT_MS = 6000;

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

/**
 * Busca sugestões de localização no Nominatim (OpenStreetMap), restrito ao Brasil.
 * Política: máximo 1 req/s — garantida pelo debounce de 600ms no hook chamador.
 * Lança erro em caso de timeout, resposta não-ok ou network failure.
 */
export async function searchLocation(
  query: string,
  signal?: AbortSignal,
): Promise<GeoSuggestion[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '5');
  url.searchParams.set('countrycodes', 'br');
  url.searchParams.set('accept-language', 'pt-BR');
  url.searchParams.set('addressdetails', '0');

  const timeoutSignal = AbortSignal.timeout(TIMEOUT_MS);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  const res = await fetch(url.toString(), {
    signal: combinedSignal,
    headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
  });

  if (!res.ok) {
    throw new Error(`Nominatim ${res.status}: ${res.statusText}`);
  }

  const data: NominatimResult[] = await res.json();

  return data.map((item) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    placeId: item.place_id,
    type: item.type,
  }));
}
