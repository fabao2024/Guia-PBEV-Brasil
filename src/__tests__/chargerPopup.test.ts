import { createChargerPopup } from '../utils/chargerPopup';
import { ELETROPOSTOS } from '../data/eletropostosData';
import i18n from '../i18n';

it('does not offer navigation or repeat unproven operator/power claims for legacy records', () => {
  const popup = createChargerPopup(ELETROPOSTOS[12], i18n.t.bind(i18n));
  expect(popup.textContent).toContain('Não verificada');
  expect(popup.textContent).not.toContain('120 kW');
  expect(popup.querySelector('a')).toBeNull();
});

it('identifies an OSM area center without presenting it as a field-confirmed charger position', () => {
  const popup = createChargerPopup({ ...ELETROPOSTOS[0], location: {
    status: 'approximate', source: 'OSM', sourceUrl: 'https://www.openstreetmap.org/way/123', externalId: 'way/123',
    consultedAt: '2026-11-09', positionMethod: 'area-center', license: 'ODbL 1.0', attribution: '© OpenStreetMap contributors',
  } }, i18n.t.bind(i18n));
  expect(popup.textContent).toContain('Centro aproximado da área cadastrada no OSM');
  expect(popup.textContent).toContain('não é uma posição física confirmada');
  expect([...popup.querySelectorAll('a')].some(link => link.href === 'https://www.openstreetmap.org/copyright')).toBe(true);
});

it('does not invent missing city/state fields or show dangling separators in sparse source records', () => {
  const source = { ...ELETROPOSTOS[0], cidade: '', uf: 'SP', location: {
    status: 'approximate' as const, source: 'OSM', sourceUrl: 'https://www.openstreetmap.org/node/123', externalId: 'node/123', consultedAt: '2026-11-09',
  } };
  expect(createChargerPopup(source, i18n.t.bind(i18n)).children[2].textContent).toBe('SP');
  expect(createChargerPopup({ ...source, uf: '' }, i18n.t.bind(i18n)).children[2].textContent).toBe('Município/UF não informados');
});

it('renders external names as text, displays evidence, and labels map links as searches', () => {
  const popup = createChargerPopup({ ...ELETROPOSTOS[0], nome: '<img src=x onerror=alert(1)>', location: {
    status: 'approximate', source: 'OSM', sourceUrl: 'https://www.openstreetmap.org/node/123', externalId: 'node/123', consultedAt: '2026-11-09',
  } }, i18n.t.bind(i18n));
  expect(popup.querySelector('img')).toBeNull();
  expect(popup.textContent).toContain('<img src=x onerror=alert(1)>');
  expect(popup.textContent).toContain('2026-11-09');
  expect(popup.querySelector('a')?.href).toBe('https://www.openstreetmap.org/node/123');
  expect([...popup.querySelectorAll('a')].find(a => a.textContent === 'Pesquisar no Google Maps')?.href).toContain('/maps/search/');
});
