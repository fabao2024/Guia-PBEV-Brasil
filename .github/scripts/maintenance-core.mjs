const EV_TERMS = [
  /\bbev\b/i,
  /\bve[ií]culo(?:s)? el[eé]trico(?:s)?\b/i,
  /\bcarro(?:s)? el[eé]trico(?:s)?\b/i,
  /\bel[eé]trico(?:s)?\b/i,
];

const COMMERCIAL_TERMS = [
  /\blan[çc](?:a|amento|ado|ou)\b/i,
  /\bpre[çc]o(?:s)?\b/i,
  /\breserva(?:s)?\b/i,
  /\bvenda(?:s)?\b/i,
  /\bvers[aã]o(?:ões|es)?\b/i,
  /\bdescontinuad[oa]s?\b/i,
  /\bestreia\b/i,
  /\bchega(?:r|da|ndo)?\b/i,
  /\b(?:revela|apresenta|anuncia)\b/i,
];

const NON_BEV_TERMS = [
  /\bphev\b/i,
  /\breev\b/i,
  /\berev\b/i,
  /\bh[ií]brid[oa]s?\b/i,
  /\bcombust[aã]o\b/i,
  /\b(?:gasolina|diesel)\b/i,
];

const VALID_RESULT_STATUSES = new Set(['changed', 'unchanged', 'partial', 'failed']);

export async function fetchWithRetry(url, options = {}, {
  attempts = 3,
  timeoutMs = 30_000,
  retryDelayMs = 750,
} = {}) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error('Coletor crítico exige fonte HTTPS');
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 5) throw new Error('Número de tentativas inválido');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 120_000) throw new Error('Timeout inválido');
  if (!Number.isInteger(retryDelayMs) || retryDelayMs < 0 || retryDelayMs > 10_000) throw new Error('Backoff inválido');

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(parsed.href, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs),
      });
      const transientHttp = response.status === 429 || response.status >= 500;
      if (!transientHttp || attempt === attempts) return response;
    } catch (error) {
      if (attempt === attempts) throw error;
    }
    if (retryDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelayMs * attempt));
    }
  }
  throw new Error('Coletor crítico esgotou as tentativas de rede');
}

export function createMaintenanceResult({
  source = '',
  status = '',
  checkedAt = new Date().toISOString(),
  sourceUpdatedAt = null,
  repositoryReference = null,
  coverage = null,
  changes = 0,
  prUrl = null,
  error = null,
  details = {},
} = {}) {
  if (!source || typeof source !== 'string') throw new Error('Fonte do coletor é obrigatória');
  if (!VALID_RESULT_STATUSES.has(status)) throw new Error(`Status de coletor inválido: ${status}`);
  if (status === 'failed' && !error) throw new Error('Resultado failed exige erro explícito');

  return {
    schemaVersion: 1,
    source,
    status,
    checkedAt,
    sourceUpdatedAt,
    repositoryReference,
    coverage,
    changes,
    prUrl,
    error: error ? String(error).slice(0, 500) : null,
    details,
  };
}

export function parseCollectorPayload(payload, expectedSource) {
  if (!payload) {
    return createMaintenanceResult({
      source: expectedSource,
      status: 'failed',
      error: 'Resultado do coletor ausente',
    });
  }

  try {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (parsed?.schemaVersion !== 1 || parsed?.source !== expectedSource || !VALID_RESULT_STATUSES.has(parsed?.status)) {
      throw new Error('Schema, fonte ou status inválido');
    }
    return parsed;
  } catch (error) {
    return createMaintenanceResult({
      source: expectedSource,
      status: 'failed',
      error: `Resultado do coletor inválido: ${error.message}`,
    });
  }
}

export function maintenancePeriodMarker(period) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(period))) {
    throw new Error('Período de manutenção inválido; esperado YYYY-MM');
  }
  return `<!-- monthly-maintenance:${period} -->`;
}

function normalizeColumn(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function resolveAnpColumns(headers = []) {
  const findAlias = aliases => headers.find(header => aliases.includes(normalizeColumn(header)));
  const columns = {
    state: findAlias(['estado - sigla', 'uf', 'estado']),
    product: findAlias(['produto', 'combustivel']),
    price: findAlias(['valor de venda', 'preco medio revenda', 'preco medio de revenda']),
  };
  const missing = Object.entries(columns).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`Colunas obrigatórias da ANP ausentes: ${missing.join(', ')}`);
  }
  return columns;
}

