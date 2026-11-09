/** Public-data importer only. No backend or browser credentials.
 * Sources: ocm (archive), ocm-current (public recent listings), ocm-api (authorized API),
 * osm (Overpass), osm-file (local Geofabrik selection). Run with Node 22 / tsx.
 * Outputs contain only allowlisted station fields; raw responses stay in a temporary cache.
 */
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { importOcmCharger, importOsmCharger, type OcmImportContext } from '../src/utils/chargerImport';
import { chargerCurrent } from '../src/utils/chargerCatalog';
import type { MapCharger } from '../src/types/chargers';
import { parseOcmBrowseIds, parseOcmPublicPage, validateOcmApiPage } from '../src/utils/chargerSourcePages';

const args = process.argv.slice(2);
const option = (name: string, fallback: string) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const source = option('--source', '');
if (!['ocm', 'osm', 'ocm-current', 'ocm-api', 'osm-file'].includes(source)) throw new Error('Specify --source ocm, ocm-current, ocm-api, osm or osm-file.');
const cacheDir = resolve(option('--cache-dir', join(tmpdir(), 'opencode', 'charger-source-cache')));
const OCM_REVISION = '8e3bedca48ca94807d96b2f5e7ee02cffe63ae54';
const day = new Date().toISOString().slice(0, 10);
await mkdir(cacheDir, { recursive: true });

async function getJson(url: string, timeout = 30_000, apiKey = ''): Promise<any> {
  const response = await fetch(url, { headers: { 'User-Agent': 'GuiaPBEV-public-data-import/1.0', Accept: 'application/json',
    ...(apiKey ? { 'X-API-Key': apiKey } : {}) }, signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
  return response.json();
}

async function collectOcmCurrent() {
  const { Window } = await import('happy-dom');
  const window = new Window({ settings: { disableJavaScriptEvaluation: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true, disableIframePageLoading: true } });
  const parse = (html: string) => new window.DOMParser().parseFromString(html, 'text/html') as unknown as Document;
  const getPage = async (url: string) => {
    const response = await fetch(url, { headers: { 'User-Agent': 'GuiaPBEV-public-data-import/1.0' }, signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`OCM public page HTTP ${response.status}`);
    return response.text();
  };
  try {
    const upstreamUrl = 'https://openchargemap.org/poi?countrycode=BR';
    const ids = parseOcmBrowseIds(parse(await getPage(upstreamUrl)));
    const stations: MapCharger[] = [];
    let next = 0, completed = 0;
    await Promise.all(Array.from({ length: 2 }, async () => {
      while (next < ids.length) {
        const id = ids[next++];
        const site = parseOcmPublicPage(parse(await getPage(`https://openchargemap.org/poi/details/${id}`)), id, day);
        if (site) stations.push(site);
        if (++completed % 25 === 0) console.log(`OCM current ${completed}/${ids.length} public listings read`);
      }
    }));
    return { stations, retrievedAt: day, snapshotAt: day, upstreamUrl, input: ids.length,
      scope: 'recent-listings', completeCountry: false };
  } finally { await window.happyDOM.close(); }
}

async function collectOcmApi() {
  // Explicit import-only credential. Never read a VITE_* value or embed it in a URL/output.
  const key = process.env.OCM_API_KEY?.trim();
  if (!key) throw new Error('OCM_API_KEY is required for authorized national API import. No request was made.');
  const reference = await getJson('https://api.openchargemap.io/v3/referencedata/?output=json', 30_000, key);
  const context: OcmImportContext = { consultedAt: day, providers: reference.DataProviders, operators: reference.Operators, connectionTypes: reference.ConnectionTypes };
  const stations: MapCharger[] = [];
  let cursor = 0, input = 0, complete = false;
  for (let page = 0; page < 100; page++) {
    const params = new URLSearchParams({ output: 'json', countrycode: 'BR', compact: 'true', verbose: 'false',
      sortby: 'id_asc', greaterthanid: String(cursor), maxresults: '1000' });
    const values = await getJson(`https://api.openchargemap.io/v3/poi/?${params}`, 30_000, key);
    const next = validateOcmApiPage(values, cursor);
    if (!values.length) { complete = true; break; }
    cursor = next;
    input += values.length;
    for (const value of values) {
      const site = importOcmCharger(value, context);
      if (site) stations.push(site);
    }
  }
  if (!complete) throw new Error('National API pagination did not reach a confirmed end; previous snapshot preserved.');
  return { stations, input, retrievedAt: day, snapshotAt: day, upstreamUrl: 'https://api.openchargemap.io/v3/poi/',
    scope: 'country', completeCountry: true };
}

async function cachedJson(name: string, url: string): Promise<any> {
  const path = join(cacheDir, name);
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { /* Download only missing cache entries. */ }
  const data = await getJson(url);
  await writeFile(path, JSON.stringify(data));
  return data;
}

async function collectOcm() {
  const base = `https://raw.githubusercontent.com/openchargemap/ocm-export/${OCM_REVISION}/data/`;
  const root = await cachedJson(`${OCM_REVISION}-root.json`, `https://api.github.com/repos/openchargemap/ocm-export/git/trees/${OCM_REVISION}`);
  const dataTree = await cachedJson(`${OCM_REVISION}-data.json`, root.tree.find((entry: any) => entry.path === 'data').url);
  const brTree = await cachedJson(`${OCM_REVISION}-BR.json`, dataTree.tree.find((entry: any) => entry.path === 'BR').url);
  if (brTree.truncated || !Array.isArray(brTree.tree)) throw new Error('Incomplete OCM country tree.');
  const files = brTree.tree.filter((entry: any) => /^OCM-\d+\.json$/.test(entry.path));
  if (!files.length) throw new Error('Empty OCM country export.');
  const reference = await cachedJson(`${OCM_REVISION}-reference.json`, `${base}referencedata.json`);
  const context: OcmImportContext = { consultedAt: day, providers: reference.DataProviders, operators: reference.Operators, connectionTypes: reference.ConnectionTypes };
  const stations: MapCharger[] = [];
  let next = 0, completed = 0;
  // Bounded concurrency for static files; never parallelize Overpass queries.
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < files.length) {
      const file = files[next++];
      const poi = await cachedJson(`${OCM_REVISION}-${file.path}`, `${base}BR/${file.path}`);
      if (`OCM-${poi.ID}.json` !== file.path) throw new Error('OCM identity mismatch.');
      const site = importOcmCharger(poi, context);
      if (site) stations.push(site);
      completed++;
      if (completed % 200 === 0) console.log(`OCM ${completed}/${files.length} source records read`);
    }
  }));
  return { stations, retrievedAt: day, snapshotAt: '2026-04-22', revision: OCM_REVISION,
    upstreamUrl: `https://github.com/openchargemap/ocm-export/tree/${OCM_REVISION}/data/BR`, input: files.length };
}

