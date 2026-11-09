import { parseOcmBrowseIds, parseOcmPublicPage, validateOcmApiPage } from '../utils/chargerSourcePages';
import { toRouteCharger } from '../utils/chargerCatalog';

const html = (license = 'Licensed under CC0 by data sharing agreement') => `
  <h1>HUB ANAST&#xC1;CIO</h1>
  <section id="tab-general">
    <address><div>Rua Botocudo, 234</div><div></div><div>São Paulo</div><div>SP</div><div>05093-030</div><div>Brazil</div></address>
    <dl class="ocm-facts">
      <dt>Usage</dt><dd data-localize="ocm.reference.usageType.value_4">Membership</dd>
      <dt>Status</dt><dd data-localize="ocm.reference.statusType.value_0">Unknown</dd>
      <dt data-localize="ocm.details.location.latitude">Latitude</dt><dd>-23.513374</dd>
      <dt data-localize="ocm.details.location.longitude">Longitude</dt><dd>-46.722076</dd>
      <dt data-localize="ocm.details.refNumber">OCM Ref</dt><dd>OCM-513822</dd>
    </dl>
    <div class="card"><h2 data-localize="ocm.details.operator.sectionTitle">Operator</h2><div class="fw-semibold">Multcharge (BR)</div><div>private-phone</div></div>
    <div class="card"><h2 data-localize="ocm.details.dataProvider.sectionTitle">Provider</h2><div class="fw-semibold">Multcharge</div><dl>
      <dt data-localize="ocm.details.dataProvider.license">License</dt><dd>${license}</dd>
    </dl></div>
  </section>
  <section id="tab-equipment"><div class="ocm-equipment-card">
    <h3><span data-localize="ocm.reference.connectionType.value_33">CCS (Type 2)</span></h3>
    <span class="badge">1 present</span><span data-localize="ocm.reference.statusType.value_0">Unknown</span>
    <div class="ocm-equipment-specs"><div><span class="ocm-equipment-value">60</span> kW</div>
      <div><span class="ocm-equipment-value">1000</span> V</div>
      <div data-localize="ocm.reference.supplyType.value_30">DC</div></div>
  </div></section>
  <section id="tab-comments">private-user 2026-11-08</section>
  <aside><dd>88.8</dd><a href="/poi/details/999">Neighbor</a></aside>`;
const doc = (value: string) => new DOMParser().parseFromString(value, 'text/html');

it('imports fields from the public OCM listing without inventing an update/installation date or retaining user data', () => {
  const site = parseOcmPublicPage(doc(html()), 513822, '2026-11-09')!;
  expect(site).toMatchObject({ nome: 'HUB ANASTÁCIO', lat: -23.513374, lng: -46.722076, uf: 'SP', potenciaDC: 60,
    access: 'membership', connections: [{ current: 'DC', connector: 'CCS (Type 2)', powerKw: 60, quantity: 1 }],
    location: { source: 'Open Charge Map', license: 'CC0', attribution: 'Multcharge', consultedAt: '2026-11-09' } });
  expect(site.location?.sourceUpdatedAt).toBeUndefined();
  expect(site.location?.verifiedAt).toBeUndefined();
  expect(JSON.stringify(site)).not.toMatch(/private-user|private-phone/);
});

it('fails closed for a different POI, changed primary markup, missing country/coordinates or unknown license', () => {
  expect(() => parseOcmPublicPage(doc(html()), 999, '2026-11-09')).toThrow(/identity/i);
  expect(() => parseOcmPublicPage(doc('<h1>Unexpected site</h1>'), 513822, '2026-11-09')).toThrow();
  expect(parseOcmPublicPage(doc(html('No license')), 513822, '2026-11-09')).toBeNull();
  expect(parseOcmPublicPage(doc(html().replace('Brazil</div>', 'France</div>')), 513822, '2026-11-09')).toBeNull();
  expect(() => parseOcmPublicPage(doc(html().replace('<dd>-23.513374</dd>', '<dd></dd>')), 513822, '2026-11-09')).toThrow(/coordinates/i);
});

it('does not borrow volts as power, and propagates unavailable connection metadata to route exclusion', () => {
  const unavailable = html().replace('ocm.reference.statusType.value_0">Unknown</span>', 'ocm.reference.statusType.value_100">Unavailable</span>');
  const site = parseOcmPublicPage(doc(unavailable), 513822, '2026-11-09')!;
  expect(toRouteCharger(site)).toBeNull();
  expect(parseOcmPublicPage(doc(html().replace('<div><span class="ocm-equipment-value">60</span> kW</div>', '')), 513822, '2026-11-09')?.potenciaDC).toBeNull();
});

it('reads only official result-list identities, not nearby, script or comment links', () => {
  expect(parseOcmBrowseIds(doc(`<div class="ocm-poi-list"><article><h3 class="ocm-poi-card-title"><a href="/poi/details/513822">One</a></h3></article></div><a href="/poi/details/1">Ignore</a>`))).toEqual([513822]);
  expect(() => parseOcmBrowseIds(doc('<p>No primary result list</p>'))).toThrow();
});

it('validates ascending API pages before allowing a complete national snapshot', () => {
  expect(validateOcmApiPage([{ ID: 1 }, { ID: 4 }], 0)).toBe(4);
  expect(validateOcmApiPage([], 4)).toBe(4);
  expect(() => validateOcmApiPage([{ ID: 4 }], 4)).toThrow();
  expect(() => validateOcmApiPage([{ ID: 4 }, { ID: 3 }], 0)).toThrow();
  expect(() => validateOcmApiPage({ error: 'quota' }, 0)).toThrow();
});
