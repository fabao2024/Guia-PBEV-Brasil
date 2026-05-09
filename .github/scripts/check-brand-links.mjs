/**
 * check-brand-links.mjs
 * Verifica se todos os links de marcas em BRAND_URLS estão acessíveis.
 *
 * Fluxo:
 *  1. Lê as URLs de src/constants.ts (BRAND_URLS)
 *  2. Faz HEAD request com timeout de 10s em cada uma
 *  3. Escreve relatório em /tmp/brand-links-report.json
 *     { ok: [{brand, url, status}], broken: [{brand, url, status, error}] }
 *
 * Usado pelo create-maintenance-issue.cjs para incluir resultados na issue.
 */

import { readFileSync, writeFileSync } from 'fs';

const TIMEOUT_MS  = 10_000;
const REPORT_PATH = '/tmp/brand-links-report.json';

// Marcas conhecidas por bloquear bots (geo-block, WAF, SSO) — timeout/503 é falso positivo
const KNOWN_BOT_BLOCKING = new Set([
  'Peugeot', 'Mini', 'BMW', 'Mercedes-Benz', 'Audi',
  'Volkswagen', 'Porsche', 'Ford',
]);

// ── Extrai BRAND_URLS do constants.ts via regex ───────────────────────────────

function extractBrandUrls(src) {
  const block = src.match(/export const BRAND_URLS[^=]*=\s*\{([^}]+)\}/s);
  if (!block) throw new Error('BRAND_URLS não encontrado em constants.ts');
  const pairs = [...block[1].matchAll(/"([^"]+)":\s*"(https?:\/\/[^"]+)"/g)];
  if (!pairs.length) throw new Error('Nenhuma URL encontrada em BRAND_URLS');
  return pairs.map(([, brand, url]) => ({ brand, url }));
}

// ── Verifica uma URL ──────────────────────────────────────────────────────────

async function checkUrl({ brand, url }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GuiaPBEV-Bot/1.0)',
        'Accept': 'text/html',
      },
    });
    clearTimeout(timer);
    // 403/405/503 de marca conhecida = geo-block, não link quebrado
    const knownBlock = KNOWN_BOT_BLOCKING.has(brand) && (resp.status === 503 || resp.status === 403 || resp.status === 405);
    const botBlocked = resp.status === 403 || resp.status === 405 || knownBlock;
    const ok = resp.status < 400 || botBlocked;
    return { brand, url, status: resp.status, ok, botBlocked };
  } catch (err) {
    clearTimeout(timer);
    const isTimeout = err.name === 'AbortError';
    // Falso positivo: marca conhecida por bloquear bots via timeout/erro de rede
    if (KNOWN_BOT_BLOCKING.has(brand)) {
      return { brand, url, status: null, ok: true, botBlocked: true, note: 'geo-block conhecido — verificar manualmente se necessário' };
    }
    return { brand, url, status: null, ok: false, error: isTimeout ? 'timeout' : err.message };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const src = readFileSync('src/constants.ts', 'utf-8');
  const entries = extractBrandUrls(src);
  console.log(`🔗 Verificando ${entries.length} links de marcas…`);

  // Verifica em paralelo (lotes de 5 para não sobrecarregar)
  const results = [];
  for (let i = 0; i < entries.length; i += 5) {
    const batch = entries.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map(checkUrl));
    results.push(...batchResults);
    process.stdout.write('.');
  }
  console.log('');

  const ok     = results.filter(r => r.ok);
  const broken = results.filter(r => !r.ok);

  console.log(`✅ OK: ${ok.length} | ❌ Quebrados: ${broken.length}`);
  if (broken.length) {
    broken.forEach(r => console.log(`   ❌ ${r.brand}: ${r.url} (${r.error ?? r.status})`));
  }

  writeFileSync(REPORT_PATH, JSON.stringify({ ok, broken }, null, 2), 'utf-8');
  console.log(`📄 Relatório salvo em ${REPORT_PATH}`);
}

main().catch(err => {
  console.error('❌ Falha ao verificar links:', err.message);
  // Escreve relatório vazio para não quebrar a issue
  writeFileSync(REPORT_PATH, JSON.stringify({ ok: [], broken: [], error: err.message }, null, 2), 'utf-8');
  process.exit(0); // Não falha o job
});
