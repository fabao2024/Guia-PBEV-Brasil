import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const distDir = path.resolve(process.cwd(), 'dist');
const textExtensions = new Set([
  '.css', '.html', '.js', '.json', '.map', '.mjs', '.svg', '.txt', '.webmanifest', '.xml',
]);
const secretPatterns = [
  ['google-api-key', /AIza[0-9A-Za-z_-]{20,}/g],
  ['langsmith-api-key', /lsv2_[0-9A-Za-z_-]{20,}/g],
  ['openai-api-key', /sk-(?:proj-)?[0-9A-Za-z_-]{20,}/g],
  ['github-token', /(?:ghp_|github_pat_)[0-9A-Za-z_]{20,}/g],
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
];
const buildSecretNames = [
  'VITE_GEMINI_API_KEY',
  'VITE_OCM_API_KEY',
  'VITE_ORS_API_KEY',
  'VITE_LANGSMITH_API_KEY',
];

if (!fs.existsSync(distDir)) {
  console.error('Security scan failed: dist/ does not exist.');
  process.exit(2);
}

const findings = [];

function scanDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(distDir, absolutePath);

    if (entry.isDirectory()) {
      scanDirectory(absolutePath);
      continue;
    }

    if (entry.name === '.env' || entry.name.startsWith('.env.')) {
      findings.push({ rule: 'environment-file', file: relativePath });
      continue;
    }

    if (!textExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    const contents = fs.readFileSync(absolutePath, 'utf8');

    for (const [rule, pattern] of secretPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(contents)) findings.push({ rule, file: relativePath });
    }

    for (const name of buildSecretNames) {
      const value = process.env[name]?.trim() ?? '';
      if (value.length >= 8 && contents.includes(value)) {
        findings.push({ rule: `bundled-${name.toLowerCase()}`, file: relativePath });
      }
    }
  }
}

scanDirectory(distDir);

if (findings.length > 0) {
  console.error('Security scan failed: credential-like content found in dist/.');
  for (const finding of findings) {
    console.error(`- ${finding.rule}: ${finding.file}`);
  }
  process.exit(1);
}

console.log('Security scan passed: no credentials found in dist/.');
