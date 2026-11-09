import { importOcmCharger, importOsmCharger } from '../utils/chargerImport';
import { chargerCurrent, chargerMaxPower, filterMapChargers, toRouteCharger, mergeMapChargers } from '../utils/chargerCatalog';
import { createChargerPopup } from '../utils/chargerPopup';
import { chargerMarkerLabel } from '../utils/chargerMarkers';
import i18n from '../i18n';

const context = {
  consultedAt: '2026-11-09',
  providers: [{ ID: 1, Title: 'Open Charge Map Contributors', IsOpenDataLicensed: true, License: 'Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0)' }],
  operators: [{ ID: 1, Title: '(Unknown Operator)' }, { ID: 2, Title: 'Rede teste' }],
  connectionTypes: [{ ID: 25, Title: 'Type 2 (Socket Only)' }, { ID: 33, Title: 'CCS (Type 2)' }],
};
const poi = {
  ID: 123, DataProviderID: 1, OperatorID: 2, UsageTypeID: 1, StatusTypeID: 50,
  DateLastStatusUpdate: '2026-04-20T10:00:00Z', NumberOfPoints: 2,
  AddressInfo: { CountryID: 36, Title: 'Local teste', Town: 'São Paulo', StateOrProvince: 'São Paulo', Latitude: -23.5, Longitude: -46.6 },
  Connections: [{ ID: 456, ConnectionTypeID: 25, CurrentTypeID: 20, PowerKW: 22, Quantity: 2 }],
};
const osm = {
  type: 'node', id: 456, lat: -23.5, lon: -46.6, timestamp: '2026-10-01T09:00:00Z',
  tags: { amenity: 'charging_station', name: 'Local OSM', access: 'customers', 'socket:type2': '2', 'socket:type2:output': '22 kW' },
};

it('imports AC locations without mislabelling AC power as DC or sockets as stations', () => {
  const site = importOcmCharger(poi, context)!;
  expect(site).toMatchObject({ nome: 'Local teste', uf: 'SP', potenciaDC: null, access: 'public', reportedPoints: 2 });
  expect(site.connections).toEqual([{ connector: 'Type 2 (Socket Only)', current: 'AC', powerKw: 22, quantity: 2 }]);
  expect(chargerCurrent(site)).toBe('AC');
  expect(chargerMaxPower(site)).toBe(22);
  expect(toRouteCharger(site)).toBeNull();
});

it('keeps missing electrical information explicitly unknown and never derives power from amps/volts', () => {
  const site = importOcmCharger({ ...poi, Connections: [{ Amps: 32, Voltage: 220 }] }, context)!;
  expect(site.potenciaDC).toBeNull();
  expect(site.conector).toBeNull();
  expect(site.connections).toEqual([{ connector: null, current: 'unknown', powerKw: null, quantity: null }]);
  expect(chargerCurrent(site)).toBe('unknown');
  expect(chargerMaxPower(site)).toBeNull();
  expect(filterMapChargers([site], { current: 'all', minKw: 0 })).toEqual([site]);
  expect(filterMapChargers([site], { current: 'all', minKw: 1 })).toEqual([]);
  expect(toRouteCharger(site)).toBeNull();
});

it('requires a recognized reusable license for every OCM provider, not merely an open-data flag', () => {
  expect(importOcmCharger({ ...poi, DataProviderID: 999 }, context)).toBeNull();
  for (const license of [null, 'Public data', 'CC BY-NC-SA 3.0']) {
    expect(importOcmCharger(poi, { ...context, providers: [{ ...context.providers[0], License: license }] })).toBeNull();
  }
  const site = importOcmCharger(poi, context)!;
  expect(site.location).toMatchObject({ status: 'approximate', license: 'CC BY 4.0', consultedAt: '2026-11-09', sourceUpdatedAt: '2026-04-20', attribution: 'Open Charge Map Contributors' });
  expect(site.location?.verifiedAt).toBeUndefined();
});

it('excludes private, removed, planned, non-Brazilian and invalid OCM records', () => {
  for (const invalid of [
    { ...poi, UsageTypeID: 2 }, { ...poi, UsageTypeID: 3 },
    ...[150, 200, 210].map(StatusTypeID => ({ ...poi, StatusTypeID })),
    { ...poi, AddressInfo: { ...poi.AddressInfo, CountryID: 1 } },
    { ...poi, AddressInfo: { ...poi.AddressInfo, Latitude: 91 } },
    { ...poi, AddressInfo: { ...poi.AddressInfo, Latitude: 0, Longitude: 0 } },
    { ...poi, ID: -1 },
  ]) expect(importOcmCharger(invalid, context)).toBeNull();
});

it('projects only public station fields; drops user identities, contacts, comments, prices and free text', () => {
  const site = importOcmCharger({ ...poi, UserComments: [{ UserName: 'Private user' }], ContactTelephone1: '555-secret', GeneralComments: 'private-note', UsageCost: 'old-price', AddressInfo: { ...poi.AddressInfo, ContactEmail: 'private@example.invalid', AccessComments: 'private-note' } }, context)!;
  expect(JSON.stringify(site)).not.toMatch(/Private user|555-secret|private-note|old-price|private@example/);
});

