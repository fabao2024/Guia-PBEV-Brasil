/**
 * update-anp-prices.mjs
 * Atualiza automaticamente os preços médios de combustível por estado
 * usando dados abertos da ANP via dados.gov.br (API CKAN).
 *
 * Fluxo:
 *  1. Chama dados.gov.br para obter URL do CSV mais recente
 *  2. Baixa e faz parse do CSV (separador ; · decimal ,)
 *  3. Calcula média de "Preço Médio Revenda" por estado para
 *     GASOLINA COMUM e ETANOL HIDRATADO
 *  4. Se valores mudaram: atualiza fuelPricesByState.ts e abre PR
 *  5. Se nada mudou: encerra sem criar commit
 *
 * Fonte oficial: https://dados.gov.br/dados/conjuntos-dados/serie-historica-de-precos-de-combustiveis-por-revenda
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

// ── Configuração ──────────────────────────────────────────────────────────────

const DATASET_ID = 'serie-historica-de-precos-de-combustiveis-por-revenda';
const API_URL    = `https://dados.gov.br/api/publico/conjuntos-dados/${DATASET_ID}`;

// Nomes de produto conforme ANP (busca case-insensitive)
const GASOLINE_KEYWORD = 'GASOLINA COMUM';
const ETHANOL_KEYWORD  = 'ETANOL HIDRATADO';

// Coluna com a sigla do estado
const STATE_COL = 'Estado - Sigla';
// Coluna com o produto
const PRODUCT_COL = 'Produto';
// Coluna com preço médio de revenda
const PRICE_COL = 'Preço Médio Revenda';

const TARGET_FILE = 'src/constants/fuelPricesByState.ts';

// Estados esperados
const STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
                'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }).trim();
}

function parseBRFloat(str) {
  // Converte "6,15" → 6.15
  return parseFloat(str.replace(',', '.'));
}

/**
 * Parse CSV com separador ; e header na primeira linha.
 * Retorna array de objetos { coluna: valor }.
 */
function parseCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV vazio ou inválido');

  // O CSV da ANP usa ; como separador e às vezes tem BOM
  const rawHeader = lines[0].replace(/^\uFEFF/, '');
  const sep = rawHeader.includes(';') ? ';' : ',';
  const headers = rawHeader.split(sep).map(h => h.replace(/"/g, '').trim());

  return lines.slice(1).map(line => {
    const cols = line.split(sep).map(c => c.replace(/"/g, '').trim());
    return Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? '']));
  });
}

/**
 * Busca o recurso CSV mais recente no dataset da ANP.
 * A API dados.gov.br retorna recursos em ordem cronológica;
 * pegamos o último que seja CSV e contenha "estado" ou "resumo" no nome.
 */
async function getLatestCsvUrl() {
  console.log('🔍 Buscando recursos no dados.gov.br…');
  const resp = await fetch(API_URL, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'GuiaPBEV-Bot/1.0' }
  });
  if (!resp.ok) throw new Error(`dados.gov.br retornou ${resp.status}: ${await resp.text()}`);

  const data = await resp.json();

  // A estrutura pode variar; tentamos ambos os formatos
  const resources = data?.recursos ?? data?.result?.resources ?? data?.resources ?? [];
  if (!resources.length) {
    console.log('Resposta da API:', JSON.stringify(data, null, 2).slice(0, 500));
    throw new Error('Nenhum recurso encontrado. Verifique o formato da API dados.gov.br.');
  }

  // Filtra CSVs e prefere os de resumo por estado (menores e diretos)
  const csvs = resources.filter(r => {
    const fmt = (r.formato ?? r.format ?? '').toUpperCase();
    const name = (r.titulo ?? r.name ?? '').toLowerCase();
    return fmt === 'CSV' && (name.includes('estado') || name.includes('resumo') || name.includes('mensal'));
  });

  // Fallback: qualquer CSV se não houver resumo
  const candidates = csvs.length ? csvs : resources.filter(r =>
    (r.formato ?? r.format ?? '').toUpperCase() === 'CSV'
  );

  if (!candidates.length) throw new Error('Nenhum recurso CSV encontrado no dataset.');

  // Pega o último (mais recente)
  const latest = candidates[candidates.length - 1];
  const url = latest.link ?? latest.url ?? latest.downloadUrl;
  const name = latest.titulo ?? latest.name ?? '(sem nome)';
  console.log(`✅ Recurso selecionado: "${name}" → ${url}`);
  return { url, name };
}

