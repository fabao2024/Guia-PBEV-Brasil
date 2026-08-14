import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const distDir = 'dist';
const indexPath = join(distDir, 'index.html');

const leadCaptureEnabled = String(process.env.VITE_ENABLE_LEAD_CAPTURE ?? '').trim().toLowerCase() === 'true';
const routes = [
  {
    path: 'parceiros',
    title: 'Programa de Parceiros | Guia PBEV Brasil',
    description: 'Receba oportunidades qualificadas por serviço, região e momento de decisão no piloto Guia PBEV de wallbox, energia solar e limpeza de placas em São Paulo.',
    canonicalUrl: 'https://guiapbev.cloud/parceiros/',
  },
  ...(leadCaptureEnabled ? [{ path: 'interesse' }] : []),
];

if (!existsSync(indexPath)) {
  throw new Error(`Build index not found: ${indexPath}`);
}

const baseHtml = readFileSync(indexPath, 'utf8');

for (const route of routes) {
  const target = join(distDir, route.path, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  let html = baseHtml;
  if (route.canonicalUrl) {
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${route.description}">`)
      .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${route.canonicalUrl}">`)
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${route.title}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${route.description}">`)
      .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${route.canonicalUrl}">`)
      .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${route.title}">`)
      .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${route.description}">`);
  }
  writeFileSync(target, html, 'utf8');
  console.log(`Created static SPA route: /${route.path}/ -> ${target}`);
}