it('does not borrow power or current from an unrelated connection when selecting route data', () => {
  const site = importOcmCharger({ ...poi, Connections: [
    { ConnectionTypeID: 33, CurrentTypeID: 30, PowerKW: 50 },
    { ConnectionTypeID: 25, CurrentTypeID: 20, PowerKW: 350 },
  ] }, context)!;
  expect(chargerCurrent(site)).toBe('mixed');
  expect(site.potenciaDC).toBe(50);
  expect(toRouteCharger(site)).toMatchObject({ potenciaDC: 50, conector: 'CCS2' });
  expect(filterMapChargers([site], { current: 'DC', minKw: 100 })).toEqual([]);
  expect(filterMapChargers([site], { current: 'AC', minKw: 100 })).toEqual([site]);
  expect(toRouteCharger({ ...site, reportedStatus: 'unavailable' })).toBeNull();
  expect(toRouteCharger({ ...site, access: 'unknown' })).toBeNull();
  const unavailable = importOcmCharger({ ...poi, Connections: [{ ConnectionTypeID: 33, CurrentTypeID: 30, PowerKW: 150, StatusTypeID: 100 }] }, context)!;
  expect(toRouteCharger(unavailable)).toBeNull();
});

it('imports OSM AC, DC below 30 kW and records without connector/power metadata', () => {
  const ac = importOsmCharger(osm, context.consultedAt)!;
  expect(ac).toMatchObject({ potenciaDC: null, access: 'customers', connections: [{ connector: 'Type 2', current: 'AC', powerKw: 22, quantity: 2 }] });
  expect(ac.location).toMatchObject({ source: 'OSM', license: 'ODbL 1.0', sourceUpdatedAt: '2026-10-01', externalId: 'node/456' });
  const dc = importOsmCharger({ ...osm, tags: { amenity: 'charging_station', 'socket:type2_combo': '1', 'socket:type2_combo:output': '20 kW' } }, context.consultedAt)!;
  expect(dc.potenciaDC).toBe(20);
  expect(toRouteCharger(dc)).toBeNull();
  const unknown = importOsmCharger({ ...osm, tags: { amenity: 'charging_station' } }, context.consultedAt)!;
  expect(chargerCurrent(unknown)).toBe('unknown');
  expect(chargerMaxPower(unknown)).toBeNull();
});

it('validates OSM access, lifecycle, type and coordinates and preserves node/way/relation identities', () => {
  for (const tags of [{ access: 'private' }, { access: 'no' }, { disused: 'yes' }, { construction: 'yes' }, { proposed: 'yes' }, { motorcar: 'no' }, { 'addr:country': 'UY' }]) {
    expect(importOsmCharger({ ...osm, tags: { ...osm.tags, ...tags } }, context.consultedAt)).toBeNull();
  }
  expect(importOsmCharger({ ...osm, type: 'bad' }, context.consultedAt)).toBeNull();
  const variants = ['node', 'way', 'relation'].map(type => importOsmCharger({ ...osm, type, center: { lat: osm.lat, lon: osm.lon } }, context.consultedAt)!);
  expect(new Set(variants.map(site => site.id)).size).toBe(3);
  expect(variants[0].lat).toBe(osm.lat);
  expect(variants[0].location?.positionMethod).toBe('source-point');
  expect(variants[1].location?.positionMethod).toBe('area-center');
  expect(importOsmCharger({ ...osm, lat: 0, lon: -51 }, context.consultedAt)?.lat).toBe(0);
});

it('does not count absent sockets or turn malformed power strings into capacity', () => {
  const site = importOsmCharger({ ...osm, tags: { amenity: 'charging_station', 'socket:ccs2': '0', 'socket:ccs2:output': '350 kW', 'socket:type2': '1', 'socket:type2:output': '22;43 kW' } }, context.consultedAt)!;
  expect(site.connections).toEqual([{ connector: 'Type 2', current: 'AC', powerKw: null, quantity: 1 }]);
  expect(site.potenciaDC).toBeNull();
});

it('keeps different nearby source records and replaces only the same source identity', () => {
  const first = importOcmCharger(poi, context)!;
  const neighbor = importOcmCharger({ ...poi, ID: 124 }, context)!;
  const updated = { ...first, lat: first.lat + 0.01, location: { ...first.location!, consultedAt: '2026-11-10' } };
  expect(mergeMapChargers([first, neighbor], [updated])).toEqual([updated, neighbor]);
});

it('labels missing capacity honestly and displays AC and source age in safe popup text', () => {
  const site = importOcmCharger({ ...poi, AddressInfo: { ...poi.AddressInfo, Title: '<img onerror=alert(1)>' } }, context)!;
  const popup = createChargerPopup(site, i18n.t.bind(i18n));
  expect(popup.querySelector('img')).toBeNull();
  expect(popup.textContent).toContain('22 kW AC');
  expect(popup.textContent).toContain('2026-04-20');
  expect(popup.textContent).not.toContain('22 kW DC');
  const unknown = importOcmCharger({ ...poi, Connections: [] }, context)!;
  expect(chargerMarkerLabel(unknown, i18n.t.bind(i18n))).toContain('Potência não informada');
  expect(chargerMarkerLabel(unknown, i18n.t.bind(i18n))).not.toMatch(/null|undefined|0 kW/);
});
