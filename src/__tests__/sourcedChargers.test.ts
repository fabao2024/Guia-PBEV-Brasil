import { SOURCED_CHARGERS, CHARGER_SNAPSHOT_DATE } from '../data/sourcedChargers';
import { ELETROPOSTOS } from '../data/eletropostosData';
import { isLocatedCharger, locationStatus } from '../utils/chargerLocations';
import { mergeChargerSources } from '../utils/mergeChargers';

it('ships a small traceable snapshot without pretending to cover all Brazil or confirm field positions', () => {
  expect(SOURCED_CHARGERS).toHaveLength(7);
  expect(new Set(SOURCED_CHARGERS.map(e => e.uf))).toEqual(new Set(['SP', 'PR', 'RR', 'SC', 'PE', 'GO', 'BA']));
  expect(new Set(SOURCED_CHARGERS.map(e => e.id)).size).toBe(7);
  expect(CHARGER_SNAPSHOT_DATE).toBe('2026-11-09');
  for (const station of SOURCED_CHARGERS) {
    expect(isLocatedCharger(station)).toBe(true);
    expect(locationStatus(station)).toBe('approximate');
    expect(station.location?.consultedAt).toBe(CHARGER_SNAPSHOT_DATE);
    expect(station.location?.sourceUrl).toBe(`https://openchargemap.org/poi/details/${station.location?.externalId}`);
    expect(station.location?.license).toMatch(/CC/);
    expect(station.location?.attribution).toBeTruthy();
    expect(station.address).toBeTruthy();
    expect(station.potenciaDC).toBeGreaterThanOrEqual(30);
    expect(station.lat).toBeGreaterThan(-34);
    expect(station.lat).toBeLessThan(6);
    expect(station.lng).toBeGreaterThan(-74);
    expect(station.lng).toBeLessThan(-34);
    expect(station.usage).toMatch(/membership-required|pay-at-location/);
  }
});

it('preserves published station coordinates and electrical details, not city or mall centers', () => {
  expect(SOURCED_CHARGERS.find(e => e.location?.externalId === '513710')).toMatchObject({
    lat: -23.695222503765905, lng: -46.701610346314055, potenciaDC: 80, conector: 'CCS2', operador: '',
  });
  expect(SOURCED_CHARGERS.find(e => e.location?.externalId === '191634')).toMatchObject({
    lat: -25.432603925814988, lng: -49.339198023151965, potenciaDC: 50, conector: 'CCS2+CHAdeMO', operador: 'Copel',
  });
  expect(mergeChargerSources([...ELETROPOSTOS, ...SOURCED_CHARGERS], [])).toHaveLength(7);
});

it.each(['2026-11-09', '2026-11-10'])('lets a fresh individual source (%s) replace its snapshot even when coordinates moved beyond the proximity threshold', consultedAt => {
  const snapshot = SOURCED_CHARGERS[0];
  const updated = { ...snapshot, lat: snapshot.lat + 0.02, location: { ...snapshot.location!, consultedAt } };
  expect(mergeChargerSources([snapshot], [updated])).toEqual([updated]);
});
