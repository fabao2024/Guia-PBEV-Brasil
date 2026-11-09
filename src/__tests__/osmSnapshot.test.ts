import osm from '../data/osmChargers.json';
import type { MapCharger } from '../types/chargers';
import { CHARGER_SOURCE_SUMMARIES, LOCAL_MAP_CHARGERS } from '../data/localChargers';
import { importOsmCharger } from '../utils/chargerImport';

it('ships the checksum-verified November OSM selection with distinct extract and consultation dates', () => {
  expect(osm).toMatchObject({ version: 1, source: 'OpenStreetMap', scope: 'country', completeCountry: true,
    snapshotAt: '2026-11-08', retrievedAt: '2026-11-09',
    upstreamUrl: 'https://download.geofabrik.de/south-america/brazil-261108.osm.pbf',
    sourceChecksum: 'e0076a91afd957aa8f18318be6185356' });
  expect(osm.dataUntil).toMatch(/^2026-11-08T/);
  expect(osm.counts).toMatchObject({ input: 407, accepted: 396, excluded: 11,
    byCurrent: { AC: 25, DC: 29, mixed: 4, unknown: 338 },
    byAccess: { customers: 29, public: 92, unknown: 275 } });
  expect(osm.stations.filter(site => site.location.positionMethod === 'area-center')).toHaveLength(33);
  expect(osm.stations.filter(site => site.location.positionMethod === 'source-point')).toHaveLength(363);
  expect(osm.stations).toHaveLength(osm.counts.accepted);
  expect(osm.counts.accepted + osm.counts.excluded).toBe(osm.counts.input);
  expect(CHARGER_SOURCE_SUMMARIES).toContainEqual(expect.objectContaining({ source: 'OpenStreetMap', kind: 'extract', snapshotAt: '2026-11-08', count: osm.counts.accepted }));
});

it('preserves OSM identities, published node positions and explicit area approximations without contributor metadata', () => {
  const ids = new Set<string>();
  for (const raw of osm.stations) {
    const site = raw as MapCharger;
    const location = site.location!;
    expect(location).toMatchObject({ status: 'approximate', source: 'OSM', license: 'ODbL 1.0', attribution: '© OpenStreetMap contributors', consultedAt: '2026-11-09' });
    expect(location.sourceUrl).toBe(`https://www.openstreetmap.org/${location.externalId}`);
    expect(location.verifiedAt).toBeUndefined();
    expect(ids.has(location.externalId!)).toBe(false);
    ids.add(location.externalId!);
    const [type, id] = location.externalId!.split('/');
    expect(location.positionMethod).toBe(type === 'node' ? 'source-point' : 'area-center');
    const imported = importOsmCharger({ type, id: Number(id), lat: site.lat, lon: site.lng, center: { lat: site.lat, lon: site.lng }, tags: { amenity: 'charging_station' } }, '2026-11-09');
    expect(imported?.id).toBe(site.id);
    expect(LOCAL_MAP_CHARGERS.find(local => local.id === site.id)).toEqual(site);
    expect(Object.keys(location).some(key => ['user', 'uid', 'changeset', 'email'].includes(key))).toBe(false);
  }
  expect(JSON.stringify(osm)).not.toMatch(/"(?:uid|user|changeset|contact:email|contact:phone|note)"\s*:/);
});
