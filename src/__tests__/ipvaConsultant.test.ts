import { describe, expect, it } from 'vitest';
import { buildCarTaxSummary, buildStateDataSummary } from '../utils/stateDataSummary';
import { CAR_DB } from '../constants';

describe('consultant state data', () => {
  it('does not present unverified IPVA rates or exemptions as facts', () => {
    const summary = buildStateDataSummary();
    expect(summary).toContain('IPVA: regras e elegibilidade não verificadas');
    expect(summary).toContain('consulte a Secretaria da Fazenda');
    expect(summary).not.toMatch(/IPVA EV (Isento|\d)/);
    expect(summary).toContain('RJ (Rio de Janeiro)');
    expect(summary).toContain('SP (São Paulo)');
    expect(summary).toContain('40 kW');
    expect(summary).toContain('150 V');
    expect(summary).toContain('261.154,45');
    expect(summary).toContain('Não extrapole o teto');
    expect(summary).toContain('Pendência não significa inelegibilidade');
    expect(summary).not.toContain('descreva somente o cenário sem benefício');
  });
  it('shares sourced model eligibility and does not invent a rate for a pending model', () => {
    expect(buildCarTaxSummary(CAR_DB.find(car => car.model === 'Yaris Cross XRE Hybrid')!)).toContain('0% estimados');
    const pending = buildCarTaxSummary(CAR_DB.find(car => car.model === 'Song Pro GL')!);
    expect(pending).toContain('alíquota não determinada');
    expect(pending).toContain('120 kW');
    expect(pending).toContain('pendente V');
    expect(pending).not.toContain('4% estimados');
  });
});
