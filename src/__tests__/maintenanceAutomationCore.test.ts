import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
// The maintenance runtime is intentionally plain ESM so GitHub Actions can run it with Node.
import {
  classifyNewsItem,
  classifyLinkResponse,
  createMaintenanceResult,
  deriveOverallStatus,
  discoverPbevEdition,
  fetchWithRetry,
  maintenancePeriodMarker,
  parseCollectorPayload,
  resolveAnpColumns,
} from '../../.github/scripts/maintenance-core.mjs';
import { writeCollectorResult } from '../../.github/scripts/maintenance-io.mjs';
import { buildMaintenanceReport } from '../../.github/scripts/maintenance-report.mjs';
import { updateDatasetProvenance } from '../../.github/scripts/provenance-registry.mjs';

describe('maintenance automation core', () => {
  it('rejects Beverly Hills entertainment headlines instead of matching the BEV acronym', () => {
    const result = classifyNewsItem({
      title: 'Cher voltou! As Patricinhas de Beverly Hills vai ganhar sequência',
      description: 'Notícia sobre cinema e entretenimento.',
      link: 'https://example.com/entretenimento',
    });

    expect(result.classification).toBe('irrelevant');
    expect(result.reason).toContain('contexto comercial');
  });

  it('confirms a new model only when an official source explicitly targets Brazil', () => {
    const result = classifyNewsItem({
      title: 'Fabricante lança novo carro elétrico no Brasil',
      description: 'Modelo já disponível nas concessionárias brasileiras.',
      link: 'https://fabricante.example/modelo',
      sourceType: 'official_manufacturer',
    });

    expect(result.classification).toBe('confirmed_new_model');
    expect(result.confidence).toBeGreaterThanOrEqual(80);
  });

  it('does not let RSS descriptions turn combustion or hybrid headlines into BEV findings', () => {
    expect(classifyNewsItem({
      title: 'SUV a gasolina despenca de preço',
      description: 'Veja também nossa seção de carros elétricos.',
      sourceType: 'specialist_media',
    }).classification).toBe('irrelevant');
    expect(classifyNewsItem({
      title: 'Outlander PHEV ganha novo preço',
      sourceType: 'specialist_media',
      evNative: true,
    }).classification).toBe('irrelevant');
    expect(classifyNewsItem({
      title: 'Marca revela carregador de 1,5 MW no Brasil',
      sourceType: 'specialist_media',
      evNative: true,
    }).classification).toBe('irrelevant');
    expect(classifyNewsItem({
      title: 'Nova linha de SUVs EREV é apresentada',
      sourceType: 'specialist_media',
      evNative: true,
    }).classification).toBe('irrelevant');
  });

  it('blocks maintenance when a critical collector result is missing', () => {
    const overall = deriveOverallStatus([
      { source: 'anp', status: 'unchanged' },
      { source: 'pbev', status: 'unchanged' },
    ], ['anp', 'aneel', 'pbev']);

    expect(overall.code).toBe('blocked');
    expect(overall.blockingSources).toEqual(['aneel']);
  });

  it('discovers the visible 2026 PBEV edition even when the URL keeps a legacy mascara name', () => {
    const html = `
      <h2>Veículos leves 2026 - 18º Ciclo</h2>
      <p>Atualizado em 03/06/2026 15h47</p>
      <a href="/inmetro/mascara-pbev-2026_19_jan-rev01.pdf/view">
        Tabela PBEV 2026_3_JUN-1.pdf
      </a>`;

    const edition = discoverPbevEdition(html, 'PBEV 2026_27_FEV-REV05', 'https://www.gov.br/base/');

    expect(edition.status).toBe('changed');
    expect(edition.reference).toBe('Tabela PBEV 2026_3_JUN-1.pdf');
    expect(edition.sourceUpdatedAt).toBe('2026-06-03');
    expect(edition.url).toBe('https://www.gov.br/inmetro/mascara-pbev-2026_19_jan-rev01.pdf/view');
  });

  it('reports HTTP 403 as blocked instead of a working manufacturer link', () => {
    expect(classifyLinkResponse(403)).toEqual({
      status: 'blocked',
      verifiable: false,
    });
    expect(classifyLinkResponse(404)).toEqual({
      status: 'broken',
      verifiable: true,
    });
    expect(classifyLinkResponse(503)).toEqual({
      status: 'unavailable',
      verifiable: false,
    });
  });

  it('accepts the current ANP monthly CSV column names', () => {
    expect(resolveAnpColumns([
      'Regiao - Sigla',
      'Estado - Sigla',
      'Produto',
      'Valor de Venda',
    ])).toEqual({
      state: 'Estado - Sigla',
      product: 'Produto',
      price: 'Valor de Venda',
    });
  });

  it('creates a deterministic hidden marker for one issue per month', () => {
    expect(maintenancePeriodMarker('2026-08')).toBe('<!-- monthly-maintenance:2026-08 -->');
  });

  it('creates a failed collector result without hiding the operational error', () => {
    const result = createMaintenanceResult({
      source: 'anp',
      status: 'failed',
      checkedAt: '2026-08-01T12:00:00.000Z',
      repositoryReference: 'fev/2026',
      error: 'HTTP 401',
    });

    expect(result).toMatchObject({
      schemaVersion: 1,
      source: 'anp',
      status: 'failed',
      checkedAt: '2026-08-01T12:00:00.000Z',
      repositoryReference: 'fev/2026',
      error: 'HTTP 401',
    });
  });

  it('turns a missing GitHub Actions collector output into a failed result', () => {
    expect(parseCollectorPayload('', 'aneel')).toMatchObject({
      source: 'aneel',
      status: 'failed',
      error: 'Resultado do coletor ausente',
    });
  });

  it('retries transient network failures before failing a critical collector', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    try {
      const response = await fetchWithRetry('https://example.com/source', {}, {
        attempts: 2,
        retryDelayMs: 0,
        timeoutMs: 1_000,
      });
      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      fetchMock.mockRestore();
    }
  });

  it('writes a collector result as deterministic JSON for the workflow output step', () => {
    const directory = mkdtempSync(join(tmpdir(), 'pbev-maintenance-'));
    const outputPath = join(directory, 'anp.json');
    try {
      const result = createMaintenanceResult({ source: 'anp', status: 'unchanged' });
      writeCollectorResult(outputPath, result);
      expect(JSON.parse(readFileSync(outputPath, 'utf8'))).toEqual(result);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('updates dataset provenance atomically and rejects non-official verification sources', () => {
    const directory = mkdtempSync(join(tmpdir(), 'pbev-provenance-'));
    const registryPath = join(directory, 'catalog-provenance.json');
    writeFileSync(registryPath, JSON.stringify({ schemaVersion: 1, datasets: {} }));
    try {
      updateDatasetProvenance('anp', {
        sourceType: 'official_regulator',
        sourceUrl: 'https://www.gov.br/anp/dados.csv',
        reference: 'julho de 2026',
        sourceUpdatedAt: '2026-07-31',
        verifiedAt: '2026-08-01',
      }, registryPath);
      const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
      expect(registry.datasets.anp).toMatchObject({
        sourceType: 'official_regulator',
        reference: 'julho de 2026',
        sourceUpdatedAt: '2026-07-31',
      });
      expect(() => updateDatasetProvenance('news', {
        sourceType: 'specialist_media',
        sourceUrl: 'https://example.com/noticia',
        reference: 'notícia',
        sourceUpdatedAt: '2026-08-01',
        verifiedAt: '2026-08-01',
      }, registryPath)).toThrow('não oficial');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('tracks provenance for every vehicle and critical catalog field', () => {
    const cars = JSON.parse(readFileSync(resolve(process.cwd(), 'public/data/cars.json'), 'utf8')).cars;
    const registry = JSON.parse(readFileSync(resolve(process.cwd(), '.github/data/catalog-provenance.json'), 'utf8'));
    expect(registry.fieldVerificationSources).toEqual([
      'official_manufacturer',
      'official_regulator',
      'official_press_release',
    ]);
    expect(registry.datasets.pbev).toMatchObject({
      reference: 'Tabela PBEV 2026_14_AGOd.pdf',
      reviewStatus: 'manual_diff_applied',
    });
    expect(Object.keys(registry.vehicles).sort()).toEqual(cars.map((car: { slug: string }) => car.slug).sort());
    for (const entry of Object.values(registry.vehicles) as Array<{ fields: Record<string, unknown> }>) {
      expect(Object.keys(entry.fields)).toEqual([
        'price',
        'range_km',
        'consumption',
        'power',
        'battery',
        'charging',
        'availability',
        'dimensions',
        'trunk',
        'weight',
      ]);
    }
  });

  it('renders a blocked monthly issue from real collector results', () => {
    const report = buildMaintenanceReport({
      period: '2026-08',
      monthLabel: 'agosto de 2026',
      workflowUrl: 'https://github.com/example/actions/runs/1',
      results: [
        createMaintenanceResult({ source: 'anp', status: 'failed', error: 'HTTP 401' }),
        createMaintenanceResult({ source: 'aneel', status: 'unchanged' }),
        createMaintenanceResult({ source: 'pbev', status: 'unchanged' }),
      ],
    });

    expect(report.title).toBe('Manutenção mensal automatizada — agosto de 2026');
    expect(report.body).toContain('<!-- monthly-maintenance:2026-08 -->');
    expect(report.body).toContain('## Status geral: 🔴 BLOQUEADA');
    expect(report.body).toContain('HTTP 401');
    expect(report.shouldClose).toBe(false);
  });

  it('keeps change and attention labels together and exposes rejected news for audit', () => {
    const report = buildMaintenanceReport({
      period: '2026-08',
      monthLabel: 'agosto de 2026',
      results: [
        createMaintenanceResult({
          source: 'anp',
          status: 'changed',
          changes: 27,
          details: { resourceUrl: 'https://www.gov.br/anp/dados-julho.csv' },
        }),
        createMaintenanceResult({ source: 'aneel', status: 'unchanged' }),
        createMaintenanceResult({ source: 'pbev', status: 'unchanged' }),
        createMaintenanceResult({
          source: 'news',
          status: 'partial',
          error: '2 feeds indisponíveis',
          details: {
            findings: [],
            rejected: [{ title: 'Cher em Beverly Hills', reason: 'Sem contexto BEV.' }],
          },
        }),
      ],
    });

    expect(report.labels).toContain('maintenance-attention');
    expect(report.labels).toContain('maintenance-changes');
    expect(report.body).toContain('Itens descartados automaticamente');
    expect(report.body).toContain('Cher em Beverly Hills');
    expect(report.body).toContain('https://www.gov.br/anp/dados-julho.csv');
  });
});
