/**
 * check-ev-news.mjs
 * Monitora feeds RSS de portais automotivos brasileiros em busca de
 * notícias sobre novos EVs nos últimos 35 dias.
 *
 * Fluxo:
 *  1. Busca RSS de múltiplas fontes brasileiras
 *  2. Filtra itens por palavras-chave e data (últimos 35 dias)
 *  3. Deduplica por título similar
 *  4. Salva em /tmp/ev-news-report.json
 *     { items: [{title, url, source, date}], fetchedAt: ISO }
 *
 * Usado por create-maintenance-issue.cjs para listar sugestões de verificação.
 */

import { writeFileSync } from 'fs';

const REPORT_PATH = '/tmp/ev-news-report.json';
const DAYS_BACK   = 35;
const TIMEOUT_MS  = 12_000;

// ── Fontes RSS ────────────────────────────────────────────────────────────────

const FEEDS = [
  { source: 'Motor1 BR',      url: 'https://br.motor1.com/rss/news/all/' },
  { source: 'Quatro Rodas',   url: 'https://quatrorodas.abril.com.br/feed/' },
  { source: 'Autoesporte',    url: 'https://autoesporte.globo.com/rss' },
  { source: 'Canaltech',      url: 'https://canaltech.com.br/rss/' },
  { source: 'Electrosphere',  url: 'https://electrosphere.com.br/feed/' },
  { source: 'Mobility Portal',url: 'https://mobilityportal.com.br/feed/' },
];

// ── Palavras-chave para filtrar artigos relevantes ────────────────────────────
// Regra: artigo deve conter pelo menos 1 termo primário (EV-específico).
// Marcas sozinhas NÃO qualificam — evita artigos sobre carros a combustão.

const PRIMARY_KEYWORDS = [
  'elétrico', 'elétrica', 'elétricos', 'elétricas',
  'veículo elétrico', 'carro elétrico',
  'bev', 'reev', 'plug-in', 'plug in', 'zero emissão',
  'recarga', 'carregamento', 'bateria de', 'autonomia de',
  'vw id.', 'id.4', 'id.3', 'id.7', 'id.buzz',
  'ioniq', 'ev6', 'ev9', 'niro ev',
  'atto', 'dolphin', 'seal', 'han', 'tang', 'yuan',
];

function isRelevant(title) {
  const lower = title.toLowerCase();
  return PRIMARY_KEYWORDS.some(kw => lower.includes(kw));
}

// ── RSS parser leve (sem dependências externas) ───────────────────────────────

function parseRSS(xml) {
  const items = [];
  const itemBlocks = [...xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)];
  for (const [, block] of itemBlocks) {
    const title   = decode(tag(block, 'title'));
    const link    = decode(tag(block, 'link') || tag(block, 'guid'));
    const pubDate = tag(block, 'pubDate') || tag(block, 'dc:date') || tag(block, 'published');
    if (title && link) items.push({ title, link, pubDate });
  }
  return items;
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${name}>`, 'i'));
  return m ? m[1].trim() : '';
}

function decode(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isRecent(dateStr) {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const cutoff = Date.now() - DAYS_BACK * 24 * 60 * 60 * 1000;
    return d.getTime() > cutoff;
  } catch { return false; }
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 60);
}

// ── Busca um feed ─────────────────────────────────────────────────────────────

async function fetchFeed({ source, url }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'GuiaPBEV-Bot/1.0', 'Accept': 'application/rss+xml, application/xml, text/xml' },
    });
    clearTimeout(timer);
    if (!resp.ok) { console.warn(`  ⚠️  ${source}: HTTP ${resp.status}`); return []; }
    const xml = await resp.text();
    const items = parseRSS(xml);
    const filtered = items.filter(i => isRecent(i.pubDate) && isRelevant(i.title));
    console.log(`  ✅ ${source}: ${items.length} itens → ${filtered.length} relevantes`);
    return filtered.map(i => ({
      title:  i.title,
      url:    i.link,
      source,
      date:   i.pubDate ? new Date(i.pubDate).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '?',
    }));
  } catch (err) {
    clearTimeout(timer);
    console.warn(`  ⚠️  ${source}: ${err.name === 'AbortError' ? 'timeout' : err.message}`);
    return [];
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🗞️  Buscando notícias de EVs (últimos ${DAYS_BACK} dias)…`);

  // Busca todos os feeds em paralelo
  const allItems = (await Promise.all(FEEDS.map(fetchFeed))).flat();

  // Deduplica por título similar (remove duplicatas entre fontes)
  const seen = new Set();
  const unique = allItems.filter(item => {
    const key = slugify(item.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Ordena por data (mais recente primeiro)
  unique.sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(`\n📰 ${unique.length} notícias relevantes encontradas (de ${allItems.length} totais)`);
  unique.forEach(i => console.log(`   [${i.date}] ${i.source}: ${i.title.slice(0, 70)}`));

  writeFileSync(REPORT_PATH, JSON.stringify({
    items: unique,
    fetchedAt: new Date().toISOString(),
    daysBack: DAYS_BACK,
  }, null, 2), 'utf-8');

  console.log(`\n📄 Relatório salvo em ${REPORT_PATH}`);
}

main().catch(err => {
  console.error('❌ Falha ao buscar notícias:', err.message);
  writeFileSync(REPORT_PATH, JSON.stringify({ items: [], error: err.message, fetchedAt: new Date().toISOString() }, null, 2));
  process.exit(0); // Não falha o job
});
