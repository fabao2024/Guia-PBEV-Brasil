/**
 * generate-sitemap.ts
 * Runs at build time (before vite build) to produce public/sitemap.xml
 * with all vehicle detail pages + static routes.
 *
 * Usage: npx tsx scripts/generate-sitemap.ts
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CAR_DB } from './src/constants';

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
