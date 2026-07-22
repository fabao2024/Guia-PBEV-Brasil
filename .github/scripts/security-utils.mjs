import { execFileSync } from 'node:child_process';

const ALLOWED_EXECUTABLES = new Set(['git', 'gh']);
const XML_ENTITIES = Object.freeze({
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
});

export function runFile(executable, args) {
  if (!ALLOWED_EXECUTABLES.has(executable)) {
    throw new Error(`Executable not allowed: ${executable}`);
  }
  if (!Array.isArray(args) || !args.every(arg => typeof arg === 'string')) {
    throw new TypeError('Command arguments must be an array of strings');
  }
  return execFileSync(executable, args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: false,
  }).trim();
}

export function decodeXmlEntities(value) {
  return String(value)
    .replace(/&(?:amp|lt|gt|quot|#39);/g, entity => XML_ENTITIES[entity])
    .trim();
}
