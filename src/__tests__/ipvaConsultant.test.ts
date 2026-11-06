import { describe, expect, it } from 'vitest';
import { buildStateDataSummary } from '../utils/stateDataSummary';

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
  });
});
