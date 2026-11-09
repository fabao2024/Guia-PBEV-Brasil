import type { ChargerLocation } from '../data/eletropostosData';
import type { MapCharger } from '../types/chargers';

export function validCoordinates(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function validDate(value?: string): boolean {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function locationStatus(charger: MapCharger): ChargerLocation['status'] {
  const evidence = charger.location;
  if (!evidence || evidence.status === 'unverified' || !validCoordinates(charger.lat, charger.lng)) return 'unverified';
  if (!evidence.source || !evidence.externalId || !validDate(evidence.consultedAt)) return 'unverified';
  try {
    if (new URL(evidence.sourceUrl ?? '').protocol !== 'https:') return 'unverified';
  } catch { return 'unverified'; }
  if (evidence.status === 'confirmed' && !validDate(evidence.verifiedAt)) return 'unverified';
  return evidence.status;
}

/** Evidence-backed does not mean operational, publicly accessible or field-verified. */
export function isLocatedCharger(charger: MapCharger): boolean {
  return locationStatus(charger) !== 'unverified';
}

/** Approximate locations get a text search, never a falsely precise coordinate destination. */
export function chargerMapsUrl(charger: MapCharger): string | null {
  const status = locationStatus(charger);
  if (status === 'unverified') return null;
  const query = status === 'confirmed'
    ? `${charger.lat},${charger.lng}`
    : [charger.nome, charger.address, charger.cidade, charger.uf, 'Brasil'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query })}`;
}