async function collectOsm() {
  const query = '[out:json][timeout:60];area["ISO3166-1"="BR"]["admin_level"="2"]->.br;nwr["amenity"="charging_station"](area.br);out center meta;';
  const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      const data = await getJson(`${endpoint}?data=${encodeURIComponent(query)}`, 90_000);
      if (!Array.isArray(data.elements) || data.remark || !data.elements.length || !data.osm3s?.timestamp_osm_base) throw new Error('Empty or incomplete OSM response.');
      // Retain metadata needed for reproducibility without exporting contributor identities.
      const stations = data.elements.flatMap((element: unknown) => {
        const site = importOsmCharger(element, day);
        return site ? [site] : [];
      });
      return { stations, retrievedAt: day, snapshotAt: data.osm3s.timestamp_osm_base.slice(0, 10),
        upstreamUrl: endpoint, input: data.elements.length };
    } catch (error) { lastError = error; }
  }
  throw lastError;
}

async function collectOsmFile() {
  const inputPath = option('--input', '');
  if (!inputPath) throw new Error('Specify --input with the intermediate JSON selected from the Geofabrik extract.');
  const data = JSON.parse(await readFile(resolve(inputPath), 'utf8'));
  const dataUntil = data.osm3s?.timestamp_osm_base;
  if (!Array.isArray(data.elements) || !data.elements.length || !/^\d{4}-\d{2}-\d{2}T/.test(dataUntil ?? '') ||
    data.elements.length + data.statistics?.withoutCompleteGeometry !== data.statistics?.matchedInput) throw new Error('Incomplete or undated OSM file selection.');
  const upstreamUrl = 'https://download.geofabrik.de/south-america/brazil-261108.osm.pbf';
  const checksum = 'e0076a91afd957aa8f18318be6185356';
  if (dataUntil.slice(0, 10) !== '2026-11-08' || data.source?.url !== upstreamUrl || data.source?.md5 !== checksum) throw new Error('OSM file timestamp/checksum differs from the pinned source.');
  const stations = data.elements.flatMap((element: unknown) => {
    const site = importOsmCharger(element, day);
    return site ? [site] : [];
  });
  return { stations, input: data.statistics.matchedInput, retrievedAt: day, snapshotAt: dataUntil.slice(0, 10),
    dataUntil, upstreamUrl, sourceChecksum: checksum, scope: 'country', completeCountry: true };
}

const result = source === 'ocm' ? await collectOcm() : source === 'ocm-current' ? await collectOcmCurrent()
  : source === 'ocm-api' ? await collectOcmApi() : source === 'osm-file' ? await collectOsmFile() : await collectOsm();
if (!result.stations.length) throw new Error('Refusing to replace a snapshot with zero accepted records.');
result.stations.sort((a, b) => a.id - b.id);
if (new Set(result.stations.map(site => site.id)).size !== result.stations.length) throw new Error('Duplicate source identity.');
const countBy = (field: (site: MapCharger) => string) => Object.fromEntries([...new Set(result.stations.map(field))].sort().map(key => [key, result.stations.filter(site => field(site) === key).length]));
const snapshot = {
  version: 1, source: source.startsWith('ocm') ? 'Open Charge Map' : 'OpenStreetMap',
  retrievedAt: result.retrievedAt, snapshotAt: result.snapshotAt,
  ...('revision' in result ? { revision: result.revision } : {}), upstreamUrl: result.upstreamUrl,
  ...('scope' in result ? { scope: result.scope, completeCountry: result.completeCountry } : {}),
  ...('dataUntil' in result ? { dataUntil: result.dataUntil } : {}),
  ...('sourceChecksum' in result ? { sourceChecksum: result.sourceChecksum } : {}),
  counts: { input: result.input, accepted: result.stations.length, excluded: result.input - result.stations.length,
    byUf: countBy(site => site.uf || 'unknown'), byCurrent: countBy(chargerCurrent), byAccess: countBy(site => site.access ?? 'unknown') },
  stations: result.stations,
};
const destination = resolve(`src/data/${source === 'ocm-current' || source === 'ocm-api' ? 'ocmCurrent' : source === 'osm-file' ? 'osm' : source}Chargers.json`);
const temporary = `${destination}.tmp`;
await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`);
await rename(temporary, destination);
console.log(JSON.stringify({ source: snapshot.source, snapshotAt: snapshot.snapshotAt, retrievedAt: snapshot.retrievedAt, ...snapshot.counts }, null, 2));
