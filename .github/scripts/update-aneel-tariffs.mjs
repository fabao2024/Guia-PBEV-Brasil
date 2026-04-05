/**
 * update-aneel-tariffs.mjs
 * Atualiza automaticamente as tarifas residenciais B1 por estado
 * usando dados abertos da ANEEL (dadosabertos.aneel.gov.br / CKAN API).
 *
 * Fluxo:
 *  1. Busca o dataset de Tarifas Homologadas na API CKAN da ANEEL
 *  2. Baixa o CSV mais recente de tarifas vigentes
 *  3. Filtra modalidade B1, soma TE + TUSD por distribuidora
 *  4. Mapeia distribuidoras → estados (hardcoded, principal por cobertura)
 *  5. Se valores mudaram ≥ R$0.01/kWh: atualiza electricityPricesByState.ts e abre PR
 *  6. Se nada mudou: encerra sem criar commit
 *
 * Fonte: https://dadosabertos.aneel.gov.br/dataset/tarifas-de-energia-eletrica-dos-grupos-a-e-b
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

// ── Configuração ──────────────────────────────────────────────────────────────

const CKAN_API    = 'https://dadosabertos.aneel.gov.br/api/3/action';
const PACKAGE_ID  = 'tarifas-de-energia-eletrica-dos-grupos-a-e-b';
const TARGET_FILE = 'src/constants/electricityPricesByState.ts';

// Distribuidora principal por estado (maior cobertura populacional)
// Chave: substring case-insensitive do NomAgente no CSV da ANEEL
const DISTRIBUTOR_MAP = {
  AC: 'energisa acre',
  AL: 'equatorial alagoas',
  AM: 'amazonas energia',
  AP: 'cea',
  BA: 'neoenergia bahia',
  CE: 'equatorial cear',       // Enel CE → Equatorial CE
  DF: 'neoenergia bras',
  ES: 'edp espirito',
  GO: 'equatorial goi',
  MA: 'equatorial maranh',
  MG: 'cemig',
  MS: 'energisa mato grosso do sul',
  MT: 'energisa mato grosso',
  PA: 'equatorial par',
  PB: 'energisa paraiba',
  PE: 'neoenergia pernambuco',
  PI: 'equatorial piau',
  PR: 'copel',
  RJ: 'enel distribui',        // Enel RJ (maior cobertura)
  RN: 'neoenergia cosern',
  RO: 'energisa rondonia',
  RR: 'roraima energia',
  RS: 'ceee',
  SC: 'celesc',
  SE: 'energisa sergipe',
  SP: 'enel distribui.*sp|cpfl paulista',  // SP tem múltiplas; Enel SP é maior
  TO: 'energisa tocantins',
};

const STATES = Object.keys(DISTRIBUTOR_MAP);

// ── Helpers ───────────────────────────────────────────────────────────────────

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }).trim();
}

function parseBRFloat(str) {
  return parseFloat((str ?? '').replace(',', '.'));
}

function parseCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV vazio ou inválido');
  const rawHeader = lines[0].replace(/^\uFEFF/, '');
  const sep = rawHeader.includes(';') ? ';' : ',';
  const headers = rawHeader.split(sep).map(h => h.replace(/"/g, '').trim());
  return lines.slice(1).map(line => {
    const cols = line.split(sep).map(c => c.replace(/"/g, '').trim());
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? '']));
  });
}

/**
 * Busca o CSV de tarifas vigentes na API CKAN da ANEEL.
 */
async function getLatestCsvUrl() {
  console.log('🔍 Buscando dataset na ANEEL CKAN API…');
  const resp = await fetch(`${CKAN_API}/package_show?id=${PACKAGE_ID}`, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'GuiaPBEV-Bot/1.0' },
  });
  if (!resp.ok) throw new Error(`ANEEL API retornou ${resp.status}`);
  const data = await resp.json();
  if (!data.success) throw new Error('ANEEL API retornou success=false');

  const resources = data.result?.resources ?? [];
  // Prefere recurso com "vigente" ou "homologada" no nome, formato CSV
  const csvs = resources.filter(r => {
    const fmt  = (r.format ?? '').toUpperCase();
    const name = (r.name ?? '').toLowerCase();
    return fmt === 'CSV' && (name.includes('vigente') || name.includes('homolog') || name.includes('atual'));
  });
  const candidates = csvs.length ? csvs : resources.filter(r => (r.format ?? '').toUpperCase() === 'CSV');
  if (!candidates.length) throw new Error('Nenhum recurso CSV encontrado');

  const latest = candidates[candidates.length - 1];
  console.log(`✅ Recurso: "${latest.name}" → ${latest.url}`);
  return { url: latest.url, name: latest.name };
}

