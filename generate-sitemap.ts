/**
 * generate-sitemap.ts
 * Runs at build time (before vite build) to produce:
 *  - public/sitemap.xml  — all vehicle + comparison routes
 *  - public/data/cars.json — full catalog as structured JSON (consumed by external systems)
 *
 * Usage: npx tsx generate-sitemap.ts
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CAR_DB, isCarNew } from './src/constants';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://guiapbev.cloud';
const today = new Date().toISOString().split('T')[0];

function toSlug(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function url(loc: string, priority: string, changefreq: string, lastmod = today): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const staticRoutes = [
  url(`${BASE_URL}/`, '1.0', 'weekly'),
  url(`${BASE_URL}/privacidade`, '0.3', 'yearly'),
];

const carRoutes = CAR_DB.map(car =>
  url(`${BASE_URL}/carro/${toSlug(car.brand, car.model)}`, '0.8', 'monthly')
);

// Comparison pages: same-category pairs only
const compareRoutes: string[] = [];
const categories = [...new Set(CAR_DB.map(c => c.cat))];
for (const cat of categories) {
  const group = CAR_DB.filter(c => c.cat === cat);
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const slugA = toSlug(group[i].brand, group[i].model);
      const slugB = toSlug(group[j].brand, group[j].model);
      compareRoutes.push(url(`${BASE_URL}/comparar/${slugA}/${slugB}`, '0.6', 'monthly'));
    }
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticRoutes, ...carRoutes, ...compareRoutes].join('\n')}
</urlset>
`;

const outPath = resolve(__dirname, 'public/sitemap.xml');
writeFileSync(outPath, sitemap, 'utf-8');
console.log(`✅ sitemap.xml gerado — ${carRoutes.length} veículos + ${compareRoutes.length} comparativos + ${staticRoutes.length} estáticas → ${outPath}`);

// ── Gera public/data/cars.json ────────────────────────────────────────────────

const dataDir = resolve(__dirname, 'public/data');
mkdirSync(dataDir, { recursive: true });

const carsJson = {
  generated_at: new Date().toISOString(),
  total: CAR_DB.length,
  base_image_url: 'https://guiapbev.cloud/car-images',
  cars: CAR_DB.map(car => ({
    model:                  car.model,
    brand:                  car.brand,
    price:                  car.price,
    range_km:               car.range,
    category:               car.cat,
    image_url:              `https://guiapbev.cloud${car.img}`,
    traction:               car.traction      ?? null,
    power_cv:               car.power         ?? null,
    torque_kgfm:            car.torque        ?? null,
    battery_kwh:            car.battery       ?? null,
    charge_ac_kw:           car.chargeAC      ?? null,
    charge_dc_kw:           car.chargeDC      ?? null,
    warranty_years:         car.warrantyYears ?? null,
    warranty_battery_years: car.warrantyBatteryYears ?? null,
    pbe_rating:             car.pbeRating     ?? null,
    energy_mj_km:           car.energyMJkm    ?? null,
    features:               car.features      ?? [],
    is_new:                 isCarNew(car),
    discontinued:           car.discontinued  ?? false,
    slug:                   toSlug(car.brand, car.model),
    detail_url:             `https://guiapbev.cloud/carro/${toSlug(car.brand, car.model)}`,
  })),
};

const jsonPath = resolve(dataDir, 'cars.json');
writeFileSync(jsonPath, JSON.stringify(carsJson, null, 2), 'utf-8');
console.log(`✅ cars.json gerado — ${carsJson.total} veículos → ${jsonPath}`);

// ── Atualiza contagem no README.md automaticamente ────────────────────────────

const brands = new Set(CAR_DB.map(c => c.brand)).size;
const readmePath = resolve(__dirname, 'README.md');
const readme = readFileSync(readmePath, 'utf-8');
const updatedReadme = readme
  .replace(
    /\*\*\d+ veículos\*\* BEV cadastrados \(\d+ marcas\)/,
    `**${CAR_DB.length} veículos** BEV cadastrados (${brands} marcas)`
  )
  .replace(
    /\*\*\d+ BEV vehicles\*\* registered \(\d+ brands\)/,
    `**${CAR_DB.length} BEV vehicles** registered (${brands} brands)`
  );
if (updatedReadme !== readme) {
  writeFileSync(readmePath, updatedReadme, 'utf-8');
  console.log(`✅ README.md atualizado — ${CAR_DB.length} veículos, ${brands} marcas`);
}
