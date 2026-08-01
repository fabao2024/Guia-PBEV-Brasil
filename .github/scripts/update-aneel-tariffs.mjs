/**
 * Atualiza tarifas residenciais B1 (TE + TUSD) por UF.
 * Fonte oficial: ANEEL Dados Abertos, dataset de tarifas de aplicação.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createMaintenanceResult, fetchWithRetry } from './maintenance-core.mjs';
import { collectorResultPath, writeCollectorResult } from './maintenance-io.mjs';
import { PROVENANCE_FILE, updateDatasetProvenance } from './provenance-registry.mjs';
import { runFile } from './security-utils.mjs';

const SOURCE = 'aneel';
const CKAN_API = 'https://dadosabertos.aneel.gov.br/api/3/action';
const PACKAGE_ID = 'tarifas-distribuidoras-energia-eletrica';
const TARGET_FILE = 'src/constants/electricityPricesByState.ts';
const PAGE_SIZE = 1000;
const dryRun = process.env.MAINTENANCE_DRY_RUN === '1';
const AGENTS_BY_STATE = {
  AC: ['EAC'], AL: ['EQUATORIAL AL'], AM: ['Âmbar Amazonas'], AP: ['CEA'],
  BA: ['COELBA'], CE: ['ENEL CE'], DF: ['Neoenergia Brasília'], ES: ['EDP ES'],
  GO: ['EQUATORIAL GO', 'CHESP'], MA: ['EQUATORIAL MA'], MG: ['CEMIG-D'], MS: ['EMS'],
  MT: ['EMT'], PA: ['EQUATORIAL PA'], PB: ['EPB'], PE: ['Neoenergia PE'],
  PI: ['EQUATORIAL PI'], PR: ['COPEL-DIS'], RJ: ['ENEL RJ', 'LIGHT SESA'],
  RN: ['COSERN'], RO: ['ERO'], RR: ['ÂMBAR ENERGIA RR'],
  RS: ['CEEE-D', 'RGE'], SC: ['CELESC'], SE: ['ESE', 'SULGIPE'],
  SP: ['ELETROPAULO', 'EDP SP', 'CPFL-PAULISTA', 'CPFL-PIRATINING', 'ELEKTRO', 'CPFL Santa Cruz'],
  TO: ['ETO'],
};
const STATES = Object.keys(AGENTS_BY_STATE);

function parseBrNumber(value) {
  return Number.parseFloat(String(value ?? '').replace(/\./g, '').replace(',', '.'));
}

async function fetchJson(url) {
  const response = await fetchWithRetry(url, { headers: { Accept: 'application/json', 'User-Agent': 'GuiaPBEV-Bot/2.0' } });
  if (!response.ok) throw new Error(`ANEEL retornou HTTP ${response.status}`);
  const data = await response.json();
  if (!data?.success) throw new Error('ANEEL retornou success=false');
  return data.result;
}

async function discoverResource() {
  const result = await fetchJson(`${CKAN_API}/package_show?id=${encodeURIComponent(PACKAGE_ID)}`);
  const candidates = (result.resources ?? []).filter(resource =>
    resource.datastore_active && /tarifas-homologadas-distribuidoras-energia-eletrica\.csv/i.test(resource.name ?? resource.url ?? ''),
  );
  if (!candidates.length) throw new Error('Recurso ativo de tarifas homologadas não encontrado na ANEEL');
  const resource = candidates.at(-1);
  if (!/^[0-9a-f-]{36}$/i.test(resource.id)) throw new Error('ID de recurso ANEEL inválido');
  const url = new URL(resource.url);
  if (url.protocol !== 'https:' || url.hostname !== 'dadosabertos.aneel.gov.br') throw new Error('URL de recurso ANEEL fora do host oficial');
  return { id: resource.id, name: resource.name, url: resource.url, hash: resource.hash ?? null };
}

async function fetchResidentialRows(resourceId) {
  const filters = JSON.stringify({
    DscSubGrupo: 'B1',
    DscBaseTarifaria: 'Tarifa de Aplicação',
    DscClasse: 'Residencial',
    DscSubClasse: 'Residencial',
    DscModalidadeTarifaria: 'Convencional',
  });
  const rows = [];
  let total = null;
  for (let offset = 0; total === null || offset < total; offset += PAGE_SIZE) {
    const query = new URLSearchParams({ id: resourceId, filters, limit: String(PAGE_SIZE), offset: String(offset) });
    const result = await fetchJson(`${CKAN_API}/datastore_search?${query}`);
    if (!Array.isArray(result.records)) throw new Error('ANEEL não retornou records');
    total = Number(result.total);
    if (!Number.isInteger(total) || total <= 0 || total > 50000) throw new Error(`Cardinalidade ANEEL inesperada: ${result.total}`);
    rows.push(...result.records);
  }
  if (rows.length !== total) throw new Error(`Paginação ANEEL incompleta: ${rows.length}/${total}`);
  return rows;
}

function computeStateTariffs(rows, asOfDate) {
  const byAgent = new Map();
  let sourceUpdatedAt = null;
  let currentRows = 0;

  for (const row of rows) {
    if (!(row.DatInicioVigencia <= asOfDate && row.DatFimVigencia >= asOfDate)) continue;
    if (row.DscUnidadeTerciaria !== 'MWh' || row.DscDetalhe !== 'Não se aplica' || row.NomPostoTarifario !== 'Não se aplica') continue;
    const tusd = parseBrNumber(row.VlrTUSD);
    const te = parseBrNumber(row.VlrTE);
    if (!Number.isFinite(tusd) || !Number.isFinite(te) || tusd <= 0 || te <= 0) continue;
    byAgent.set(row.SigAgente, Math.round(((tusd + te) / 1000) * 100) / 100);
    currentRows += 1;
    if (row.DatGeracaoConjuntoDados && (!sourceUpdatedAt || row.DatGeracaoConjuntoDados > sourceUpdatedAt)) {
      sourceUpdatedAt = row.DatGeracaoConjuntoDados;
    }
  }

  const tariffs = {};
  const missingAgents = {};
  for (const [uf, agents] of Object.entries(AGENTS_BY_STATE)) {
    const values = agents.map(agent => byAgent.get(agent)).filter(Number.isFinite);
    if (values.length !== agents.length) {
      missingAgents[uf] = agents.filter(agent => !byAgent.has(agent));
      continue;
    }
    tariffs[uf] = Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
  }
  return { tariffs, sourceUpdatedAt, currentRows, missingAgents };
}

function readCurrentTariffs() {
  const source = readFileSync(TARGET_FILE, 'utf8');
  const tariffs = {};
  for (const match of source.matchAll(/(\w{2}):\s*([\d.]+),/g)) tariffs[match[1]] = Number(match[2]);
  return {
    source,
    tariffs,
    reference: source.match(/ELECTRICITY_PRICES_UPDATED = '([^']+)'/)?.[1] ?? null,
  };
}

function buildTarget(currentSource, tariffs, resource, sourceUpdatedAt) {
  const sourceDate = new Date(`${sourceUpdatedAt}T12:00:00Z`);
  const monthLabel = sourceDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' }).replace('.', '');
  let updated = currentSource
    .replace(/\/\/ Fonte: .+/, `// Fonte: dadosabertos.aneel.gov.br — ${resource.name} · recurso ${resource.id}`)
    .replace(/\/\/ Atualizado em: .+/, `// Atualizado em: ${sourceUpdatedAt}`)
    .replace(/export const ELECTRICITY_PRICES_UPDATED = '.+?'/, `export const ELECTRICITY_PRICES_UPDATED = '${monthLabel}'`);
  for (const [uf, value] of Object.entries(tariffs)) {
    updated = updated.replace(new RegExp(`(  ${uf}: )[\\d.]+`), `$1${value.toFixed(2)}`);
  }
  return updated;
}

function findExistingPr(title) {
  return runFile('gh', ['pr', 'list', '--state', 'open', '--search', `${title} in:title`, '--json', 'url', '--jq', '.[0].url // empty']);
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
  const asOfDate = checkedAt.slice(0, 10);
  const current = readCurrentTariffs();
  const resource = await discoverResource();
  const rows = await fetchResidentialRows(resource.id);
  const computed = computeStateTariffs(rows, asOfDate);
  const checkedStates = Object.keys(computed.tariffs).length;
  if (checkedStates !== STATES.length) {
    throw new Error(`Cobertura ANEEL incompleta: ${checkedStates}/${STATES.length} UFs; agentes ausentes: ${JSON.stringify(computed.missingAgents)}`);
  }
  if (!computed.sourceUpdatedAt) throw new Error('Data de geração ANEEL não identificada');

  const changedStates = STATES.filter(uf => Math.abs(computed.tariffs[uf] - (current.tariffs[uf] ?? 0)) >= 0.01);
  let prUrl = null;
  if (changedStates.length > 0 && !dryRun) {
    writeFileSync(TARGET_FILE, buildTarget(current.source, computed.tariffs, resource, computed.sourceUpdatedAt), 'utf8');
    updateDatasetProvenance(SOURCE, {
      sourceType: 'official_regulator',
      sourceUrl: resource.url,
      reference: resource.name,
      sourceUpdatedAt: computed.sourceUpdatedAt,
      verifiedAt: checkedAt.slice(0, 10),
    });
    const period = computed.sourceUpdatedAt.slice(0, 7);
    const title = `chore(data): atualizar tarifas ANEEL B1 — ${period}`;
    const body = [
      '## Atualização automática de tarifas residenciais B1',
      '',
      `**Fonte oficial:** ${resource.url}`,
      `**Recurso:** ${resource.id}`,
      `**Referência da fonte:** ${computed.sourceUpdatedAt}`,
      `**Cobertura:** ${checkedStates}/${STATES.length} UFs`,
      `**Estados alterados (${changedStates.length}):** ${changedStates.join(', ')}`,
      '',
      '> Valores TE + TUSD, sem tributos e bandeira. Revisar os deltas antes do merge.',
    ].join('\n');
    prUrl = publishPr(title, body, `data/aneel-tariffs-${period}`);
  }

  return createMaintenanceResult({
    source: SOURCE,
    status: changedStates.length ? 'changed' : 'unchanged',
    checkedAt,
    sourceUpdatedAt: computed.sourceUpdatedAt,
    repositoryReference: current.reference,
    coverage: { checked: checkedStates, expected: STATES.length },
    changes: changedStates.length,
    prUrl,
    details: {
      resourceId: resource.id,
      resourceUrl: resource.url,
      resourceHash: resource.hash,
      recordsScanned: rows.length,
      currentRows: computed.currentRows,
      changedStates,
      dryRun,
    },
  });
}

const resultPath = collectorResultPath(SOURCE);
try {
  const result = await collect();
  writeCollectorResult(resultPath, result);
  console.log(`ANEEL: ${result.status}; cobertura ${result.coverage.checked}/${result.coverage.expected}; alterações ${result.changes}`);
} catch (error) {
  writeCollectorResult(resultPath, createMaintenanceResult({
    source: SOURCE,
    status: 'failed',
    repositoryReference: readCurrentTariffs().reference,
    error: error.message,
  }));
  console.error(`Falha no coletor ANEEL: ${error.message}`);
  process.exitCode = 1;
}