export function classifyLinkResponse(httpStatus) {
  if (httpStatus === 403 || httpStatus === 405 || httpStatus === 429) {
    return { status: 'blocked', verifiable: false };
  }
  if (Number.isInteger(httpStatus) && httpStatus >= 200 && httpStatus < 400) {
    return { status: 'reachable', verifiable: true };
  }
  if (httpStatus === 404 || httpStatus === 410) {
    return { status: 'broken', verifiable: true };
  }
  if (Number.isInteger(httpStatus)) {
    return { status: 'unavailable', verifiable: false };
  }
  return { status: 'timeout', verifiable: false };
}

function textFromHtml(value) {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function brDateToIso(value) {
  const match = String(value).match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

export function discoverPbevEdition(html, currentReference, baseUrl) {
  const anchors = [...String(html).matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const candidate = anchors.find(match => {
    const label = textFromHtml(match[2]);
    return /PBEV/i.test(label) && /2026/i.test(label) && /\.pdf\b/i.test(label);
  });

  if (!candidate) {
    throw new Error('Nenhuma edição PBEV 2026 identificada no conteúdo oficial');
  }

  const reference = textFromHtml(candidate[2]);
  const context = String(html).slice(Math.max(0, candidate.index - 600), candidate.index);
  const dates = [...textFromHtml(context).matchAll(/\d{2}\/\d{2}\/\d{4}/g)];
  const sourceUpdatedAt = brDateToIso(dates.at(-1)?.[0] ?? '');
  if (!sourceUpdatedAt) {
    throw new Error('Data de atualização da edição PBEV não identificada');
  }

  const normalize = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
  return {
    status: normalize(reference).includes(normalize(currentReference)) ? 'unchanged' : 'changed',
    reference,
    sourceUpdatedAt,
    url: new URL(candidate[1], baseUrl).href,
  };
}

export function deriveOverallStatus(results = [], criticalSources = []) {
  const bySource = new Map(results.map(result => [result?.source, result]));
  const blockingSources = criticalSources.filter(source => {
    const result = bySource.get(source);
    return !result || !VALID_RESULT_STATUSES.has(result.status) || ['partial', 'failed'].includes(result.status);
  });

  if (blockingSources.length > 0) {
    return { code: 'blocked', label: '🔴 BLOQUEADA', blockingSources };
  }

  const advisoryFailures = results
    .filter(result => ['partial', 'failed'].includes(result?.status) && !criticalSources.includes(result?.source))
    .map(result => result.source);
  if (advisoryFailures.length > 0) {
    return { code: 'attention', label: '🟡 ATENÇÃO', blockingSources: [], advisoryFailures };
  }

  if (results.some(result => result?.status === 'changed')) {
    return { code: 'changed', label: '🔵 ALTERAÇÕES DETECTADAS', blockingSources: [] };
  }

  return { code: 'verified', label: '✅ VERIFICADA SEM ALTERAÇÕES', blockingSources: [] };
}

export function classifyNewsItem({ title = '', description = '', link = '', sourceType = 'news', evNative = false } = {}) {
  const text = `${title} ${description}`.trim();
  const isAuthoritative = ['official_manufacturer', 'official_regulator', 'official_press_release'].includes(sourceType);
  const evidenceText = isAuthoritative ? text : title;
  const explicitBev = /\bbev\b|100%\s+el[eé]tric|exclusivamente\s+el[eé]tric/i.test(title);
  const hasExcludedPowertrain = NON_BEV_TERMS.some(pattern => pattern.test(text)) && !explicitBev;
  const hasInfrastructureTopic = /\b(?:carregador|recarga|eletroposto|infraestrutura)\b/i.test(title);
  const namesVehicle = /\b(?:carro|ve[ií]culo|modelo|suv|sedan|hatch|picape|van|furg[aã]o)s?\b/i.test(title);
  const isNonVehicleTopic = hasInfrastructureTopic && !namesVehicle;
  const hasEvContext = EV_TERMS.some(pattern => pattern.test(evidenceText)) || (evNative && !hasExcludedPowertrain);
  const hasCommercialContext = COMMERCIAL_TERMS.some(pattern => pattern.test(evidenceText));
  const targetsBrazil = /\bbrasil(?:eiro|eira|eiros|eiras)?\b/i.test(text);

  if (hasExcludedPowertrain || isNonVehicleTopic || !hasEvContext || !hasCommercialContext) {
    return {
      classification: 'irrelevant',
      confidence: 0,
      reason: 'Sem contexto comercial confirmado de veículo elétrico.',
      title,
      link,
    };
  }

  if (isAuthoritative && targetsBrazil) {
    return {
      classification: 'confirmed_new_model',
      confidence: 90,
      reason: 'Fonte oficial com ação comercial explícita no mercado brasileiro.',
      title,
      link,
    };
  }

  return {
    classification: 'watchlist',
    confidence: 50,
    reason: 'Possível atualização comercial de veículo elétrico ainda não confirmada.',
    title,
    link,
  };
}