/**
 * Computa médias de preço por estado a partir das linhas do CSV.
 */
function computeStateAverages(rows) {
  const accum = {}; // { UF: { gasoline: [prices], ethanol: [prices] } }

  for (const row of rows) {
    const uf      = (row[STATE_COL] ?? '').trim().toUpperCase();
    const produto = (row[PRODUCT_COL] ?? '').trim().toUpperCase();
    const priceRaw = row[PRICE_COL] ?? '';

    if (!STATES.includes(uf) || !priceRaw) continue;
    const price = parseBRFloat(priceRaw);
    if (isNaN(price) || price <= 0) continue;

    if (!accum[uf]) accum[uf] = { gasoline: [], ethanol: [] };

    if (produto.includes(GASOLINE_KEYWORD.toUpperCase())) accum[uf].gasoline.push(price);
    if (produto.includes(ETHANOL_KEYWORD.toUpperCase()))  accum[uf].ethanol.push(price);
  }

  const avg = arr => arr.length ? Math.round((arr.reduce((a, b) => a + b) / arr.length) * 100) / 100 : null;

  const result = {};
  for (const uf of STATES) {
    const a = accum[uf];
    if (!a) { console.warn(`⚠️  Sem dados para ${uf}`); continue; }
    const g = avg(a.gasoline);
    const e = avg(a.ethanol);
    if (g && e) result[uf] = { gasoline: g, ethanol: e };
    else console.warn(`⚠️  Dados incompletos para ${uf}: gasolina=${g} etanol=${e}`);
  }
  return result;
}

/**
 * Lê os valores atuais de fuelPricesByState.ts para comparação.
 */
function readCurrentPrices() {
  const src = readFileSync(TARGET_FILE, 'utf-8');
  const current = {};
  const re = /(\w{2}):\s*\{\s*gasoline:\s*([\d.]+),\s*ethanol:\s*([\d.]+)\s*\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    current[m[1]] = { gasoline: parseFloat(m[2]), ethanol: parseFloat(m[3]) };
  }
  return current;
}

/**
 * Gera o conteúdo atualizado de fuelPricesByState.ts.
 */
