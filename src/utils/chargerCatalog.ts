import type { TFunction } from 'i18next';
import type { ConnectorType, Eletroposto } from '../data/eletropostosData';
import type { ChargerConnection, ChargerSnapshot, MapCharger } from '../types/chargers';
import { isLocatedCharger, locationStatus } from './chargerLocations';

export function chargerConnections(site: MapCharger): ChargerConnection[] {
  return site.connections ?? [{ connector: site.conector, current: 'DC', powerKw: site.potenciaDC, quantity: null }];
}

export function chargerCurrent(site: MapCharger): 'AC' | 'DC' | 'mixed' | 'unknown' {
  const currents = new Set(chargerConnections(site).map(c => c.current));
  if (currents.has('AC') && currents.has('DC')) return 'mixed';
  return currents.has('DC') ? 'DC' : currents.has('AC') ? 'AC' : 'unknown';
}

export function chargerMaxPower(site: MapCharger, current = 'all'): number | null {
  const values = chargerConnections(site).filter(c => current === 'all' || c.current === current)
    .map(c => c.powerKw).filter((power): power is number => typeof power === 'number' && Number.isFinite(power) && power > 0);
  return values.length ? Math.max(...values) : null;
}

export function filterMapChargers(sites: MapCharger[], options: { current: string; minKw: number; access?: string }): MapCharger[] {
  return sites.filter(site => (options.current === 'all' || (options.current === 'unknown'
    ? chargerCurrent(site) === 'unknown' : chargerConnections(site).some(c => c.current === options.current))) &&
    (!options.access || options.access === 'all' || (site.access ?? 'unknown') === options.access) &&
    (options.minKw === 0 || (chargerMaxPower(site, options.current) ?? 0) >= options.minKw));
}

export function chargerElectricalLabel(site: MapCharger, t: TFunction): string {
  return chargerConnections(site).map(connection => {
    const power = connection.powerKw == null ? t('chargingMap.powerUnknown') : `${connection.powerKw} kW`;
    return `${power}${connection.current === 'unknown' ? '' : ` ${connection.current}`}`;
  }).filter((text, index, all) => all.indexOf(text) === index).join(' · ') || t('chargingMap.powerUnknown');
}

export function routeConnector(label: string | null): ConnectorType | null {
  if (!label) return null;
  if (label === 'CCS2+CHAdeMO' || label === 'CCS2+Type2') return label;
  if (/CCS2|CCS.*Type 2|type ?2.*combo|IEC 62196-3.*FF/i.test(label)) return 'CCS2';
  if (/CHAdeMO/i.test(label)) return 'CHAdeMO';
  if (/Supercharger|NACS/i.test(label)) return 'Supercharger';
  if (/GB.?T.*DC|^GB\/T$/i.test(label)) return 'GB/T';
  return null;
}

/** No AC, missing capacity, restricted/unknown access, old or unavailable records become route stops. */
export function toRouteCharger(site: MapCharger, today = new Date().toISOString().slice(0, 10)): Eletroposto | null {
  if (!isLocatedCharger(site) || site.reportedStatus === 'unavailable' || site.access === 'unknown' || site.access === 'notice') return null;
  const sourceDate = site.location?.sourceUpdatedAt;
  if (sourceDate && Date.parse(today) - Date.parse(sourceDate) > 730 * 86_400_000) return null;
  const connections = chargerConnections(site).filter(c => !c.unavailable && c.current === 'DC' && c.powerKw != null && c.powerKw >= 30 && routeConnector(c.connector));
  if (!connections.length) return null;
  const best = connections.reduce((a, b) => a.powerKw! >= b.powerKw! ? a : b);
  return { ...site, potenciaDC: best.powerKw!, conector: routeConnector(best.connector)! };
}

function identity(site: MapCharger): string {
  const source = site.location?.sourceUrl?.replace('/site/poi/', '/poi/').replace(/\/$/, '');
  return source ?? String(site.id);
}

/** A nearby point is not necessarily the same location. Keep distinct source identities visible. */
export function mergeMapChargers(local: MapCharger[], external: MapCharger[]): MapCharger[] {
  const candidates = [...external, ...local].filter(isLocatedCharger).sort((a, b) =>
    Number(locationStatus(b) === 'confirmed') - Number(locationStatus(a) === 'confirmed') ||
    (b.location?.sourceUpdatedAt ?? b.location?.consultedAt ?? '').localeCompare(a.location?.sourceUpdatedAt ?? a.location?.consultedAt ?? ''));
  const result = new Map<string, MapCharger>();
  for (const site of candidates) if (!result.has(identity(site))) result.set(identity(site), site);
  return [...result.values()];
}

/** A complete current country import replaces the archive, not merely adds to it. */
export function selectChargerSnapshots(archive: ChargerSnapshot, current: ChargerSnapshot[]): ChargerSnapshot[] {
  if (current.some(snapshot => snapshot.completeCountry && (snapshot.scope !== 'country' || !snapshot.stations.length))) {
    throw new Error('Invalid complete country snapshot.');
  }
  const complete = current.filter(snapshot => snapshot.completeCountry && snapshot.scope === 'country')
    .sort((a, b) => b.retrievedAt.localeCompare(a.retrievedAt))[0];
  return complete ? [complete] : [archive, ...current];
}
