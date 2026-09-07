import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(process.cwd());
const indexHtml = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const sitemapGenerator = readFileSync(resolve(ROOT, 'generate-sitemap.ts'), 'utf8');

describe('public route and share contracts', () => {
  it('does not ship stale root model counts or a missing OG cover', () => {
    expect(indexHtml).not.toContain('101 modelos');
    expect(indexHtml).not.toContain('Compare os 101');
    expect(indexHtml).not.toContain('og-cover.jpg');
    expect(indexHtml).toContain('<meta name="twitter:card" content="summary">');
    expect(indexHtml).toContain('<link rel="icon" type="image/x-icon" href="/favicon.ico">');
    expect(indexHtml).toContain('<link rel="icon" type="image/svg+xml" href="/icon.svg">');
    expect(existsSync(resolve(ROOT, 'public/favicon.ico'))).toBe(true);
    expect(existsSync(resolve(ROOT, 'public/icon.svg'))).toBe(true);
  });

  it('does not advertise client-only comparison routes in the sitemap', () => {
    expect(sitemapGenerator).not.toContain('compareRoutes');
    expect(sitemapGenerator).not.toContain('${BASE_URL}/comparar/');
    expect(sitemapGenerator).toContain('${[...staticRoutes, ...carRoutes].join');
  });
});