function buildFileContent(prices, resourceName, now) {
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'America/Sao_Paulo' })
    .replace('.', '').trim() + '/' + String(now.getFullYear()).slice(-2);
  const isoDate = now.toISOString().split('T')[0];

  const lines = STATES
    .filter(uf => prices[uf])
    .map(uf => `  ${uf}: { gasoline: ${prices[uf].gasoline.toFixed(2)}, ethanol: ${prices[uf].ethanol.toFixed(2)} },`);

  return `// Preços médios de revenda por estado — ANP (SHLP), referência: ${monthLabel}
// Fonte: dados.gov.br · Produto: GASOLINA COMUM e ETANOL HIDRATADO (R$/L)
// Recurso: ${resourceName}
// Atualizado em: ${isoDate}

export const FUEL_PRICES_UPDATED = '${monthLabel}';

export const FUEL_PRICES_BY_STATE: Record<string, { gasoline: number; ethanol: number }> = {
${lines.join('\n')}
};

export function getDefaultFuelPrice(state: string, fuelType: 'gasoline' | 'ethanol'): number {
  const prices = FUEL_PRICES_BY_STATE[state] ?? FUEL_PRICES_BY_STATE['SP'];
  return prices[fuelType];
}
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date();
  const monthSlug = now.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'America/Sao_Paulo' })
    .replace('.', '').trim() + '-' + String(now.getFullYear()).slice(-2);

  // 1. Obter URL do CSV
  const { url: csvUrl, name: resourceName } = await getLatestCsvUrl();

  // 2. Baixar CSV
  console.log('⬇️  Baixando CSV…');
  const csvResp = await fetch(csvUrl, { headers: { 'User-Agent': 'GuiaPBEV-Bot/1.0' } });
  if (!csvResp.ok) throw new Error(`Erro ao baixar CSV: ${csvResp.status}`);
  const csvText = await csvResp.text();
  console.log(`   ${csvText.length.toLocaleString()} caracteres recebidos`);

  // 3. Parse + médias
  console.log('📊 Calculando médias por estado…');
  const rows = parseCSV(csvText);
  console.log(`   ${rows.length.toLocaleString()} linhas processadas`);
  const newPrices = computeStateAverages(rows);

  const statesFound = Object.keys(newPrices).length;
  if (statesFound < 20) throw new Error(`Apenas ${statesFound} estados encontrados — dados provavelmente incompletos.`);
  console.log(`   ${statesFound} estados com dados completos`);

  // 4. Comparar com valores atuais
  const current = readCurrentPrices();
  const changed = STATES.filter(uf => {
    if (!newPrices[uf] || !current[uf]) return false;
    return Math.abs(newPrices[uf].gasoline - current[uf].gasoline) >= 0.01 ||
           Math.abs(newPrices[uf].ethanol  - current[uf].ethanol)  >= 0.01;
  });

  if (changed.length === 0) {
    console.log('✅ Nenhuma alteração significativa de preço detectada. Nada a fazer.');
    return;
  }
  console.log(`🔄 ${changed.length} estados com preços alterados: ${changed.join(', ')}`);

  // 5. Atualizar arquivo
  const newContent = buildFileContent(newPrices, resourceName, now);
  writeFileSync(TARGET_FILE, newContent, 'utf-8');
  console.log(`✅ ${TARGET_FILE} atualizado`);

  // 6. Abrir PR
  const branch = `data/anp-prices-${monthSlug}`;
  run('git config user.email "github-actions[bot]@users.noreply.github.com"');
  run('git config user.name "github-actions[bot]"');
  run(`git checkout -b ${branch}`);
  run(`git add ${TARGET_FILE}`);
  run(`git commit -m "chore(data): atualizar preços ANP — ${monthSlug}"`);
  run(`git push origin ${branch}`);

  const prBody = `## Atualização automática de preços de combustível

**Fonte:** dados.gov.br · ANP SHLP
**Recurso:** ${resourceName}
**Estados alterados (${changed.length}):** ${changed.join(', ')}

### Variações detectadas
${changed.map(uf => {
    const o = current[uf] ?? {};
    const n = newPrices[uf];
    const dg = ((n.gasoline - (o.gasoline ?? 0)) >= 0 ? '+' : '') + ((n.gasoline - (o.gasoline ?? 0)).toFixed(2));
    const de = ((n.ethanol  - (o.ethanol  ?? 0)) >= 0 ? '+' : '') + ((n.ethanol  - (o.ethanol  ?? 0)).toFixed(2));
    return `- **${uf}**: gasolina ${o.gasoline ?? '?'} → ${n.gasoline} (${dg}) · etanol ${o.ethanol ?? '?'} → ${n.ethanol} (${de})`;
  }).join('\n')}

> ⚠️ Revisar antes de fazer merge — verificar se os valores fazem sentido para os estados.

🤖 Gerado por [GuiaPBEV Bot](https://github.com/fabao2024/Guia-PBEV-Brasil/actions)`;

  run(`gh pr create --title "chore(data): preços ANP atualizados — ${monthSlug}" --body ${JSON.stringify(prBody)} --base main --head ${branch}`);
  console.log(`🎉 PR aberto na branch ${branch}`);
}

main().catch(err => {
  console.error('❌ Falha ao atualizar preços ANP:', err.message);
  console.error(err.stack);
  process.exit(1);
});
