/**
 * Atualiza preços médios estaduais de gasolina comum e etanol hidratado.
 * Fonte oficial: página e CSVs mensais da ANP em gov.br/anp.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createMaintenanceResult, fetchWithRetry, resolveAnpColumns } from './maintenance-core.mjs';
import { collectorResultPath, writeCollectorResult } from './maintenance-io.mjs';
import { PROVENANCE_FILE, updateDatasetProvenance } from './provenance-registry.mjs';
import { runFile } from './security-utils.mjs';

const SOURCE = 'anp';
const LANDING_URL = 'https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/serie-historica-de-precos-de-combustiveis';
const TARGET_FILE = 'src/constants/fuelPricesByState.ts';
const dryRun = process.env.MAINTENANCE_DRY_RUN === '1';
const STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];
const MONTHS = new Map([
  ['janeiro', 1], ['fevereiro', 2], ['março', 3], ['marco', 3], ['abril', 4],
  ['maio', 5], ['junho', 6], ['julho', 7], ['agosto', 8], ['setembro', 9],
  ['outubro', 10], ['novembro', 11], ['dezembro', 12],
]);

function cleanHtml(value) {
  return String(value).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function discoverLatestMonthlyCsv(html) {
  const candidates = [...String(html).matchAll(/<a\b[^>]*href=["']([^"']+dados-abertos-precos-gasolina-etanol\.csv)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map(match => {
      const label = cleanHtml(match[2]);
      const dateMatch = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/([a-z]+)\s+de\s+(20\d{2})/);
      const month = dateMatch ? MONTHS.get(dateMatch[1]) : null;
      const year = dateMatch ? Number(dateMatch[2]) : null;
      return month && year ? {
        url: new URL(match[1], LANDING_URL).href,
        label,
        month,
        year,
        order: year * 100 + month,
      } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.order - a.order);

  if (!candidates.length) throw new Error('CSV mensal de gasolina e etanol não identificado na página oficial da ANP');
  const latest = candidates[0];
  const parsed = new URL(latest.url);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'www.gov.br' || !parsed.pathname.startsWith('/anp/')) {
    throw new Error('URL do recurso ANP fora do host oficial');
  }
  return latest;
}

function parseCsvLine(line, separator) {
  const values = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === separator && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += char;
    }
  }
  values.push(value.trim());
  return values;
}

function parseCsv(text) {
  const lines = String(text).split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 100) throw new Error(`CSV ANP incompleto: apenas ${lines.length} linhas`);
  const header = lines[0].replace(/^\uFEFF/, '');
  const separator = header.includes(';') ? ';' : ',';
  const headers = parseCsvLine(header, separator);
  return {
    headers,
    rows: lines.slice(1).map(line => {
      const values = parseCsvLine(line, separator);
      return Object.fromEntries(headers.map((column, index) => [column, values[index] ?? '']));
    }),
  };
}

function parseBrNumber(value) {
  return Number.parseFloat(String(value).replace('.', '').replace(',', '.'));
}

function parseBrDate(value) {
  const match = String(value).match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

function computeStateAverages(headers, rows) {
  const columns = resolveAnpColumns(headers);
  const dateColumn = headers.find(header => /data da coleta/i.test(header)) ?? null;
  const accum = Object.fromEntries(STATES.map(uf => [uf, { gasoline: [], ethanol: [] }]));
  let sourceUpdatedAt = null;

  for (const row of rows) {
    const uf = String(row[columns.state] ?? '').trim().toUpperCase();
    if (!accum[uf]) continue;
    const product = String(row[columns.product] ?? '').trim().toUpperCase();
    const price = parseBrNumber(row[columns.price]);
    if (!Number.isFinite(price) || price <= 0) continue;

    if (['GASOLINA', 'GASOLINA COMUM', 'GASOLINA C COMUM'].includes(product)) accum[uf].gasoline.push(price);
    if (product.includes('ETANOL')) accum[uf].ethanol.push(price);

    const collectedAt = dateColumn ? parseBrDate(row[dateColumn]) : null;
    if (collectedAt && (!sourceUpdatedAt || collectedAt > sourceUpdatedAt)) sourceUpdatedAt = collectedAt;
  }

  const average = values => values.length
    ? Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 100) / 100
    : null;
  const prices = {};
  for (const uf of STATES) {
    const gasoline = average(accum[uf].gasoline);
    const ethanol = average(accum[uf].ethanol);
    if (gasoline && ethanol) prices[uf] = { gasoline, ethanol };
  }
  return { prices, sourceUpdatedAt };
}

function readCurrentPrices() {
  const source = readFileSync(TARGET_FILE, 'utf8');
  const prices = {};
  for (const match of source.matchAll(/(\w{2}):\s*\{\s*gasoline:\s*([\d.]+),\s*ethanol:\s*([\d.]+)\s*\}/g)) {
    prices[match[1]] = { gasoline: Number(match[2]), ethanol: Number(match[3]) };
  }
  const reference = source.match(/FUEL_PRICES_UPDATED = '([^']+)'/)?.[1] ?? null;
  return { prices, reference };
}

function buildTarget(prices, resourceLabel, sourceUpdatedAt) {
  const sourceDate = new Date(`${sourceUpdatedAt}T12:00:00Z`);
  const monthLabel = sourceDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' }).replace('.', '');
  const rows = STATES.map(uf => `  ${uf}: { gasoline: ${prices[uf].gasoline.toFixed(2)}, ethanol: ${prices[uf].ethanol.toFixed(2)} },`);
  return `// Preços médios de revenda por estado — ANP (SHPC), referência: ${monthLabel}\n// Fonte: gov.br/anp · Produto: GASOLINA COMUM e ETANOL HIDRATADO (R$/L)\n// Recurso: ${resourceLabel}\n// Atualizado em: ${sourceUpdatedAt}\n\nexport const FUEL_PRICES_UPDATED = '${monthLabel}';\n\nexport const FUEL_PRICES_BY_STATE: Record<string, { gasoline: number; ethanol: number }> = {\n${rows.join('\n')}\n};\n\nexport function getDefaultFuelPrice(state: string, fuelType: 'gasoline' | 'ethanol'): number {\n  const prices = FUEL_PRICES_BY_STATE[state] ?? FUEL_PRICES_BY_STATE['SP'];\n  return prices[fuelType];\n}\n`;
}

function findExistingPr(title) {
  const payload = runFile('gh', ['pr', 'list', '--state', 'open', '--limit', '100', '--json', 'title,url']);
  const pullRequests = JSON.parse(payload);
  if (!Array.isArray(pullRequests)) throw new Error('Resposta inválida ao listar PRs abertos');
  return pullRequests.find(pr => pr.title === title)?.url ?? '';
}

function publishPr(title, prBody, branchBase) {
  const existing = findExistingPr(title);
  if (existing) return existing;
  const runSuffix = String(process.env.GITHUB_RUN_ID || Date.now()).replace(/[^0-9]/g, '');
  const branch = `${branchBase}-${runSuffix}`;
  runFile('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com']);
  runFile('git', ['config', 'user.name', 'github-actions[bot]']);
  runFile('git', ['checkout', '-b', branch]);
  runFile('git', ['add', TARGET_FILE, PROVENANCE_FILE]);
  runFile('git', ['commit', '-m', title]);
  runFile('git', ['pull', '--rebase', 'origin', 'main']);
  runFile('git', ['push', 'origin', branch]);
  return runFile('gh', ['pr', 'create', '--title', title, '--body-file', '-', '--base', 'main', '--head', branch], { input: prBody });
}

async function collect() {
  const checkedAt = new Date().toISOString();
  const current = readCurrentPrices();
  const landingResponse = await fetchWithRetry(LANDING_URL, { headers: { Accept: 'text/html', 'User-Agent': 'GuiaPBEV-Bot/2.0' } });
  if (!landingResponse.ok) throw new Error(`Página oficial ANP retornou HTTP ${landingResponse.status}`);
  const resource = discoverLatestMonthlyCsv(await landingResponse.text());

  const csvResponse = await fetchWithRetry(resource.url, { headers: { Accept: 'text/csv', 'User-Agent': 'GuiaPBEV-Bot/2.0' } });
  if (!csvResponse.ok) throw new Error(`CSV ANP retornou HTTP ${csvResponse.status}`);
  const contentType = csvResponse.headers.get('content-type') ?? '';
  if (!/csv|text\/plain/i.test(contentType)) throw new Error(`Content-Type inesperado no CSV ANP: ${contentType}`);
  const parsed = parseCsv(await csvResponse.text());
  const { prices, sourceUpdatedAt } = computeStateAverages(parsed.headers, parsed.rows);
  const checkedStates = Object.keys(prices).length;
  if (checkedStates !== STATES.length) throw new Error(`Cobertura ANP incompleta: ${checkedStates}/${STATES.length} UFs`);
  if (!sourceUpdatedAt) throw new Error('Data de coleta não identificada no CSV ANP');

  const changedStates = STATES.filter(uf =>
    Math.abs(prices[uf].gasoline - (current.prices[uf]?.gasoline ?? 0)) >= 0.01 ||
    Math.abs(prices[uf].ethanol - (current.prices[uf]?.ethanol ?? 0)) >= 0.01,
  );

  let prUrl = null;
  if (changedStates.length > 0 && !dryRun) {
    writeFileSync(TARGET_FILE, buildTarget(prices, resource.label, sourceUpdatedAt), 'utf8');
    updateDatasetProvenance(SOURCE, {
      sourceType: 'official_regulator',
      sourceUrl: resource.url,
      reference: resource.label,
      sourceUpdatedAt,
      verifiedAt: checkedAt.slice(0, 10),
    });
    const period = sourceUpdatedAt.slice(0, 7);
    const title = `chore(data): atualizar preços ANP — ${period}`;
    const body = [
      '## Atualização automática de preços de combustível',
      '',
      `**Fonte oficial:** ${resource.url}`,
      `**Referência da fonte:** ${sourceUpdatedAt}`,
      `**Cobertura:** ${checkedStates}/${STATES.length} UFs`,
      `**Estados alterados (${changedStates.length}):** ${changedStates.join(', ')}`,
      '',
      '> Revisar os deltas antes do merge.',
    ].join('\n');
    prUrl = publishPr(title, body, `data/anp-prices-${period}`);
  }

  return createMaintenanceResult({
    source: SOURCE,
    status: changedStates.length ? 'changed' : 'unchanged',
    checkedAt,
    sourceUpdatedAt,
    repositoryReference: current.reference,
    coverage: { checked: checkedStates, expected: STATES.length },
    changes: changedStates.length,
    prUrl,
    details: { resourceUrl: resource.url, resourceLabel: resource.label, changedStates, dryRun },
  });
}

const resultPath = collectorResultPath(SOURCE);
try {
  const result = await collect();
  writeCollectorResult(resultPath, result);
  console.log(`ANP: ${result.status}; cobertura ${result.coverage.checked}/${result.coverage.expected}; alterações ${result.changes}`);
} catch (error) {
  writeCollectorResult(resultPath, createMaintenanceResult({
    source: SOURCE,
    status: 'failed',
    repositoryReference: readCurrentPrices().reference,
    error: error.message,
  }));
  console.error(`Falha no coletor ANP: ${error.message}`);
  process.exitCode = 1;
}
