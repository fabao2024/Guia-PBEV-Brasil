import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function extract(source: string, pattern: RegExp, label: string): string {
  const value = source.match(pattern)?.[1];
  if (!value) throw new Error(`Missing ${label}`);
  return value;
}

describe('partner static route metadata', () => {
  it('keeps crawler metadata aligned with the React page', () => {
    const pageSource = readFileSync(
      resolve(process.cwd(), 'src/pages/PartnerApplicationsPage.tsx'),
      'utf8',
    );
    const staticRouteSource = readFileSync(
      resolve(process.cwd(), 'tools/create-static-route-pages.mjs'),
      'utf8',
    );

    const reactDescription = extract(
      pageSource,
      /const description = '([^']+)'/,
      'React partner description',
    );
    const staticDescription = extract(
      staticRouteSource,
      /path: 'parceiros',[\s\S]*?description: '([^']+)'/,
      'static partner description',
    );

    expect(staticDescription).toBe(reactDescription);
    expect(staticDescription).not.toMatch(/seguro|financiamento|veículos/i);
  });
});
