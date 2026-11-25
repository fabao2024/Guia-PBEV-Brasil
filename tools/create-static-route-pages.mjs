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

function replaceOrInsert(html, pattern, replacement, label) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  if (!/<\/head>/i.test(html)) {
    throw new Error(`Static route generation: head not found for ${label}`);
  }
  return html.replace(/<\/head>/i, `  ${replacement}\n</head>`);
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

const allCars = [...carsData.cars, ...(carsData.announced_cars ?? [])];
for (const car of allCars) {
  const slug = String(car.slug || '');
  if (!slug || /[^a-z0-9-]/.test(slug)) {
    throw new Error(`Invalid car slug in cars.json: "${slug}"`);
  }

  const brand = String(car.brand);
  const model = String(car.model);
  const announced = car.price_status === 'unannounced';
  if (!announced && (!Number.isFinite(car.price) || car.price <= 0)) {
    throw new Error(`Invalid price for priced catalog car: ${slug}`);
  }
  if (announced && (car.price !== null || !/^\d{4}-\d{2}-\d{2}$/.test(car.presale_starts_on ?? ''))) {
    throw new Error(`Invalid announced car: ${slug}`);
  }
  const priceLabel = announced ? 'Preço a divulgar' : Number(car.price).toLocaleString('pt-BR');
  const powertrain = car.powertrain ?? 'BEV';
  const propulsionLabel = {
    BEV: 'elétrico', PHEV: 'híbrido plug-in', HEV: 'híbrido sem tomada', REEV: 'elétrico com extensor de autonomia',
  }[powertrain];
  const fuelEconomy = car.fuel_consumption_kml == null ? '—' : Number(car.fuel_consumption_kml).toLocaleString('pt-BR');
  const metric = powertrain === 'HEV'
    ? `${fuelEconomy} km/l Inmetro`
    : `${car.range_km} km ${powertrain === 'BEV' ? 'PBEV' : 'elétricos PBEV'}`;
  const title = announced
    ? `${brand} ${model} — Preço a divulgar | Guia PBEV Brasil`
    : `${brand} ${model} — R$ ${priceLabel} | ${metric} | Guia PBEV Brasil`;
  const batterySegment = car.battery_kwh ? `, bateria ${car.battery_kwh} kWh` : '';
  const rangeSegment = powertrain === 'HEV'
    ? `consumo Inmetro ${fuelEconomy} km/l`
    : `autonomia ${powertrain === 'BEV' ? '' : 'elétrica '}PBEV ${car.range_km} km`;
  const comparisonLabel = powertrain === 'BEV' ? 'elétricos' : 'eletrificados';
  const powerSegment = car.power_basis === 'electric_motor'
    ? `motor elétrico de tração: ${car.electric_motor_power_cv ?? car.power_cv} cv`
      + (car.combustion_power_cv != null ? `, motor a combustão: ${car.combustion_power_cv} cv` : '')
      + (car.combined_power_cv != null ? `, potência combinada: ${car.combined_power_cv} cv` : ', potência combinada não confirmada')
    : `${car.power_cv} cv${car.power_basis === 'combined' ? ' combinados' : ''}`;
  const presaleDate = announced ? car.presale_starts_on.split('-').reverse().join('/') : '';
  const description = announced
    ? `${brand} ${model}: Pré-venda prevista para ${presaleDate}. Preço a divulgar.`
    : `${brand} ${model}: ${rangeSegment}, ${String(car.category).toLowerCase()} ${propulsionLabel}, ${powerSegment}${batterySegment}. Preço estimado R$ ${priceLabel}. Compare com outros ${comparisonLabel} no Guia PBEV Brasil.`;
  const canonicalUrl = `${SITE_ORIGIN}/carro/${slug}`;
  const imageUrl = String(car.image_url);

  let html = replaceOrThrow(baseHtml, /<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`, `title of ${slug}`);

  html = replaceOrThrow(
    html,
    /<meta name="twitter:card" content="[^"]*">/,
    '<meta name="twitter:card" content="summary_large_image">',
    `twitter:card of ${slug}`,
  );

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
  html = replaceOrInsert(
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
  html = replaceOrInsert(
    html,
    /<meta name="twitter:image" content="[^"]*">/,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">`,
    `twitter:image of ${slug}`,
  );

  const target = join(distDir, 'carro', slug, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, 'utf8');
}

console.log(`Created static car pages: ${allCars.length} routes under /carro/`);

// Pre-render direct comparison routes for same-category catalog cars. The app
// owns the interactive comparison, but GitHub Pages needs a physical
// /comparar/<a>/<b>/index.html for shared links and social crawlers to receive
// HTTP 200 plus the CompareDetailPage metadata contract instead of 404.html.
// Keep announced cars out: they are not part of CAR_DB comparison links.
const powertrainLabels = {
  BEV: '100% elétrico',
  PHEV: 'híbrido plug-in',
  HEV: 'híbrido sem tomada',
  REEV: 'elétrico com extensor de autonomia',
};
const carsByCategory = new Map();
for (const car of carsData.cars) {
  const category = String(car.category || '');
  if (!carsByCategory.has(category)) carsByCategory.set(category, []);
  carsByCategory.get(category).push(car);
}

let comparisonRouteCount = 0;
for (const categoryCars of carsByCategory.values()) {
  for (const carA of categoryCars) {
    for (const carB of categoryCars) {
      if (carA.slug === carB.slug) continue;

      const slugA = String(carA.slug);
      const slugB = String(carB.slug);
      const title = `${carA.brand} ${carA.model} vs ${carB.brand} ${carB.model} — Comparativo PBEV Brasil`;
      const labelA = powertrainLabels[carA.powertrain ?? 'BEV'] ?? 'eletrificado';
      const labelB = powertrainLabels[carB.powertrain ?? 'BEV'] ?? 'eletrificado';
      const description = `Compare ${carA.brand} ${carA.model} (${labelA}) e ${carB.brand} ${carB.model} (${labelB}): autonomia elétrica, autonomia total combinada quando aplicável, consumo, potência, bateria, carregamento e preço. Dados oficiais INMETRO.`;
      const canonicalUrl = `${SITE_ORIGIN}/comparar/${slugA}/${slugB}`;
      const imageUrl = String(carA.image_url);

      let html = baseHtml;
      html = replaceOrThrow(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`, `title of comparison ${slugA}/${slugB}`);
      html = replaceOrThrow(html, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`, `description of comparison ${slugA}/${slugB}`);
      html = replaceOrThrow(html, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`, `canonical of comparison ${slugA}/${slugB}`);
      html = replaceOrThrow(html, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(title)}">`, `og:title of comparison ${slugA}/${slugB}`);
      html = replaceOrThrow(html, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(description)}">`, `og:description of comparison ${slugA}/${slugB}`);
      html = replaceOrThrow(html, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`, `og:url of comparison ${slugA}/${slugB}`);
      html = replaceOrInsert(html, /<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${escapeHtml(imageUrl)}">`, `og:image of comparison ${slugA}/${slugB}`);
      html = replaceOrThrow(html, /<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(title)}">`, `twitter:title of comparison ${slugA}/${slugB}`);
      html = replaceOrThrow(html, /<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(description)}">`, `twitter:description of comparison ${slugA}/${slugB}`);
      html = replaceOrInsert(html, /<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">`, `twitter:image of comparison ${slugA}/${slugB}`);

      const target = join(distDir, 'comparar', slugA, slugB, 'index.html');
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, html, 'utf8');
      comparisonRouteCount += 1;
    }
  }
}

console.log(`Created static comparison pages: ${comparisonRouteCount} same-category routes under /comparar/`);