/**
 * Calcula tarifa B1 por estado: soma TE + TUSD da distribuidora principal.
 */
function computeStateTariffs(rows) {
  // Detecta nomes de colunas (a ANEEL muda às vezes)
  if (!rows.length) throw new Error('CSV sem linhas');
  const sample = rows[0];
  const cols = Object.keys(sample);

  const colAgent   = cols.find(c => /agente|distribu/i.test(c) && !/sig/i.test(c)) ?? cols.find(c => /agente/i.test(c));
  const colModal   = cols.find(c => /modalidade/i.test(c));
  const colTarifa  = cols.find(c => /sigtarifa|tipo.*tarifa|^tarifa$/i.test(c));
  const colValor   = cols.find(c => /vlrtarifa|valor.*tarifa|^valor$/i.test(c));
  const colFimVig  = cols.find(c => /fimvig|fim.*vig|dataterm/i.test(c));

  console.log(`   Colunas detectadas: agente=${colAgent} modal=${colModal} tarifa=${colTarifa} valor=${colValor} vigência=${colFimVig}`);
  if (!colAgent || !colValor) throw new Error('Colunas obrigatórias não encontradas no CSV');

  const today = new Date();

  // Acumula TE + TUSD por distribuidora
  const accum = {}; // { nomAgente: { TE: val, TUSD: val } }

  for (const row of rows) {
    // Filtra apenas B1
    if (colModal && !(row[colModal] ?? '').toUpperCase().includes('B1')) continue;

    // Filtra apenas tarifas em vigor (se coluna de fim de vigência existir)
    if (colFimVig) {
      const rawDate = row[colFimVig] ?? '';
      if (rawDate) {
        // Formato DD/MM/YYYY
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          const end = new Date(+parts[2], +parts[1] - 1, +parts[0]);
          if (end < today) continue; // expirada
        }
      }
    }

    const agente = (row[colAgent] ?? '').toLowerCase().trim();
    if (!agente) continue;

    const tipoTarifa = (row[colTarifa] ?? '').toUpperCase().trim();
    const valor = parseBRFloat(row[colValor]);
    if (isNaN(valor) || valor <= 0) continue;

    if (!accum[agente]) accum[agente] = { TE: 0, TUSD: 0, count: 0 };

    if (tipoTarifa === 'TE')   accum[agente].TE   = valor;
    if (tipoTarifa === 'TUSD') accum[agente].TUSD = valor;
    accum[agente].count++;
  }

  // Mapeia para estados
  const result = {};
  for (const [uf, pattern] of Object.entries(DISTRIBUTOR_MAP)) {
    const regex = new RegExp(pattern, 'i');
    const match = Object.entries(accum).find(([nome]) => regex.test(nome));
    if (!match) {
      console.warn(`⚠️  Sem dados para ${uf} (pattern: ${pattern})`);
      continue;
    }
    const [nome, { TE, TUSD }] = match;
    const total = Math.round((TE + TUSD) * 100) / 100;
    if (total > 0) {
      result[uf] = total;
      console.log(`   ${uf}: R$${total}/kWh (${nome})`);
    }
  }

  return result;
}

/**
 * Lê valores atuais de electricityPricesByState.ts.
 */
function readCurrentTariffs() {
  const src = readFileSync(TARGET_FILE, 'utf-8');
  const result = {};
  const re = /(\w{2}):\s*([\d.]+),/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    result[m[1]] = parseFloat(m[2]);
  }
  return result;
}

/**
 * Gera conteúdo atualizado de electricityPricesByState.ts.
 */
