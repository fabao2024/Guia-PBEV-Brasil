import { readFileSync, renameSync, writeFileSync } from 'node:fs';

export const PROVENANCE_FILE = '.github/data/catalog-provenance.json';
const OFFICIAL_SOURCE_TYPES = new Set([
  'official_manufacturer',
  'official_regulator',
  'official_press_release',
]);

function isoDate(value, field) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) throw new Error(`${field} deve usar YYYY-MM-DD`);
  return value;
}

export function updateDatasetProvenance(dataset, {
  sourceType,
  sourceUrl,
  reference,
  sourceUpdatedAt,
  verifiedAt,
}, path = PROVENANCE_FILE) {
  if (!/^[a-z][a-z0-9_-]{1,31}$/.test(dataset)) throw new Error('Identificador de dataset inválido');
  if (!OFFICIAL_SOURCE_TYPES.has(sourceType)) throw new Error('Tipo de fonte não oficial para dataset verificado');
  const parsedUrl = new URL(sourceUrl);
  if (parsedUrl.protocol !== 'https:') throw new Error('Fonte de proveniência deve usar HTTPS');
  if (!String(reference).trim()) throw new Error('Referência de proveniência obrigatória');

  const registry = JSON.parse(readFileSync(path, 'utf8'));
  if (registry.schemaVersion !== 1 || !registry.datasets) throw new Error('Registro de proveniência inválido');
  registry.datasets[dataset] = {
    ...(registry.datasets[dataset] ?? {}),
    sourceType,
    sourceUrl: parsedUrl.href,
    reference: String(reference).trim(),
    sourceUpdatedAt: isoDate(sourceUpdatedAt, 'sourceUpdatedAt'),
    verifiedAt: isoDate(verifiedAt, 'verifiedAt'),
  };

  const temporary = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(registry, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  renameSync(temporary, path);
  return registry.datasets[dataset];
}
