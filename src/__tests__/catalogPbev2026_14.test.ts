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

  it('Volvo EC40 single-motor should use its own homologated consumption, not the P8 one', () => {
    // Site entry is the single motor (RWD, 69 kWh); table row EC40 '6 CORE/PLUS/ULTRA' = 385 km / 0.51 MJ/km / A.
    // The previous 0.59 value belonged to the '8' (P8 AWD) rows.
    const ec40 = byModel('EC40 (C40)');
    expect(ec40.range).toBe(385);
    expect(ec40.energyMJkm).toBeCloseTo(0.51, 5);
  });

  it('Renault Kwid E-Tech should be flagged as discontinued', () => {
    // Renault BR official site no longer lists the Kwid E-Tech; KWID menu entry is flex-only,
    // and the only remaining 100% electric Renault in Brazil is the Megane E-Tech.
    expect(byModel('Kwid E-Tech').discontinued).toBe(true);
  });

  it('BMW iX3 should reflect the new NA5 generation on sale in Brazil', () => {
    // bmw.com.br official page (checked 2026-08-24): iX3 50 xDrive, from R$ 582.950,
    // 570 km PBEV range (Inmetro), 469 cv combined, 10-80% in 21 min at 320 kW DC.
    // PBEV table row: iX3 '50 XDRIVE MSP' = 570 km / 0.54 MJ/km / PBE A.
    const ix3 = byModel('iX3');
    expect(ix3.price).toBe(582950);
    expect(ix3.range).toBe(570);
    expect(ix3.power).toBe(469);
    expect(ix3.battery).toBe(80);
    expect(ix3.pbeRating).toBe('A');
    expect(ix3.energyMJkm).toBeCloseTo(0.54, 5);
    expect(ix3.traction).toBe('AWD');
  });

  it('Nissan Ariya should be flagged as discontinued', () => {
    // Absent from the FIPE table and from the nissan.com.br model menu (checked 2026-08-24).
    expect(byModel('Ariya').discontinued).toBe(true);
  });
});
