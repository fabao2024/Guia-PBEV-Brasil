import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const distDir = 'dist';
const indexPath = join(distDir, 'index.html');
const SITE_ORIGIN = 'https://guiapbev.cloud';

const leadCaptureEnabled = String(process.env.VITE_ENABLE_LEAD_CAPTURE ?? '').trim().toLowerCase() === 'true';
const routes = [
  {
    path: 'parceiros',
    title: 'Programa de Parceiros | Guia PBEV Brasil',
    description: 'Receba oportunidades qualificadas por serviço, região e momento de decisão no piloto Guia PBEV de wallbox, energia solar e limpeza de placas em São Paulo.',
    canonicalUrl: 'https://guiapbev.cloud/parceiros/',
  },
  {
    path: 'metodologia',
    title: 'Metodologia de Cálculo | Guia PBEV Brasil',
    description: 'Fontes de dados e fórmulas do Guia PBEV: PBEV/INMETRO, tarifas ANEEL, preços ANP, IPVA estadual, TCO de 4 anos e estimativas do planejador de rota.',
    canonicalUrl: 'https://guiapbev.cloud/metodologia/',
  },
  ...(leadCaptureEnabled ? [{ path: 'interesse' }] : []),
];

if (!existsSync(indexPath)) {
  throw new Error(`Build index not found: ${indexPath}`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceOrThrow(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`Static route generation: pattern not found for ${label}`);
  }
  return html.replace(pattern, replacement);
}

const baseHtml = readFileSync(indexPath, 'utf8');

for (const route of routes) {
  const target = join(distDir, route.path, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  let html = baseHtml;
  if (route.canonicalUrl) {
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${route.description}">`)
      .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${route.canonicalUrl}">`)
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${route.title}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${route.description}">`)
      .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${route.canonicalUrl}">`)
      .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${route.title}">`)
      .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${route.description}">`);
  }
  writeFileSync(target, html, 'utf8');
  console.log(`Created static SPA route: /${route.path}/ -> ${target}`);
}

// Pre-rendered catalog car pages: one crawler-readable page per vehicle so that
// sitemap URLs (/carro/<slug>) resolve directly instead of falling back to the
// SPA shell. Metadata mirrors src/pages/CarDetailPage.tsx Helmet contract.
const carsJsonPath = join(distDir, 'data', 'cars.json');
if (!existsSync(carsJsonPath)) {
  throw new Error(`Build cars data not found: ${carsJsonPath}`);
}

const carsData = JSON.parse(readFileSync(carsJsonPath, 'utf8'));
if (!Array.isArray(carsData.cars) || carsData.cars.length === 0) {
  throw new Error('Build cars data is empty or malformed');
}

for (const car of carsData.cars) {
  const slug = String(car.slug || '');
  if (!slug || /[^a-z0-9-]/.test(slug)) {
    throw new Error(`Invalid car slug in cars.json: "${slug}"`);
  }

  const brand = String(car.brand);
  const model = String(car.model);
  const priceLabel = Number(car.price).toLocaleString('pt-BR');
  const title = `${brand} ${model} — R$ ${priceLabel} | ${car.range_km} km PBEV | Guia PBEV Brasil`;
  const batterySegment = car.battery_kwh ? `, bateria ${car.battery_kwh} kWh` : '';
  const description = `${brand} ${model}: autonomia PBEV ${car.range_km} km, ${String(car.category).toLowerCase()} elétrico, ${car.power_cv} cv${batterySegment}. Preço estimado R$ ${priceLabel}. Compare com outros elétricos no Guia PBEV Brasil.`;
  const canonicalUrl = `${SITE_ORIGIN}/carro/${slug}`;
  const imageUrl = String(car.image_url);

  let html = replaceOrThrow(baseHtml, /<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`, `title of ${slug}`);

  html = replaceOrThrow(
    html,
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `description of ${slug}`,
  );
  html = replaceOrThrow(
    html,
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `canonical of ${slug}`,
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:type" content="[^"]*">/,
    '<meta property="og:type" content="product">',
    `og:type of ${slug}`,
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `og:title of ${slug}`,
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `og:description of ${slug}`,
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `og:url of ${slug}`,
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:image" content="[^"]*">/,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}">`,
    `og:image of ${slug}`,
  );
  html = replaceOrThrow(
    html,
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `twitter:title of ${slug}`,
  );
  html = replaceOrThrow(
    html,
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `twitter:description of ${slug}`,
  );
  html = replaceOrThrow(
    html,
    /<meta name="twitter:image" content="[^"]*">/,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">`,
    `twitter:image of ${slug}`,
  );

  const target = join(distDir, 'carro', slug, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, 'utf8');
}

console.log(`Created static car pages: ${carsData.cars.length} routes under /carro/`);
