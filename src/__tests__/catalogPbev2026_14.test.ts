import { CAR_DB } from '../constants';

/**
 * Regression tests for PBEV/Inmetro table 2026_14_AGOd (updated 14-Aug-26, 18th cycle).
 * Each value was verified against the official PDF row before being pinned here.
 * Reference: https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular
 */
describe('CAR_DB values per PBEV/Inmetro table 2026_14_AGOd', () => {
  const byModel = (model: string) => {
    const car = CAR_DB.find(c => c.model === model);
    expect(car).toBeDefined();
    return car!;
  };

  it('Audi Q6 Sportback e-tron should use the homologated energy consumption (0.61 MJ/km)', () => {
    // Table row: Q6 Sportback e-tron Quattro 'Performance black' — 427 km / 0.61 MJ/km / PBE A
    expect(byModel('Q6 Sportback e-tron').range).toBe(427);
    expect(byModel('Q6 Sportback e-tron').energyMJkm).toBe(0.61);
    expect(byModel('Q6 Sportback e-tron').pbeRating).toBe('A');
  });

  it('Audi SQ6 Sportback e-tron should use the homologated energy consumption (0.60 MJ/km)', () => {
    // Table row: SQ6 Sportback e-tron Quattro '-' — 428 km / 0.60 MJ/km / PBE A
    expect(byModel('SQ6 Sportback e-tron').range).toBe(428);
    expect(byModel('SQ6 Sportback e-tron').energyMJkm).toBe(0.6);
    expect(byModel('SQ6 Sportback e-tron').pbeRating).toBe('A');
  });

  it('JAC E-J7 should match the single homologated version (263 km, 0.50 MJ/km, PBE A)', () => {
    // Table row: e-J7 'e-J7' (single version) — 263 km / 0.50 MJ/km / PBE A
    expect(byModel('E-J7').range).toBe(263);
    expect(byModel('E-J7').energyMJkm).toBe(0.5);
    expect(byModel('E-J7').pbeRating).toBe('A');
  });

  it('Volvo EX30 Ultra (TWIN) should carry its homologated PBE evidence', () => {
    // Table row: EX30 'TWIN ULTRA' — 316 km / 0.62 MJ/km / PBE A
    expect(byModel('EX30 Ultra').range).toBe(316);
    expect(byModel('EX30 Ultra').pbeRating).toBe('A');
    expect(byModel('EX30 Ultra').energyMJkm).toBeCloseTo(0.62, 5);
  });
});
