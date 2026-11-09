import { ELETROPOSTOS, type Eletroposto } from '../data/eletropostosData';
import { chargerMapsUrl, isLocatedCharger, locationStatus } from '../utils/chargerLocations';
import { mergeChargerSources } from '../utils/mergeChargers';

const legacy = ELETROPOSTOS[0];
const sourced: Eletroposto = {
  ...legacy, id: -123, nome: 'Estação & teste',
  location: { status: 'approximate', source: 'OSM', sourceUrl: 'https://www.openstreetmap.org/node/123', externalId: 'node/123', consultedAt: '2026-11-09' },
};

it('quarantines all legacy claims without moving them to shopping/city centers', () => {
  expect(ELETROPOSTOS).toHaveLength(159);
  expect(ELETROPOSTOS.every(e => locationStatus(e) === 'unverified')).toBe(true);
  expect(ELETROPOSTOS.filter(isLocatedCharger)).toEqual([]);
  expect(ELETROPOSTOS.find(e => e.id === 13)).toMatchObject({ lat: -23.5966, lng: -46.6958 });
  expect(ELETROPOSTOS.find(e => e.id === 22)).toMatchObject({ lat: -22.8963, lng: -47.062 });
  expect(new Set(ELETROPOSTOS.map(e => e.id)).size).toBe(159);
});

it('requires traceable evidence and valid coordinates, not just a status label', () => {
  expect(isLocatedCharger(sourced)).toBe(true);
  expect(isLocatedCharger({ ...sourced, location: undefined })).toBe(false);
  expect(isLocatedCharger({ ...sourced, lat: NaN })).toBe(false);
  expect(isLocatedCharger({ ...sourced, lng: 181 })).toBe(false);
  expect(isLocatedCharger({ ...sourced, location: { ...sourced.location!, sourceUrl: 'javascript:alert(1)' } })).toBe(false);
  expect(isLocatedCharger({ ...sourced, location: { ...sourced.location!, consultedAt: '' } })).toBe(false);
  expect(locationStatus({ ...sourced, location: { ...sourced.location!, status: 'confirmed' } })).toBe('unverified');
});

it('never pins unverified or approximate coordinates as an exact navigation destination', () => {
  expect(chargerMapsUrl(legacy)).toBeNull();
  const search = new URL(chargerMapsUrl(sourced)!);
  expect(search.searchParams.get('query')).toBe(`${sourced.nome}, ${sourced.cidade}, ${sourced.uf}, Brasil`);
  expect(search.href).not.toContain('loc:');
  const confirmed = { ...sourced, location: { ...sourced.location!, status: 'confirmed' as const, verifiedAt: '2026-11-09' } };
  expect(chargerMapsUrl(confirmed)).toContain(`query=${confirmed.lat}%2C${confirmed.lng}`);
});

it('excludes legacy pins from routes even on API failure and does not mask sourced neighbors', () => {
  expect(mergeChargerSources(ELETROPOSTOS, [])).toEqual([]);
  expect(mergeChargerSources([legacy], [sourced])).toEqual([sourced]);
  expect(mergeChargerSources([], [{ ...sourced, location: undefined }])).toEqual([]);
  const confirmed = { ...sourced, id: 888, location: { ...sourced.location!, status: 'confirmed' as const, verifiedAt: '2026-11-09' } };
  expect(mergeChargerSources([sourced], [confirmed])).toEqual([confirmed]);
});
