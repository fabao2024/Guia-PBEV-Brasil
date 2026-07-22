import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const bootstrapPath = path.join(repoRoot, 'public', 'normalize-attribution.js');

describe('attribution bootstrap', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/parceiros');
  });

  it.each([
    ['literal marker', '?utm_source=ig~and~utm_medium=social~and~utm_campaign=partner_pilot'],
    ['URL-encoded marker', '?utm_source=ig%7Eand%7Eutm_medium=social%7Eand%7Eutm_campaign=partner_pilot'],
  ])('repairs %s before analytics reads the location', (_label, query) => {
    const script = fs.readFileSync(bootstrapPath, 'utf8');
    window.history.replaceState({}, '', `/parceiros/${query}#formulario-parceiro`);

    window.eval(script);

    expect(window.location.search).toBe('?utm_source=ig&utm_medium=social&utm_campaign=partner_pilot');
    expect(window.location.hash).toBe('#formulario-parceiro');
  });
});
