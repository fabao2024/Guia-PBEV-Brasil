import { CAR_DB } from '../constants';

/**
 * Regression tests for catalog values verified against official manufacturer sites.
 * Scope: Blocos 4 and 5 of the catalog review cycle (docs/CATALOG_REVIEW_HANDOFF.md).
 * Only unambiguous version-matched values are pinned here.
 */
describe('CAR_DB indicative prices per official manufacturer sites', () => {
  const byModel = (model: string) => {
    const car = CAR_DB.find(c => c.model === model);
    expect(car).toBeDefined();
    return car!;
  };

  it('BMW i7 xDrive60 M Sport should use the official table price (R$ 1.373.950)', () => {
    // bmw.com.br i7 page (checked 2026-08-24): i7 xDrive60 M Sport, ano/modelo 2025/2026,
    // from R$ 1.373.950 à vista, pintura sólida, frete incluso.
    expect(byModel('i7 xDrive60').price).toBe(1373950);
  });

  it('Volvo EX30 line should use the current official landing prices (aug/2026)', () => {
    // volvocars.com/br ex30-electric landing (checked 2026-08-25): Plus from R$ 249.950,
    // Ultra Twin Motor from R$ 319.950, offers valid through 31/08/2026.
    expect(byModel('EX30 Plus').price).toBe(249950);
    expect(byModel('EX30 Ultra').price).toBe(319950);
  });

  it('Volvo EX40 and EC40 Single Motor should use the official specification prices', () => {
    // volvocars.com/br specifications pages (checked 2026-08-25):
    // EX40 Single Motor from R$ 329.950; EC40 Single Motor from R$ 334.950.
    expect(byModel('EX40 (XC40)').price).toBe(329950);
    expect(byModel('EC40 (C40)').price).toBe(334950);
  });

  it('Volvo EX90 Twin Motor Performance should match the official Brazilian specification', () => {
    // volvocars.com/br ex90-electric specifications (checked 2026-08-25):
    // Twin Motor Performance from R$ 849.950, 380 kW / 517 cv, 910 Nm.
    const ex90 = byModel('EX90 Twin');
    expect(ex90.price).toBe(849950);
    expect(ex90.power).toBe(517);
    expect(ex90.torque).toBe(92.8);
  });

  it('Chevrolet Blazer EV RS should use the official listed price', () => {
    // chevrolet.com.br home (checked 2026-08-25): Blazer EV RS a partir de R$ 503.190.
    expect(byModel('Blazer EV RS').price).toBe(503190);
  });

  it('Mercedes-Benz EQA 250 should use the official Inmetro range of the current line', () => {
    // imprensa.mercedes-benz.com.br EQA/EQB release: EQA 250 up to 321 km (INMETRO), 190 cv.
    expect(byModel('EQA 250').range).toBe(321);
  });

  it('Mercedes-Benz EQE 350 should match the current 350+ drivetrain figures', () => {
    // Official 350+ drivetrain data reported from the July/2024 launch release:
    // 292 hp rear motor and up to 22 kW AC onboard charging.
    const eqe = byModel('EQE 350');
    expect(eqe.power).toBe(292);
    expect(eqe.chargeAC).toBe(22);
  });

  it('BYD prices should match the official August/2026 commercial conditions', () => {
    // byd.com/br/condicoes (checked 2026-08-25): SEAL 2026/2027 suggested price R$ 299.990;
    // YUAN PRO suggested price R$ 182.990. Dolphin Plus per converging market sources: R$ 184.800.
    expect(byModel('Seal AWD').price).toBe(299990);
    expect(byModel('Yuan Pro').price).toBe(182990);
    expect(byModel('Dolphin Plus').price).toBe(184800);
  });

  it('should flag versions removed from official lineups as discontinued', () => {
    // BMW press release (Apr/2025): renewed i4 line offers only eDrive40 M Sport and M50;
    // Mercedes-Benz launch (Jul/2024): EQE 300 SUV replaced by EQE 350+ SUV.
    expect(byModel('i4 eDrive35').discontinued).toBe(true);
    expect(byModel('EQE 300 SUV').discontinued).toBe(true);
  });

  it('Audi Q6 line should match the official 2026 launch release', () => {
    // audi-imprensa.com.br (24/04/2026): Q6 e-tron S Line R$ 695.990 and
    // Q6 Sportback e-tron S Line R$ 710.990, both 315 kW / 428 cv;
    // SQ6 Sportback e-tron R$ 790.990 with 517 cv.
    const q6 = byModel('Q6 e-tron');
    const sportback = byModel('Q6 Sportback e-tron');
    const sq6 = byModel('SQ6 Sportback e-tron');
    expect(q6.price).toBe(695990);
    expect(q6.power).toBe(428);
    expect(sportback.price).toBe(710990);
    expect(sportback.power).toBe(428);
    expect(sq6.price).toBe(790990);
    expect(sq6.power).toBe(517);
  });
});