function buildFileContent(tariffs, resourceName, now) {
  const monthLabel = now.toLocaleDateString('pt-BR', {
    month: 'short', year: '2-digit', timeZone: 'America/Sao_Paulo',
  }).replace('. ', '/').replace('.', '');
  const isoDate = now.toISOString().split('T')[0];

  // Lê arquivo atual para preservar comentários de distribuidoras
  const current = readFileSync(TARGET_FILE, 'utf-8');

  // Substitui apenas os valores numéricos, preservando comentários
  let updated = current
    .replace(/\/\/ Atualizado em: .+/, `// Atualizado em: ${isoDate}`)
    .replace(/\/\/ Fonte: .+/, `// Fonte: dadosabertos.aneel.gov.br — ${resourceName}`)
    .replace(/export const ELECTRICITY_PRICES_UPDATED = '.+?'/, `export const ELECTRICITY_PRICES_UPDATED = '${monthLabel}'`);

  for (const [uf, valor] of Object.entries(tariffs)) {
    // Substitui só o valor do estado, preservando o comentário
    updated = updated.replace(
      new RegExp(`(  ${uf}: )[\\d.]+`),
      `$1${valor.toFixed(2)}`
    );
  }

  return updated;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date();
  const monthSlug = now.toLocaleDateString('pt-BR', {
    month: 'short', year: '2-digit', timeZone: 'America/Sao_Paulo',
  }).replace('. ', '-').replace('.', '');

  const { url: csvUrl, name: resourceName } = await getLatestCsvUrl();

  console.log('⬇️  Baixando CSV da ANEEL…');
  const csvResp = await fetch(csvUrl, { headers: { 'User-Agent': 'GuiaPBEV-Bot/1.0' } });
  if (!csvResp.ok) throw new Error(`Erro ao baixar CSV: ${csvResp.status}`);
  const csvText = await csvResp.text();
  console.log(`   ${csvText.length.toLocaleString()} caracteres`);

  console.log('📊 Calculando tarifas B1 por estado…');
  const rows = parseCSV(csvText);
  console.log(`   ${rows.length.toLocaleString()} linhas`);
  const newTariffs = computeStateTariffs(rows);

  const statesFound = Object.keys(newTariffs).length;
  if (statesFound < 15) throw new Error(`Apenas ${statesFound} estados encontrados — dados provavelmente incompletos.`);
  console.log(`   ${statesFound} estados mapeados`);

  const current = readCurrentTariffs();
  const changed = STATES.filter(uf => {
    if (!newTariffs[uf] || !current[uf]) return false;
    return Math.abs(newTariffs[uf] - current[uf]) >= 0.01;
  });

  if (changed.length === 0) {
    console.log('✅ Nenhuma alteração de tarifa detectada. Nada a fazer.');
    return;
  }
  console.log(`🔄 ${changed.length} estados com tarifas alteradas: ${changed.join(', ')}`);

  const newContent = buildFileContent(newTariffs, resourceName, now);
  writeFileSync(TARGET_FILE, newContent, 'utf-8');
  console.log(`✅ ${TARGET_FILE} atualizado`);

  // Abre PR
  const branch = `data/aneel-tariffs-${monthSlug}`;
  run('git config user.email "github-actions[bot]@users.noreply.github.com"');
  run('git config user.name "github-actions[bot]"');
  run(`git checkout -b ${branch}`);
  run(`git add ${TARGET_FILE}`);
  run(`git commit -m "chore(data): atualizar tarifas ANEEL B1 — ${monthSlug}"`);
  run(`git push origin ${branch}`);

  const prBody = [
    '## Atualização automática de tarifas de energia elétrica (ANEEL B1)',
    '',
    `**Fonte:** dadosabertos.aneel.gov.br`,
    `**Recurso:** ${resourceName}`,
    `**Estados alterados (${changed.length}):** ${changed.join(', ')}`,
    '',
    '### Variações detectadas',
    ...changed.map(uf => {
      const delta = (newTariffs[uf] - (current[uf] ?? 0));
      const sign  = delta >= 0 ? '+' : '';
      return `- **${uf}**: R$${(current[uf] ?? '?')}/kWh → R$${newTariffs[uf].toFixed(2)}/kWh (${sign}${delta.toFixed(2)})`;
    }),
    '',
    '> ⚠️ Revisar antes de fazer merge — verificar se os valores correspondem às últimas resoluções da ANEEL.',
    '',
    '🤖 Gerado por [GuiaPBEV Bot](https://github.com/fabao2024/Guia-PBEV-Brasil/actions)',
  ].join('\n');

  run(`gh pr create --title "chore(data): tarifas ANEEL atualizadas — ${monthSlug}" --body ${JSON.stringify(prBody)} --base main --head ${branch}`);
  console.log(`🎉 PR aberto na branch ${branch}`);
}

main().catch(err => {
  console.error('❌ Falha ao atualizar tarifas ANEEL:', err.message);
  process.exit(1);
});
