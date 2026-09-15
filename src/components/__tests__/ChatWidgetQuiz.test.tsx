import { computeQuizResults, extractQueryFilters } from '../ChatWidget';

describe('computeQuizResults (offline quiz)', () => {
  const homeAnswers = ['Até 60km', 'Até R$250k', 'Em casa à noite', 'SUV', 'Menor preço'];

  it('labels every pick with its powertrain tag', () => {
    const out = computeQuizResults(homeAnswers, 'pt-BR');
    expect(out).toContain('**Os 3 mais adequados para você:**');
    expect(out.match(/\[(BEV|PHEV|HEV|REEV)\]/g)?.length).toBe(3);
    expect(out).toContain('Quer comparar algum desses modelos?');
  });

  it('surfaces a fitting hybrid for public-only charging (all answers combined)', () => {
    const out = computeQuizResults(
      ['Até 60km', 'Até R$250k', 'Só eletroposto público', 'SUV', 'Menor preço'],
      'pt-BR',
    );
    expect(out).toContain('[PHEV]');
    expect(out).toMatch(/Song Pro G[SL]/);
  });

  it('keeps BEV on top with home charging', () => {
    const out = computeQuizResults(
      ['Até 60km', 'Até R$250k', 'Em casa à noite', 'SUV', 'Maior autonomia'],
      'pt-BR',
    );
    expect(out).toContain('[BEV]');
  });

  it('answers in English when lang is en', () => {
    const out = computeQuizResults(
      ['Up to 60km', 'Up to R$250k', 'Public fast chargers only', 'SUV', 'Lowest price'],
      'en',
    );
    expect(out).toContain('**Your top 3 matches:**');
  });
});

describe('extractQueryFilters (powertrain)', () => {
  it('detects plug-in hybrid intent', () => {
    const f = extractQueryFilters('quero um híbrido plug-in SUV até 250 mil', 'pt-BR');
    expect(f.powertrains).toEqual(['PHEV']);
    expect(f.categories).toEqual(['SUV']);
    expect(f.maxPrice).toBe(250000);
  });

  it('maps generic "híbrido" to all hybrid powertrains', () => {
    const f = extractQueryFilters('qual híbrido mais barato?', 'pt-BR');
    expect(f.powertrains).toEqual(['HEV', 'PHEV', 'REEV']);
  });

  it('detects HEV "sem tomada"', () => {
    const f = extractQueryFilters('híbrido sem tomada', 'pt-BR');
    expect(f.powertrains).toEqual(['HEV']);
  });

  it('detects range-extender intent', () => {
    const f = extractQueryFilters('SUV com extensor de autonomia', 'pt-BR');
    expect(f.powertrains).toEqual(['REEV']);
  });

  it('detects pure-electric intent', () => {
    const f = extractQueryFilters('carro 100% elétrico barato', 'pt-BR');
    expect(f.powertrains).toEqual(['BEV']);
  });

  it('leaves powertrains undefined without powertrain keywords', () => {
    const f = extractQueryFilters('SUV até 200 mil', 'pt-BR');
    expect(f.powertrains).toBeUndefined();
    expect(f.categories).toEqual(['SUV']);
  });
});
