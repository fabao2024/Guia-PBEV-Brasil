import { readFileSync } from 'node:fs';
import { collectorResultPath } from './maintenance-io.mjs';
import { parseCollectorPayload } from './maintenance-core.mjs';

const source = process.argv[2];
if (!/^(anp|aneel|pbev)$/.test(source ?? '')) {
  console.error('Fonte crítica inválida');
  process.exit(1);
}
const payload = readFileSync(collectorResultPath(source), 'utf8');
const result = parseCollectorPayload(payload, source);
if (result.status === 'failed' || result.status === 'partial') {
  console.error(`${source}: manutenção bloqueada por status ${result.status}: ${result.error ?? 'sem detalhe'}`);
  process.exit(1);
}
console.log(`${source}: resultado crítico aceito (${result.status}).`);
