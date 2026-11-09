import { SOURCED_CHARGERS } from '../data/sourcedChargers';
import { ELETROPOSTOS } from '../data/eletropostosData';
import { CHARGER_MARKER_SIZE, chargerMarkerLabel, createChargerMarkerElement, createChargerMarkerTooltip, groupChargerMarkers } from '../utils/chargerMarkers';
import i18n from '../i18n';

const t = i18n.t.bind(i18n);

it('uses a touch target of at least 44 px and a high-contrast bolt rather than a tiny operator-colored dot', () => {
  expect(CHARGER_MARKER_SIZE[0]).toBeGreaterThanOrEqual(44);
  expect(CHARGER_MARKER_SIZE[1]).toBeGreaterThanOrEqual(44);
  const pin = createChargerMarkerElement(SOURCED_CHARGERS[0]);
  expect(pin.classList.contains('ev-map-pin')).toBe(true);
  expect(pin.querySelector('svg')).not.toBeNull();
  expect(pin.dataset.quality).toBe('approximate');
  expect(pin.textContent).toContain('~');
});

it('highlights selection without implying availability or changing evidence quality', () => {
  const pin = createChargerMarkerElement(SOURCED_CHARGERS[0], true);
  expect(pin.dataset.selected).toBe('true');
  expect(pin.dataset.quality).toBe('approximate');
  expect(chargerMarkerLabel(SOURCED_CHARGERS[0], t)).toContain('Aproximada');
  expect(chargerMarkerLabel(SOURCED_CHARGERS[0], t)).toContain('80 kW');
  expect(chargerMarkerLabel(SOURCED_CHARGERS[0], t)).not.toMatch(/disponível|operacional/i);
});

it('never shows unverified electrical claims on pins, labels or tooltips', () => {
  const charger = ELETROPOSTOS[0];
  expect(createChargerMarkerElement(charger).textContent).toContain('?');
  expect(chargerMarkerLabel(charger, t)).toContain('Não verificada');
  expect(chargerMarkerLabel(charger, t)).not.toContain('150 kW');
  expect(createChargerMarkerTooltip(charger, t).textContent).not.toContain('150 kW');
});

it('treats externally supplied names as text in tooltip labels', () => {
  const tooltip = createChargerMarkerTooltip({ ...SOURCED_CHARGERS[0], nome: '<img src=x onerror=alert(1)>' }, t);
  expect(tooltip.querySelector('img')).toBeNull();
  expect(tooltip.textContent).toContain('<img src=x onerror=alert(1)>');
  expect(tooltip.textContent).toContain('80 kW');
});

it('groups overlapping projected pins while preserving the original station coordinates', () => {
  const stations = [0, 1, 5].map((lng, index) => ({ ...SOURCED_CHARGERS[0], id: index, lat: 0, lng }));
  const groups = groupChargerMarkers(stations, ([lat, lng]) => ({ x: lng * 30, y: lat * 30 }));
  expect(groups.map(group => group.chargers.length)).toEqual([2, 1]);
  expect(groups[0].position).toEqual([0, 0.5]);
  expect(stations.map(station => station.lng)).toEqual([0, 1, 5]);
});

it('merges intersecting groups and separates them when zoom makes the points distinguishable', () => {
  const stations = [0, 2, 1].map((lng, index) => ({ ...SOURCED_CHARGERS[0], id: index, lat: 0, lng }));
  expect(groupChargerMarkers(stations, ([lat, lng]) => ({ x: lng * 30, y: lat })).map(group => group.chargers.length)).toEqual([3]);
  expect(groupChargerMarkers(stations, ([lat, lng]) => ({ x: lng * 100, y: lat })).map(group => group.chargers.length)).toEqual([1, 1, 1]);
  expect(groupChargerMarkers([], () => ({ x: 0, y: 0 }))).toEqual([]);
});

it('does not chain a nationwide corridor into a single unzoomable cluster', () => {
  const stations = Array.from({ length: 40 }, (_, index) => ({ ...SOURCED_CHARGERS[0], id: index, lat: 0, lng: index }));
  const groups = groupChargerMarkers(stations, ([lat, lng]) => ({ x: lng * 30, y: lat }));
  expect(groups.length).toBeGreaterThan(1);
  expect(groups.reduce((sum, group) => sum + group.chargers.length, 0)).toBe(40);
  for (const group of groups) expect(Math.max(...group.chargers.map(site => site.lng)) - Math.min(...group.chargers.map(site => site.lng))).toBeLessThanOrEqual(104 / 30);
});
