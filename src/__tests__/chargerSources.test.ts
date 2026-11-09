import { fetchOsmChargers, searchOsmChargers } from '../services/overpassService';
import { fetchDcChargers } from '../services/ocmService';

const bbox = { south: -24, north: 1, west: -48, east: -46 };
afterEach(() => vi.unstubAllGlobals());

it('distinguishes a successful empty search from HTTP, network, timeout and partial-response errors', async () => {
  const mock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ elements: [] }) })
    .mockResolvedValueOnce({ ok: false, status: 502 })
    .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    .mockRejectedValueOnce(new DOMException('Timed out', 'TimeoutError'))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ elements: [], remark: 'runtime error: Query timed out' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ unexpected: [] }) });
  vi.stubGlobal('fetch', mock);
  expect(await searchOsmChargers(bbox)).toMatchObject({ status: 'success', stations: [] });
  expect(await searchOsmChargers(bbox)).toMatchObject({ status: 'error', reason: 'http', httpStatus: 502 });
  expect(await searchOsmChargers(bbox)).toMatchObject({ status: 'error', reason: 'network' });
  expect(await searchOsmChargers(bbox)).toMatchObject({ status: 'error', reason: 'timeout' });
  expect(await searchOsmChargers(bbox)).toMatchObject({ status: 'error', reason: 'invalid-response' });
  expect(await searchOsmChargers(bbox)).toMatchObject({ status: 'error', reason: 'invalid-response' });
});

it('keeps the route API non-blocking while exposing cancellation to the map', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  expect(await fetchOsmChargers(bbox)).toEqual([]);
  const controller = new AbortController();
  controller.abort();
  expect(await searchOsmChargers(bbox, controller.signal)).toMatchObject({ status: 'aborted' });
});

it('preserves OSM IDs, accepts latitude zero and records provenance without claiming field verification', async () => {
  const node = { type: 'node', id: 123, lat: 0, lon: -47, tags: { amenity: 'charging_station', access: 'yes', name: '<img onerror=alert(1)>', 'socket:type2_combo': '1', 'socket:type2_combo:output': '150 kW', 'addr:city': 'Teste', 'addr:state': 'SP' } };
  const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [node] }) });
  vi.stubGlobal('fetch', mock);
  const [station] = await fetchOsmChargers(bbox);
  expect(station).toMatchObject({ lat: 0, potenciaDC: 150, conector: 'CCS2', location: { status: 'approximate', externalId: 'node/123', sourceUrl: 'https://www.openstreetmap.org/node/123' } });
  expect(station.location?.consultedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  mock.mockResolvedValueOnce({ ok: true, json: async () => ({ elements: [{ ...node, type: 'way', center: { lat: 0, lon: -47 } }, node] }) });
  const reordered = await fetchOsmChargers(bbox);
  expect(reordered[1].id).toBe(station.id);
  expect(reordered[0].id).not.toBe(station.id);
});

it('does not invent OSM power, accept invalid coordinates or count zero DC sockets', async () => {
  const node = { type: 'node', id: 123, lat: -23, lon: -47, tags: { amenity: 'charging_station', access: 'yes', 'socket:ccs2': '1', 'socket:ccs2:output': '150 kW' } };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [
    { ...node, tags: { ...node.tags, 'socket:ccs2:output': undefined } },
    { ...node, lat: 91 },
    { ...node, tags: { ...node.tags, 'socket:ccs2': '0' } },
    { ...node, tags: { ...node.tags, access: 'private' } },
    { ...node, tags: { ...node.tags, 'socket:ccs2:output': '-50 kW' } },
    { ...node, tags: { ...node.tags, 'socket:ccs2:output': '29.9 kW' } },
  ] }) }));
  expect(await fetchOsmChargers(bbox)).toEqual([]);
});

it('uses only reported DC socket power, not the power of an AC socket or a zero DC socket', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [
    { type: 'node', id: 123, lat: -23, lon: -47, tags: { amenity: 'charging_station', access: 'yes', 'socket:ccs2': '1', 'socket:ccs2:output': '60 kW', 'socket:type2': '1', maxpower: '350 kW' } },
    { type: 'node', id: 124, lat: -23, lon: -47, tags: { amenity: 'charging_station', access: 'yes', 'socket:ccs2': '0', 'socket:ccs2:output': '350 kW', 'socket:chademo': '1', 'socket:chademo:output': '50 kW' } },
  ] }) }));
  expect((await fetchOsmChargers(bbox)).map(e => e.potenciaDC)).toEqual([60, 50]);
});

it('discovers AC and unknown-capacity sites on the map while keeping route discovery DC-only', async () => {
  const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [
    { type: 'node', id: 12, lat: -23, lon: -47, tags: { amenity: 'charging_station', access: 'customers', 'socket:type2': '2', 'socket:type2:output': '22 kW' } },
    { type: 'node', id: 13, lat: -23, lon: -47, tags: { amenity: 'charging_station' } },
  ] }) });
  vi.stubGlobal('fetch', mock);
  const result = await searchOsmChargers(bbox);
  expect(result.status).toBe('success');
  if (result.status !== 'success') throw new Error('Expected discovery success');
  expect(result.stations).toHaveLength(2);
  expect(result.stations[0].connections?.[0]).toMatchObject({ current: 'AC', powerKw: 22, quantity: 2 });
  expect(result.stations[1].potenciaDC).toBeNull();
  expect(await fetchOsmChargers(bbox)).toEqual([]);
  expect(decodeURIComponent(mock.mock.calls[0][1].body)).toContain('nwr["amenity"="charging_station"]');
});

it('does not invent OCM power or connector and attaches the external POI reference', async () => {
  const poi = { ID: 567, DataProviderID: 1, UsageTypeID: 1, AddressInfo: { CountryID: 36, Title: 'Station', Latitude: -23, Longitude: -47 }, Connections: [{ CurrentTypeID: 30, PowerKW: 120, ConnectionTypeID: 33, ConnectionType: { ID: 33, Title: 'CCS (Type 2)' } }] };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [
    poi,
    { ...poi, ID: 568, Connections: [{ CurrentTypeID: 30, ConnectionTypeID: 33, ConnectionType: { ID: 33, Title: 'CCS (Type 2)' } }] },
    { ...poi, ID: 569, Connections: [{ CurrentTypeID: 30, PowerKW: 120 }] },
    { ...poi, ID: 570, AddressInfo: { ...poi.AddressInfo, Latitude: NaN } },
    { ...poi, ID: 571, Connections: [{ CurrentTypeID: 30, ConnectionTypeID: 33, ConnectionType: { ID: 33, Title: 'CCS (Type 2)' } }, { CurrentTypeID: 30, PowerKW: 350, ConnectionTypeID: 32, ConnectionType: { ID: 32, Title: 'CCS (Type 1)' } }] },
    { ...poi, ID: 572, DataProviderID: 999 },
    { ...poi, ID: 573, UsageTypeID: 2 },
    { ...poi, ID: 574, DateLastStatusUpdate: '2020-01-01T00:00:00Z' },
  ] }));
  const stations = await fetchDcChargers(bbox, 'test-only');
  expect(stations).toHaveLength(1);
  expect(stations[0]).toMatchObject({ potenciaDC: 120, operador: '', location: { status: 'approximate', externalId: '567', sourceUrl: 'https://openchargemap.org/poi/details/567', license: 'CC BY 4.0' } });
});
