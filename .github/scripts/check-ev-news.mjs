/**
 * Monitora fontes editoriais para descoberta de mudanças no mercado de BEVs.
 * Notícias geram watchlist; somente fontes oficiais podem confirmar mutações do catálogo.
 */
import { readFileSync } from 'node:fs';
import { classifyNewsItem, createMaintenanceResult } from './maintenance-core.mjs';
import { collectorResultPath, writeCollectorResult } from './maintenance-io.mjs';
import { decodeXmlEntities } from './security-utils.mjs';

const SOURCE = 'news';
const FEEDS = [
  { name: 'Canaltech Carros', url: 'https://canaltech.com.br/rss/carros/' },
  { name: 'InsideEVs Brasil', url: 'https://insideevs.uol.com.br/rss/news/all/' },
  { name: 'Electrosphere', url: 'https://electrosphere.com.br/feed/' },
  { name: 'Mobility Channel', url: 'https://mobilitychannel.com.br/feed/' },
  { name: 'AutoEsporte', url: 'https://autoesporte.globo.com/rss/autoesporte/' },
  { name: 'Quatro Rodas', url: 'https://quatrorodas.abril.com.br/feed/' },
];
const MAX_ITEM_AGE_DAYS = 35;
const REQUEST_TIMEOUT_MS = 15000;
const catalog = JSON.parse(readFileSync('public/data/cars.json', 'utf8')).cars ?? [];

function stripMarkup(value) {
  return decodeXmlEntities(String(value ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}

function extractTag(xml, tag) {
  const match = String(xml).match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? stripMarkup(match[1]) : '';
}

function parseFeed(xml, sourceName) {
  const blocks = [...String(xml).matchAll(/<(?:item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/(?:item|entry)>/gi)].map(match => match[1]);
  return blocks.slice(0, 40).map(block => {
    const href = block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1];
    return {
      source: sourceName,
      sourceType: 'specialist_media',
      title: extractTag(block, 'title'),
      description: extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content'),
      link: extractTag(block, 'link') || (href ? decodeXmlEntities(href) : ''),
      publishedAt: extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated'),
    };
  }).filter(item => item.title && /^https?:\/\//i.test(item.link));
}

function isRecent(value, now) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return true;
  return timestamp >= now.getTime() - MAX_ITEM_AGE_DAYS * 86400000;
}

function normalize(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findCatalogMatch(item) {
  const text = normalize(item.title);
  return catalog.find(car => {
    const brand = normalize(car.brand);
    const model = normalize(car.model);
    return brand.length >= 3 && model.length >= 3 && text.includes(brand) && text.includes(model);
  }) ?? null;
}

async function fetchFeed(feed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(feed.url, {
      headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml', 'User-Agent': 'GuiaPBEV-Bot/2.0' },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const items = parseFeed(xml, feed.name);
    if (!items.length) throw new Error('feed sem itens válidos');
    return { name: feed.name, url: feed.url, status: 'reachable', items };
  } catch (error) {
    return {
      name: feed.name,
      url: feed.url,
      status: error.name === 'AbortError' ? 'timeout' : 'failed',
      error: String(error.message).slice(0, 160),
      items: [],
    };
  } finally {
    clearTimeout(timer);
  }
}

async function collect() {
  const now = new Date();
  const feedResults = await Promise.all(FEEDS.map(fetchFeed));
  const healthy = feedResults.filter(feed => feed.status === 'reachable');
  const candidates = healthy.flatMap(feed => feed.items).filter(item => isRecent(item.publishedAt, now));
  const unique = [...new Map(candidates.map(item => [item.link, item])).values()];
  const findings = [];
  const rejected = [];
  let sourceUpdatedAt = null;

  for (const item of unique) {
    const published = Number.isFinite(Date.parse(item.publishedAt)) ? new Date(item.publishedAt).toISOString().slice(0, 10) : null;
    if (published && (!sourceUpdatedAt || published > sourceUpdatedAt)) sourceUpdatedAt = published;
    const classification = classifyNewsItem({
      ...item,
      sourceType: 'specialist_media',
      evNative: item.source === 'InsideEVs Brasil',
    });
    const catalogMatch = findCatalogMatch(item);
    if (classification.classification === 'irrelevant') {
      rejected.push({ title: item.title, link: item.link, reason: classification.reason });
      continue;
    }
    findings.push({
      source: item.source,
      title: item.title,
      link: item.link,
      publishedAt: published,
      classification: catalogMatch ? 'already_known' : classification.classification,
      confidence: classification.confidence,
      reason: catalogMatch ? `Já relacionado a ${catalogMatch.brand} ${catalogMatch.model} no catálogo.` : classification.reason,
    });
  }

  const failedFeeds = feedResults.filter(feed => feed.status !== 'reachable');
  const status = failedFeeds.length > 0 ? 'partial' : findings.length > 0 ? 'changed' : 'unchanged';
  return createMaintenanceResult({
    source: SOURCE,
    status,
    checkedAt: now.toISOString(),
    sourceUpdatedAt,
    repositoryReference: `${catalog.length} veículos`,
    coverage: { checked: healthy.length, expected: FEEDS.length },
    changes: findings.filter(item => item.classification !== 'already_known').length,
    error: failedFeeds.length ? `Cobertura RSS parcial: ${healthy.length}/${FEEDS.length} fontes` : null,
    details: {
      feeds: feedResults.map(({ name, url, status: feedStatus, error }) => ({ name, url, status: feedStatus, error: error ?? null })),
      findings: findings.slice(0, 30),
      rejected: rejected.slice(0, 30),
      sourceHierarchy: ['official_manufacturer', 'official_regulator', 'official_press_release', 'specialist_media', 'speculative_watchlist'],
    },
  });
}

const resultPath = collectorResultPath(SOURCE);
try {
  const result = await collect();
  writeCollectorResult(resultPath, result);
  console.log(`Notícias: ${result.status}; cobertura ${result.coverage.checked}/${result.coverage.expected}; achados ${result.changes}`);
} catch (error) {
  writeCollectorResult(resultPath, createMaintenanceResult({ source: SOURCE, status: 'failed', error: error.message }));
  console.error(`Falha no monitor de notícias: ${error.message}`);
  process.exitCode = 1;
}
