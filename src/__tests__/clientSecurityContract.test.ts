import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(process.cwd());

describe('client security contract', () => {
  it('ships a restrictive CSP without unsafe-inline scripts', () => {
    const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
    const csp = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i)?.[1] ?? '';

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain('sha256-5OcJ12dVr6l3S4BuDU0rmUjKlq0ZfmCLqGWcAHY1sDA=');
    expect(csp).toContain('sha256-XVj80uUSzt3JWa6FTzTaafmEiRYXOb5edzL/N5F/s6U=');

    const scriptDirective = csp.match(/script-src\s+([^;]+)/)?.[1] ?? '';
    expect(scriptDirective).not.toContain("'unsafe-inline'");
  });

  it('references PWA resources from the custom-domain root', () => {
    const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
    const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'public', 'manifest.json'), 'utf8'));

    expect(html).toContain('<link rel="manifest" href="/manifest.json">');
    expect(html).toContain('<link rel="apple-touch-icon" href="/icon.svg">');
    expect(html).not.toContain('/Guia-PBEV-Brasil/');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.icons.every((icon: { src: string }) => !icon.src.startsWith('/Guia-PBEV-Brasil/'))).toBe(true);
    expect(manifest.screenshots.every((shot: { src: string }) => !shot.src.startsWith('/Guia-PBEV-Brasil/'))).toBe(true);
  });

  it('ignores environment variants and backup files by default', () => {
    const gitignore = fs.readFileSync(path.join(repoRoot, '.gitignore'), 'utf8');

    expect(gitignore).toMatch(/^\.env\*$/m);
    expect(gitignore).toMatch(/^!\.env\.example$/m);
    expect(gitignore).toMatch(/^\*\.bak$/m);
  });

  it('fails the production build when credentials reach dist', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    const scannerPath = path.join(repoRoot, 'tools', 'check-dist-secrets.mjs');

    expect(packageJson.scripts.build).toContain('node tools/check-dist-secrets.mjs');
    expect(fs.existsSync(scannerPath)).toBe(true);
  });
});
