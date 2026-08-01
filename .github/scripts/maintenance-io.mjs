import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';

export function collectorResultPath(source) {
  return resolve(process.env.MAINTENANCE_RESULTS_DIR || '.maintenance-results', `${source}.json`);
}

export function writeCollectorResult(outputPath, result) {
  const target = resolve(outputPath);
  mkdirSync(dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(result, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  renameSync(temporary, target);
  return target;
}

export function emitCollectorOutput(resultPath, githubOutputPath = process.env.GITHUB_OUTPUT) {
  if (!githubOutputPath) throw new Error('GITHUB_OUTPUT não definido');
  const payload = JSON.stringify(JSON.parse(readFileSync(resultPath, 'utf8')));
  const delimiter = `PBEV_RESULT_${process.pid}_${Date.now()}`;
  appendFileSync(githubOutputPath, `result<<${delimiter}\n${payload}\n${delimiter}\n`, 'utf8');
  return payload;
}
