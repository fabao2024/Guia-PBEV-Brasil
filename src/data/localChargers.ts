import ocm from './ocmChargers.json';
import type { ChargerSnapshot, MapCharger } from '../types/chargers';
import { SOURCED_CHARGERS, CHARGER_SNAPSHOT_DATE } from './sourcedChargers';
import { mergeMapChargers, selectChargerSnapshots, toRouteCharger } from '../utils/chargerCatalog';

// An unavailable collector never creates an empty "successful" OSM snapshot.
// If a complete OSM export is obtained later, the generated file is included automatically.
const osm = Object.values(import.meta.glob<ChargerSnapshot>('./osmChargers.json', { eager: true, import: 'default' }));
const currentOcm = Object.values(import.meta.glob<ChargerSnapshot>('./ocmCurrentChargers.json', { eager: true, import: 'default' }));
const ocmSnapshots = selectChargerSnapshots(ocm as ChargerSnapshot, currentOcm);
const snapshots = [...ocmSnapshots, ...osm];
const manual = ocmSnapshots.some(snapshot => snapshot.completeCountry) ? [] : SOURCED_CHARGERS;

export const LOCAL_MAP_CHARGERS: MapCharger[] = mergeMapChargers([
  ...manual,
  ...snapshots.flatMap(snapshot => snapshot.stations),
], []);

export const LOCAL_ROUTE_CHARGERS = LOCAL_MAP_CHARGERS.flatMap(site => {
  const charger = toRouteCharger(site);
  return charger ? [charger] : [];
});

export const CHARGER_SOURCE_SUMMARIES = snapshots.map(snapshot => ({
  id: `${snapshot.source}-${snapshot.scope ?? 'archive'}`,
  source: snapshot.source, retrievedAt: snapshot.retrievedAt, snapshotAt: snapshot.snapshotAt, count: snapshot.stations.length,
  kind: snapshot.source === 'OpenStreetMap' ? 'extract' : snapshot.scope === 'recent-listings' ? 'listings' : snapshot.completeCountry ? 'api' : 'archive',
}));
export const LOCAL_CHARGER_RETRIEVED_AT = [CHARGER_SNAPSHOT_DATE, ...snapshots.map(snapshot => snapshot.retrievedAt)].sort().at(-1)!;
