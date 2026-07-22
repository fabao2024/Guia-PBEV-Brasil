import { describe, expect, it } from 'vitest';
// Operational scripts are native ESM and intentionally stay outside the TS build.
import { decodeXmlEntities, runFile } from '../../.github/scripts/security-utils.mjs';

describe('GitHub automation script security', () => {
  it('decodes XML entities in one pass without double-unescaping', () => {
    expect(decodeXmlEntities('&lt;b&gt;EV&lt;/b&gt;')).toBe('<b>EV</b>');
    expect(decodeXmlEntities('&amp;lt;script&amp;gt;')).toBe('&lt;script&gt;');
  });

  it('rejects executables outside the explicit allowlist', () => {
    expect(() => runFile('sh', ['-c', 'exit 0'])).toThrow(/not allowed/i);
  });
});
