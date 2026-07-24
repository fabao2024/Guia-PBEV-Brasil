import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const bootstrapPath = path.join(repoRoot, 'public', 'normalize-attribution.js');

describe('attribution bootstrap', () => {
  beforeEach(() => {
    window.sessionStorage.removeItem('redirect');
    window.history.replaceState({}, '', '/parceiros');
  });

  it('restores a GitHub Pages deep link before analytics reads the location', () => {
    const script = fs.readFileSync(bootstrapPath, 'utf8');
    window.sessionStorage.setItem(
      'redirect',
      'carro/gwm-ora-03-skin-bev48?utm_source=ig&utm_medium=social#especificacoes',
    );
    window.history.replaceState({}, '', '/');

    window.eval(script);

    expect(window.location.pathname).toBe('/carro/gwm-ora-03-skin-bev48');
    expect(window.location.search).toBe('?utm_source=ig&utm_medium=social');
    expect(window.location.hash).toBe('#especificacoes');
    expect(window.sessionStorage.getItem('redirect')).toBeNull();
  });

  it('repairs a legacy partner UTM embedded in the pathname', () => {
    const script = fs.readFileSync(bootstrapPath, 'utf8');
    window.sessionStorage.setItem(
      'redirect',
      'parceiros&utm_source=ig~and~utm_medium=social~and~utm_campaign=partner_pilot',
    );
    window.history.replaceState({}, '', '/');

    window.eval(script);

    expect(window.location.pathname).toBe('/parceiros/');
    expect(window.location.search).toBe('?utm_source=ig&utm_medium=social&utm_campaign=partner_pilot');
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
