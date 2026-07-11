import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const distDir = 'dist';
const indexPath = join(distDir, 'index.html');

const routes = ['parceiros'];

if (!existsSync(indexPath)) {
  throw new Error(`Build index not found: ${indexPath}`);
}

for (const route of routes) {
  const target = join(distDir, route, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(indexPath, target);
  console.log(`Created static SPA route: /${route}/ -> ${target}`);
}
