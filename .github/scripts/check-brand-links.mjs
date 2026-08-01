/**
 * Verifica os links oficiais de fabricantes usados pelo Guia.
 * 403/405 nunca são tratados como sucesso sem um GET de confirmação.
 */
import { readFileSync } from 'node:fs';
import { classifyLinkResponse, createMaintenanceResult } from './maintenance-core.mjs';
import { collectorResultPath, writeCollectorResult } from './maintenance-io.mjs';

const SOURCE = 'brand_links';
const TARGET_FILE = 'src/constants.ts';
const REQUEST_TIMEOUT_MS = 15000;

function loadLinks() {
  const source = readFileSync(TARGET_FILE, 'utf8');
  const blockMatch = source.match(/export const BRAND_URLS[\s\S]*?=\s*\{([\s\S]*?)\};/);
  if (!blockMatch) throw new Error('BRAND_URLS não encontrado em src/constants.ts');
  const links = [...blockMatch[1].matchAll(/["']([^"']+)["']\s*:\s*["']([^"']+)["']/g)]
    .map(match => ({ brand: match[1], url: match[2] }));
  if (!links.length) throw new Error('Nenhum link de fabricante encontrado');
  return links;
}

async function request(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GuiaPBEV-LinkCheck/2.0; +https://guiapbev.cloud)',
        Accept: 'text/html,application/xhtml+xml',
        ...(method === 'GET' ? { Range: 'bytes=0-1023' } : {}),
      },
      redirect: 'follow',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function checkLink({ brand, url }) {
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('protocolo inválido');
    let response = await request(url, 'HEAD');
    let classification = classifyLinkResponse(response.status);
    if (classification.status === 'blocked') {
      response = await request(url, 'GET');
      classification = classifyLinkResponse(response.status);
    }
    return {
      brand,
      url,
      finalUrl: response.url,
      httpStatus: response.status,
      status: classification.status,
      verifiable: classification.verifiable,
      error: null,
    };
  } catch (error) {
    return {
      brand,
      url,
      finalUrl: null,
      httpStatus: null,
      status: error.name === 'AbortError' ? 'timeout' : 'unavailable',
      verifiable: false,
      error: String(error.message).slice(0, 160),
    };
  }
}

async function collect() {
  const links = loadLinks();
  const checkedAt = new Date().toISOString();
  const results = await Promise.all(links.map(checkLink));
  const counts = results.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] ?? 0) + 1 }), {});
  const incomplete = (counts.blocked ?? 0) + (counts.timeout ?? 0) + (counts.unavailable ?? 0);
  const broken = counts.broken ?? 0;
  const status = incomplete > 0 ? 'partial' : broken > 0 ? 'changed' : 'unchanged';

  return createMaintenanceResult({
    source: SOURCE,
    status,
    checkedAt,
    sourceUpdatedAt: checkedAt.slice(0, 10),
    repositoryReference: `${links.length} marcas`,
    coverage: { checked: links.length - incomplete, expected: links.length },
    changes: broken,
    error: incomplete > 0 ? `${incomplete} links não puderam ser verificados` : null,
    details: { counts, links: results },
  });
}

const resultPath = collectorResultPath(SOURCE);
try {
  const result = await collect();
  writeCollectorResult(resultPath, result);
  console.log(`Links: ${result.status}; cobertura ${result.coverage.checked}/${result.coverage.expected}; quebrados ${result.changes}`);
} catch (error) {
  writeCollectorResult(resultPath, createMaintenanceResult({ source: SOURCE, status: 'failed', error: error.message }));
  console.error(`Falha na verificação de links: ${error.message}`);
  process.exitCode = 1;
}
