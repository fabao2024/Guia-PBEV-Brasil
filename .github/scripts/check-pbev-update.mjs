/**
 * Detecta uma nova edição oficial do PBE Veicular.
 * Não altera o catálogo automaticamente: mudanças exigem diff dos veículos e revisão.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createMaintenanceResult, discoverPbevEdition, fetchWithRetry } from './maintenance-core.mjs';
import { collectorResultPath, writeCollectorResult } from './maintenance-io.mjs';

const SOURCE = 'pbev';
const PROVENANCE_FILE = '.github/data/catalog-provenance.json';
const provenance = JSON.parse(readFileSync(PROVENANCE_FILE, 'utf8'));
const current = provenance.datasets?.pbev;
if (!current?.sourceUrl || !current?.reference) throw new Error('Proveniência PBEV ausente ou inválida');

function pdfDownloadUrl(viewUrl) {
  const url = new URL(viewUrl);
  if (url.pathname.endsWith('/view')) url.pathname = url.pathname.replace(/\/view$/, '/@@download/file');
  return url.href;
}

async function collect() {
  const checkedAt = new Date().toISOString();
  const pageResponse = await fetchWithRetry(current.sourceUrl, {
    headers: { Accept: 'text/html', 'User-Agent': 'GuiaPBEV-Bot/2.0' },
  });
  if (!pageResponse.ok) throw new Error(`Página oficial PBEV retornou HTTP ${pageResponse.status}`);
  const edition = discoverPbevEdition(await pageResponse.text(), current.reference, current.sourceUrl);

  const downloadUrl = pdfDownloadUrl(edition.url);
  const parsedDownloadUrl = new URL(downloadUrl);
  if (parsedDownloadUrl.protocol !== 'https:' || parsedDownloadUrl.hostname !== 'www.gov.br'
      || !parsedDownloadUrl.pathname.startsWith('/inmetro/')) {
    throw new Error('URL do PDF PBEV fora do host oficial');
  }
  const pdfResponse = await fetchWithRetry(parsedDownloadUrl.href, {
    headers: { Accept: 'application/pdf', 'User-Agent': 'GuiaPBEV-Bot/2.0' },
  });
  if (!pdfResponse.ok) throw new Error(`PDF PBEV retornou HTTP ${pdfResponse.status}`);
  const contentType = pdfResponse.headers.get('content-type') ?? '';
  if (!/application\/pdf/i.test(contentType)) throw new Error(`Content-Type inesperado no PBEV: ${contentType}`);
  const pdf = Buffer.from(await pdfResponse.arrayBuffer());
  if (pdf.length < 100000 || pdf.subarray(0, 4).toString('ascii') !== '%PDF') throw new Error(`PDF PBEV inválido ou incompleto: ${pdf.length} bytes`);
  const sha256 = createHash('sha256').update(pdf).digest('hex');

  return createMaintenanceResult({
    source: SOURCE,
    status: edition.status,
    checkedAt,
    sourceUpdatedAt: edition.sourceUpdatedAt,
    repositoryReference: current.reference,
    coverage: { checked: 1, expected: 1 },
    changes: edition.status === 'changed' ? 1 : 0,
    details: {
      reference: edition.reference,
      landingUrl: current.sourceUrl,
      pdfUrl: downloadUrl,
      pdfSha256: sha256,
      pdfBytes: pdf.length,
      requiredAction: edition.status === 'changed'
        ? 'Comparar integralmente a nova tabela com o catálogo antes de atualizar a referência.'
        : null,
    },
  });
}

const resultPath = collectorResultPath(SOURCE);
try {
  const result = await collect();
  writeCollectorResult(resultPath, result);
  console.log(`PBEV: ${result.status}; referência oficial ${result.details.reference}; SHA-256 ${result.details.pdfSha256.slice(0, 12)}…`);
} catch (error) {
  writeCollectorResult(resultPath, createMaintenanceResult({
    source: SOURCE,
    status: 'failed',
    repositoryReference: current.reference,
    error: error.message,
  }));
  console.error(`Falha no coletor PBEV: ${error.message}`);
  process.exitCode = 1;
}
