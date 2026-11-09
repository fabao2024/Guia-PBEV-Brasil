import ocm from '../data/ocmChargers.json';
import currentOcm from '../data/ocmCurrentChargers.json';
import { LOCAL_MAP_CHARGERS, LOCAL_ROUTE_CHARGERS, CHARGER_SOURCE_SUMMARIES } from '../data/localChargers';
import { SOURCED_CHARGERS } from '../data/sourcedChargers';
import { chargerCurrent, toRouteCharger } from '../utils/chargerCatalog';
import { locationStatus } from '../utils/chargerLocations';
import { selectChargerSnapshots } from '../utils/chargerCatalog';

it('includes the complete accepted OCM snapshot locally, not a seven-point sample or one station per socket', () => {
  expect(ocm.version).toBe(1);
  expect(ocm.counts.input).toBe(1298);
  expect(ocm.counts.accepted).toBe(1291);
  expect(ocm.counts.excluded).toBe(7);
  expect(ocm.stations).toHaveLength(ocm.counts.accepted);
  expect(LOCAL_MAP_CHARGERS.length).toBeGreaterThanOrEqual(ocm.stations.length);
  expect(new Set(LOCAL_MAP_CHARGERS.map(site => site.location?.sourceUrl)).size).toBe(LOCAL_MAP_CHARGERS.length);
  for (const site of SOURCED_CHARGERS) expect(LOCAL_MAP_CHARGERS.find(s => s.id === site.id)).toEqual(site);
  expect(CHARGER_SOURCE_SUMMARIES).toContainEqual({ id: 'Open Charge Map-archive', kind: 'archive', source: 'Open Charge Map', snapshotAt: '2026-04-22', retrievedAt: '2026-11-09', count: 1291 });
});

it('includes a current public-catalog sample without labelling its observation date as an installation/source-update date', () => {
  expect(currentOcm).toMatchObject({ scope: 'recent-listings', completeCountry: false, retrievedAt: '2026-11-09', snapshotAt: '2026-11-09', counts: { input: 100, accepted: 100 } });
  const oldIds = new Set([...ocm.stations.map(site => site.id), ...SOURCED_CHARGERS.map(site => site.id)]);
  expect(currentOcm.stations.filter(site => !oldIds.has(site.id))).toHaveLength(94);
  for (const source of currentOcm.stations) {
    expect(LOCAL_MAP_CHARGERS.some(site => site.id === source.id)).toBe(true);
    expect(source.location).not.toHaveProperty('sourceUpdatedAt');
    expect(source.location).not.toHaveProperty('verifiedAt');
  }
  expect(currentOcm.stations.find(site => site.location.externalId === '513822')).toMatchObject({ potenciaDC: 60, location: { license: 'CC0', attribution: 'Multcharge' } });
  expect(currentOcm.stations.find(site => site.location.externalId === '513761')).toMatchObject({ potenciaDC: 40, uf: 'RO' });
  expect(currentOcm.stations.find(site => site.location.externalId === '513709')).toMatchObject({ potenciaDC: null, connections: [{ current: 'AC', powerKw: 7 }] });
});

it('uses an authorized complete current OCM country snapshot instead of reviving obsolete archive/manual records', () => {
  const archive = { source: 'Open Charge Map', stations: [SOURCED_CHARGERS[0]], snapshotAt: '2026-04-22', retrievedAt: '2026-11-09' };
  const recent = { ...archive, scope: 'recent-listings' as const, completeCountry: false, stations: [SOURCED_CHARGERS[1]], snapshotAt: '2026-11-09' };
  expect(selectChargerSnapshots(archive, [recent])).toEqual([archive, recent]);
  const full = { ...recent, scope: 'country' as const, completeCountry: true };
  expect(selectChargerSnapshots(archive, [full])).toEqual([full]);
  expect(() => selectChargerSnapshots(archive, [{ ...recent, completeCountry: true }])).toThrow();
});

it('preserves the distinction between export date, source update, retrieval and physical verification', () => {
  const licenses = new Set(['CC BY 4.0', 'CC0', 'ODbL 1.0']);
  const allowedFields = new Set(['id', 'nome', 'operador', 'cidade', 'uf', 'lat', 'lng', 'potenciaDC', 'conector', 'address', 'connections', 'reportedPoints', 'access', 'usage', 'reportedStatus', 'location']);
  for (const site of LOCAL_MAP_CHARGERS) {
    expect(locationStatus(site)).toBe('approximate');
    expect(site.location?.verifiedAt).toBeUndefined();
    expect(licenses.has(site.location?.license ?? '')).toBe(true);
    expect(site.location?.attribution).toBeTruthy();
    expect(site.location?.consultedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Object.keys(site).every(key => allowedFields.has(key))).toBe(true);
  }
});

it('ships AC, DC, mixed and unknown locations and keeps UF gaps explicit rather than guessing cities', () => {
  expect(new Set(LOCAL_MAP_CHARGERS.map(chargerCurrent))).toEqual(new Set(['AC', 'DC', 'mixed', 'unknown']));
  expect(ocm.counts.byUf.unknown).toBe(ocm.stations.filter(site => !site.uf).length);
  expect(Object.values(ocm.counts.byCurrent).reduce((sum, count) => sum + count, 0)).toBe(ocm.stations.length);
});

it('keeps route candidates separate: no AC, unknown capacity/access, unavailable or stale source records', () => {
  expect(LOCAL_ROUTE_CHARGERS.length).toBeGreaterThan(SOURCED_CHARGERS.length);
  expect(LOCAL_ROUTE_CHARGERS.length).toBeLessThan(LOCAL_MAP_CHARGERS.length);
  for (const site of LOCAL_ROUTE_CHARGERS) {
    expect(site.potenciaDC).toBeGreaterThanOrEqual(30);
    expect(toRouteCharger(site)).not.toBeNull();
  }
});
