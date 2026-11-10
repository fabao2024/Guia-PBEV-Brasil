import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const TOOL_PATH = resolve(process.cwd(), 'tools/create-static-route-pages.mjs');

const FIXTURE_INDEX_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <title>Guia PBEV Brasil — Elétricos Homologados</title>
  <meta name="description" content="Guia completo dos veículos elétricos homologados no Brasil pelo PBEV/Inmetro. Compare autonomia, preço e especificações de 101 modelos.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Guia PBEV Brasil — Elétricos Homologados">
  <meta property="og:description" content="Compare os 101 elétricos homologados no Brasil. Autonomia real PBEV, preços e especificações completas.">
  <meta property="og:url" content="https://guiapbev.cloud/">
  <meta property="og:image" content="https://guiapbev.cloud/og-cover.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Guia PBEV Brasil — Elétricos Homologados">
  <meta name="twitter:description" content="Compare os 101 elétricos homologados no Brasil. Autonomia real PBEV, preços e especificações completas.">
  <meta name="twitter:image" content="https://guiapbev.cloud/og-cover.jpg">
  <link rel="canonical" href="https://guiapbev.cloud/">
</head>
<body></body>
</html>`;

interface FixtureCar {
  slug: string;
  brand: string;
  model: string;
  price: number;
  range_km: number;
  category: string;
  power_cv: number;
  battery_kwh?: number;
  image_url: string;
  powertrain?: 'BEV' | 'PHEV' | 'HEV' | 'REEV';
  fuel_consumption_kml?: number;
}

function buildFixtureCars(): FixtureCar[] {
  return [
    {
      slug: 'byd-dolphin-gs',
      brand: 'BYD',
      model: 'Dolphin GS',
      price: 119800,
      range_km: 335,
      category: 'Compacto',
      power_cv: 95,
      battery_kwh: 44.9,
      image_url: 'https://guiapbev.cloud/car-images/dolphin-gs.jpg',
    },
    {
      slug: 'renault-kwid-e-tech',
      brand: 'Renault',
      model: 'Kwid E-Tech',
      price: 99990,
      range_km: 185,
      category: 'Urbano',
      power_cv: 65,
      image_url: 'https://guiapbev.cloud/car-images/kwid.jpg',
    },
  ];
}

function runTool(cars: FixtureCar[], slug = 'byd-dolphin-gs'): string {
  const workdir = mkdtempSync(join(tmpdir(), 'pbev-static-routes-'));
  const distDir = join(workdir, 'dist');
  mkdirSync(join(distDir, 'data'), { recursive: true });
  writeFileSync(join(distDir, 'index.html'), FIXTURE_INDEX_HTML, 'utf8');
  writeFileSync(
    join(distDir, 'data', 'cars.json'),
    JSON.stringify({ total: cars.length, cars }),
    'utf8',
  );

  try {
    execFileSync(process.execPath, [TOOL_PATH], { cwd: workdir, stdio: 'pipe' });
    return readFileSync(join(distDir, 'carro', slug, 'index.html'), 'utf8');
  } finally {
    rmSync(workdir, { recursive: true, force: true });
  }
}

describe('static car route pages', () => {
  const fixtureCars = buildFixtureCars();
  let generatedHtml = '';

  it('generates one pre-rendered page per catalog car with crawler metadata', () => {
    generatedHtml = runTool(fixtureCars);

    expect(generatedHtml).toContain('<title>BYD Dolphin GS — R$ 119.800 | 335 km PBEV | Guia PBEV Brasil</title>');
    expect(generatedHtml).toContain('rel="canonical" href="https://guiapbev.cloud/carro/byd-dolphin-gs"');
    expect(generatedHtml).not.toContain('101 modelos');
  });

  it('mirrors the CarDetailPage metadata contract', () => {
    expect(generatedHtml).toContain(
      '<meta name="description" content="BYD Dolphin GS: autonomia PBEV 335 km, compacto elétrico, 95 cv, bateria 44.9 kWh. Preço estimado R$ 119.800. Compare com outros elétricos no Guia PBEV Brasil.">',
    );
    expect(generatedHtml).toContain('<meta property="og:type" content="product">');
    expect(generatedHtml).toContain('<meta property="og:image" content="https://guiapbev.cloud/car-images/dolphin-gs.jpg">');
    expect(generatedHtml).toContain('<meta name="twitter:image" content="https://guiapbev.cloud/car-images/dolphin-gs.jpg">');
    expect(generatedHtml).toContain('<meta property="og:url" content="https://guiapbev.cloud/carro/byd-dolphin-gs">');
  });

  it('omits the battery segment when the car has no battery_kwh', () => {
    const withoutBattery = fixtureCars.find(car => !car.battery_kwh);
    expect(withoutBattery).toBeDefined();

    const workdir = mkdtempSync(join(tmpdir(), 'pbev-static-routes-'));
    const distDir = join(workdir, 'dist');
    mkdirSync(join(distDir, 'data'), { recursive: true });
    writeFileSync(join(distDir, 'index.html'), FIXTURE_INDEX_HTML, 'utf8');
    writeFileSync(
      join(distDir, 'data', 'cars.json'),
      JSON.stringify({ total: 1, cars: [withoutBattery] }),
      'utf8',
    );

    try {
      execFileSync(process.execPath, [TOOL_PATH], { cwd: workdir, stdio: 'pipe' });
      const html = readFileSync(join(distDir, 'carro', 'renault-kwid-e-tech', 'index.html'), 'utf8');
      expect(html).toContain('urbano elétrico, 65 cv.');
      expect(html).not.toContain('bateria');
    } finally {
      rmSync(workdir, { recursive: true, force: true });
    }
  });

  it('identifies the DENZA B5 as a plug-in hybrid in static search and social metadata', () => {
    const b5: FixtureCar = {
      slug: 'denza-b5-gl', brand: 'DENZA', model: 'B5 GL', price: 405000,
      range_km: 81, category: 'SUV', power_cv: 687, battery_kwh: 31.8,
      powertrain: 'PHEV', image_url: 'https://guiapbev.cloud/car-images/denza-b5-gl.jpg',
    };
    const html = runTool([b5], b5.slug);
    expect(html).toContain('81 km elétricos PBEV');
    expect(html.match(/suv híbrido plug-in/g)).toHaveLength(3);
    expect(html).toContain('autonomia elétrica PBEV 81 km');
    expect(html).not.toContain('suv elétrico');
    expect(html).toContain('Compare com outros eletrificados');
  });

  it('uses fuel economy rather than zero electric range for a non-plug-in hybrid', () => {
    const hev: FixtureCar = {
      ...fixtureCars[0], powertrain: 'HEV', range_km: 0, fuel_consumption_kml: 17.5,
    };
    const html = runTool([hev]);
    expect(html).toContain('17,5 km/l Inmetro');
    expect(html).toContain('híbrido sem tomada');
    expect(html).not.toContain('0 km PBEV');
  });
});

afterEach(() => {
  // generatedHtml is intentionally reused across assertions within the suite;
  // nothing to clean between tests because each runTool() call cleans itself.
});
