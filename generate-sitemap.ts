/**
 * generate-sitemap.ts
 * Runs at build time (before vite build) to produce:
 *  - public/sitemap.xml  — all public static + vehicle routes
 *  - public/data/cars.json — full catalog as structured JSON (consumed by external systems)
 *
 * Usage: npx tsx generate-sitemap.ts
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CAR_DB, isCarNew } from './src/constants';
import { ANNOUNCED_CARS } from './src/constants/announcedVehicles';
import { CATALOG_EVIDENCE } from './src/constants/catalogEvidence';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://guiapbev.cloud';
const today = new Date().toISOString().split('T')[0];
const leadCaptureEnabled = String(process.env.VITE_ENABLE_LEAD_CAPTURE ?? '').trim().toLowerCase() === 'true';

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
  url(`${BASE_URL}/parceiros/`, '0.7', 'monthly'),
  url(`${BASE_URL}/metodologia/`, '0.5', 'yearly'),
  ...(leadCaptureEnabled ? [url(`${BASE_URL}/interesse`, '0.8', 'weekly')] : []),
  url(`${BASE_URL}/privacy.html`, '0.3', 'yearly'),
];

const carRoutes = [...CAR_DB, ...ANNOUNCED_CARS].map(car =>
  url(`${BASE_URL}/carro/${toSlug(car.brand, car.model)}`, '0.8', 'monthly')
);

// Comparison routes are pre-rendered for same-category catalog pairs by the
// static route generator, but are intentionally omitted from the sitemap: the
// Cartesian pair set is for direct shared links, not broad search discovery.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticRoutes, ...carRoutes].join('\n')}
</urlset>
`;

const outPath = resolve(__dirname, 'public/sitemap.xml');
writeFileSync(outPath, sitemap, 'utf-8');
console.log(`✅ sitemap.xml gerado — ${carRoutes.length} veículos + ${staticRoutes.length} estáticas → ${outPath}`);

// ── Gera public/data/cars.json ────────────────────────────────────────────────

const dataDir = resolve(__dirname, 'public/data');
mkdirSync(dataDir, { recursive: true });

const carsJson = {
  generated_at: new Date().toISOString(),
  total: CAR_DB.length,
  announced_total: ANNOUNCED_CARS.length,
  base_image_url: 'https://guiapbev.cloud/car-images',
  evidence: {
    official_source: CATALOG_EVIDENCE.officialSourceLabel,
    official_reference: CATALOG_EVIDENCE.officialReference,
    official_source_url: CATALOG_EVIDENCE.officialSourceUrl,
    market_source: CATALOG_EVIDENCE.marketSourceLabel,
    market_history_through: CATALOG_EVIDENCE.marketHistoryThrough,
    price_disclaimer: CATALOG_EVIDENCE.priceDisclaimer,
  },
  cars: CAR_DB.map(car => ({
    model:                  car.model,
    brand:                  car.brand,
    price:                  car.price,
    range_km:               car.range,
    powertrain:             car.powertrain ?? 'BEV',
    electric_range_km:      car.electricRangeKm ?? null,
    combined_range_km:      car.combinedRangeKm ?? null,
    fuel_consumption_kml:   car.fuelConsumptionKml ?? null,
    fuel_consumption_kml_ethanol: car.fuelConsumptionKmlEthanol ?? null,
    fuel_type_2:            car.fuelType2 ?? null,
    category:               car.cat,
    image_url:              car.img.startsWith('http') ? car.img : `https://guiapbev.cloud${car.img}`,
    traction:               car.traction      ?? null,
    power_cv:               car.power         ?? null,
    ...(car.powerBasis ? {
      power_basis: car.powerBasis,
      combustion_power_cv: car.combustionPowerCv ?? null,
      electric_motor_power_cv: car.electricMotorPowerCv ?? null,
      combined_power_cv: car.combinedPowerCv ?? null,
    } : {}),
    torque_kgfm:            car.torque        ?? null,
    battery_kwh:            car.battery       ?? null,
    charge_ac_kw:           car.chargeAC      ?? null,
    charge_dc_kw:           car.chargeDC      ?? null,
    warranty_years:         car.warrantyYears ?? null,
    warranty_battery_years: car.warrantyBatteryYears ?? null,
    pbe_rating:             car.pbeRating     ?? null,
    energy_mj_km:           car.energyMJkm    ?? null,
    length_mm:              car.lengthMm           ?? null,
    width_mm:               car.widthMm            ?? null,
    height_mm:              car.heightMm           ?? null,
    wheelbase_mm:           car.wheelbaseMm        ?? null,
    ground_clearance_mm:    car.groundClearanceMm  ?? null,
    weight_kg:              car.weightKg           ?? null,
    trunk_liters:           car.trunkLiters        ?? null,
    features:               car.features      ?? [],
    is_new:                 isCarNew(car),
    discontinued:           car.discontinued  ?? false,
    slug:                   toSlug(car.brand, car.model),
    detail_url:             `https://guiapbev.cloud/carro/${toSlug(car.brand, car.model)}`,
  })),
  // Contrato aditivo: não inserir null/zero no array de veículos com preço.
  announced_cars: ANNOUNCED_CARS.map(car => ({
    model: car.model, brand: car.brand, price: null, price_status: car.priceStatus,
    announced_on: car.announcedOn, presale_starts_on: car.presaleStartsOn,
    reviewed_on: car.reviewedOn, category: car.cat, powertrain: car.powertrain,
    range_km: car.range, battery_kwh: car.battery, power_cv: car.power,
    torque_kgfm: car.torque, traction: car.traction,
    supports_dc_charging: car.supportsDcCharging ?? false,
    specification_note: car.specificationNote, sources: car.sources, features: car.features,
    image_url: car.img.startsWith('http') ? car.img : `${BASE_URL}${car.img}`,
    slug: toSlug(car.brand, car.model),
    detail_url: `${BASE_URL}/carro/${toSlug(car.brand, car.model)}`,
  })),
};

const jsonPath = resolve(dataDir, 'cars.json');
writeFileSync(jsonPath, JSON.stringify(carsJson, null, 2), 'utf-8');
console.log(`✅ cars.json gerado — ${carsJson.total} veículos → ${jsonPath}`);

// ── Atualiza contagem no README.md automaticamente ────────────────────────────

const brands = new Set(CAR_DB.map(c => c.brand)).size;
const hybridCount = CAR_DB.filter(c => (c.powertrain ?? 'BEV') !== 'BEV').length;
const catalogLabel = hybridCount > 0 ? `${brands} marcas` : `${brands} marcas`;
const readmePath = resolve(__dirname, 'README.md');
const readme = readFileSync(readmePath, 'utf-8');
let updatedReadme = readme
  .replace(
    /\*\*\d+ veículos\*\*(?: BEV cadastrados| \(BEV \+ híbridos\) cadastrados) \(\d+ marcas\)/,
    hybridCount > 0
      ? `**${CAR_DB.length} veículos** (BEV + híbridos) cadastrados (${catalogLabel})`
      : `**${CAR_DB.length} veículos** BEV cadastrados (${brands} marcas)`
  )
  .replace(
    /\*\*\d+(?: BEV vehicles\*\* registered| vehicles\*\* \(BEV \+ hybrids\) registered) \(\d+ (?:brands|marcas)\)/,
    hybridCount > 0
      ? `**${CAR_DB.length} vehicles** (BEV + hybrids) registered (${brands} brands)`
      : `**${CAR_DB.length} BEV vehicles** registered (${brands} brands)`
  );
const announcedPt = `- **${ANNOUNCED_CARS.length} pré-lançamento(s)** sem preço divulgado, separado(s) dos cálculos financeiros`;
const announcedEn = `- **${ANNOUNCED_CARS.length} upcoming vehicle(s)** without announced prices, excluded from financial calculations`;
updatedReadme = /- \*\*\d+ pré-lançamento\(s\)\*\*/.test(updatedReadme)
  ? updatedReadme.replace(/- \*\*\d+ pré-lançamento\(s\)\*\*[^\n]*/, announcedPt)
  : updatedReadme.replace(/(- \*\*\d+ veículos\*\*[^\n]*\n)/, `$1${announcedPt}\n`);
updatedReadme = /- \*\*\d+ upcoming vehicle\(s\)\*\*/.test(updatedReadme)
  ? updatedReadme.replace(/- \*\*\d+ upcoming vehicle\(s\)\*\*[^\n]*/, announcedEn)
  : updatedReadme.replace(/(- \*\*\d+ vehicles\*\*[^\n]*\n)/, `$1${announcedEn}\n`);
if (updatedReadme !== readme) {
  writeFileSync(readmePath, updatedReadme, 'utf-8');
  console.log(`✅ README.md atualizado — ${CAR_DB.length} veículos, ${brands} marcas`);
}
