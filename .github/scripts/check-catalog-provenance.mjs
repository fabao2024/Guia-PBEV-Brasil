/**
 * Valida proveniência por veículo e por campo crítico do catálogo.
 * Use --bootstrap somente para registrar entradas legadas sem inventar evidência.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createMaintenanceResult } from './maintenance-core.mjs';
import { collectorResultPath, writeCollectorResult } from './maintenance-io.mjs';

const SOURCE = 'provenance';
const REGISTRY_FILE = '.github/data/catalog-provenance.json';
const CARS_FILE = 'public/data/cars.json';
const FIELDS = ['price', 'range_km', 'consumption', 'power', 'battery', 'charging', 'availability'];
const bootstrap = process.argv.includes('--bootstrap');

function legacyField() {
  return {
    verificationStatus: 'legacy_unverified',
    sourceType: null,
    sourceUrl: null,
    sourceUpdatedAt: null,
    verifiedAt: null,
  };
}

function isVerified(field, hierarchy) {
  if (field?.verificationStatus !== 'verified') return false;
  if (!hierarchy.includes(field.sourceType)) return false;
  if (!/^https:\/\//.test(field.sourceUrl ?? '')) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(field.sourceUpdatedAt ?? '')) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(field.verifiedAt ?? '');
}

function load() {
  const registry = JSON.parse(readFileSync(REGISTRY_FILE, 'utf8'));
  const carsPayload = JSON.parse(readFileSync(CARS_FILE, 'utf8'));
  const cars = carsPayload.cars ?? [];
  if (registry.schemaVersion !== 1 || !Array.isArray(registry.sourceHierarchy)
      || !Array.isArray(registry.fieldVerificationSources) || !registry.vehicles) {
    throw new Error('Schema do registro de proveniência inválido');
  }
  if (!cars.length) throw new Error('Catálogo público vazio');
  return { registry, cars };
}

function synchronize(registry, cars) {
  const nextVehicles = {};
  for (const car of [...cars].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const existing = registry.vehicles[car.slug] ?? {};
    nextVehicles[car.slug] = {
      brand: car.brand,
      model: car.model,
      fields: Object.fromEntries(FIELDS.map(field => [field, existing.fields?.[field] ?? legacyField()])),
    };
  }
  registry.vehicles = nextVehicles;
  return registry;
}

function evaluate(registry, cars) {
  const expectedSlugs = new Set(cars.map(car => car.slug));
  const registeredSlugs = new Set(Object.keys(registry.vehicles));
  const legacyExceptions = registry.legacyExceptions && typeof registry.legacyExceptions === 'object'
    ? registry.legacyExceptions
    : {};
  const missingVehicles = [...expectedSlugs].filter(slug => !registeredSlugs.has(slug));
  const orphanVehicles = [...registeredSlugs].filter(slug => !expectedSlugs.has(slug));
  const invalidEntries = [];
  let verifiedFields = 0;

  for (const car of cars) {
    const entry = registry.vehicles[car.slug];
    if (!entry) continue;
    for (const fieldName of FIELDS) {
      const field = entry.fields?.[fieldName];
      if (isVerified(field, registry.fieldVerificationSources)) verifiedFields += 1;
      else invalidEntries.push(`${car.slug}.${fieldName}`);
    }
  }

  const expectedFields = cars.length * FIELDS.length;
  const undocumentedLegacyExceptions = invalidEntries.filter(key => {
    const reason = legacyExceptions[key];
    return typeof reason !== 'string' || reason.trim().length < 20;
  });
  const documentedLegacyExceptions = invalidEntries.length - undocumentedLegacyExceptions.length;
  const complete = missingVehicles.length === 0
    && orphanVehicles.length === 0
    && undocumentedLegacyExceptions.length === 0;
  return createMaintenanceResult({
    source: SOURCE,
    status: complete ? 'unchanged' : 'partial',
    checkedAt: new Date().toISOString(),
    sourceUpdatedAt: null,
    repositoryReference: `${cars.length} veículos`,
    coverage: { checked: verifiedFields, expected: expectedFields },
    changes: missingVehicles.length + orphanVehicles.length + undocumentedLegacyExceptions.length,
    error: complete ? null : `Cobertura de proveniência incompleta: ${verifiedFields}/${expectedFields} campos verificados; ${undocumentedLegacyExceptions.length} exceções sem documentação`,
    details: {
      trackedVehicles: registeredSlugs.size,
      expectedVehicles: cars.length,
      fields: FIELDS,
      missingVehicles,
      orphanVehicles,
      unverifiedFields: invalidEntries.length,
      unverifiedSample: invalidEntries.slice(0, 30),
      documentedLegacyExceptions,
      undocumentedLegacyExceptions: undocumentedLegacyExceptions.length,
      undocumentedLegacySample: undocumentedLegacyExceptions.slice(0, 30),
    },
  });
}

const resultPath = collectorResultPath(SOURCE);
try {
  const { registry, cars } = load();
  if (bootstrap) {
    synchronize(registry, cars);
    writeFileSync(REGISTRY_FILE, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
    console.log(`Proveniência inicializada para ${cars.length} veículos sem inventar evidências históricas.`);
  }
  const result = evaluate(registry, cars);
  writeCollectorResult(resultPath, result);
  console.log(`Proveniência: ${result.status}; cobertura ${result.coverage.checked}/${result.coverage.expected}`);
} catch (error) {
  writeCollectorResult(resultPath, createMaintenanceResult({ source: SOURCE, status: 'failed', error: error.message }));
  console.error(`Falha na verificação de proveniência: ${error.message}`);
  process.exitCode = 1;
}
