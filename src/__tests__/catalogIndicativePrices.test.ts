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
    // Same official document: DOLPHIN MINI GL 2025/2026 and 2026/2027 suggested
    // price R$ 109.990 à vista; DOLPHIN MINI GS confirmed at R$ 119.990.
    expect(byModel('Dolphin Mini GL').price).toBe(109990);
    expect(byModel('Dolphin Mini GS').price).toBe(119990);
  });

  it('should flag versions removed from official lineups as discontinued', () => {
    // BMW press release (Apr/2025): renewed i4 line offers only eDrive40 M Sport and M50;
    // Mercedes-Benz launch (Jul/2024): EQE 300 SUV replaced by EQE 350+ SUV.
    expect(byModel('i4 eDrive35').discontinued).toBe(true);
    expect(byModel('EQE 300 SUV').discontinued).toBe(true);
    // byd.com/br model menu (checked 2026-08-25): eT3 absent from the official lineup;
    // FIPE lists only the 2022 model year.
    expect(byModel('eT3').discontinued).toBe(true);
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

  it('BYD Yuan Plus AWD should match the official PBEV range and drivetrain of the current page', () => {
    // byd.com/br/car/yuan-plus (checked 2026-08-25): footnote "autonomia de até
    // 378 km conforme medição PBEV (Inmetro)"; DC 205 kW (20-80% em 20 min) and
    // optional 11 kW wallbox confirmed on the same page.
    const yuan = byModel('Yuan Plus AWD');
    expect(yuan.range).toBe(378);
    expect(yuan.power).toBe(449);
    expect(yuan.chargeDC).toBe(205);
    expect(yuan.chargeAC).toBe(11);
  });

  it('Mercedes-Benz EQB entry should reflect the current EQB 250+ nomenclature', () => {
    // imprensa.mercedes-benz.com.br EQB 250+ release + www2.mercedes-benz.com.br
    // (checked 2026-08-25): 190 cv, 70,5 kWh, up to 376 km (INMETRO), 11 kW AC /
    // 100 kW DC, suggested price R$ 399.900 - identical to the catalog entry.
    const eqb = byModel('EQB 250+');
    expect(eqb.price).toBe(399900);
    expect(eqb.range).toBe(376);
    expect(eqb.power).toBe(190);
    expect(eqb.battery).toBe(70.5);
    expect(eqb.chargeAC).toBe(11);
    expect(eqb.chargeDC).toBe(100);
  });

  it('Hyundai Ioniq 5 should use the officially published battery capacity and Signature table price', () => {
    // hyundai.com.br/veiculos/ioniq-5 + official digital catalog PDF (checked
    // 2026-08-25): lithium-ion battery 84 kWh, 325 cv, up to 374 km (INMETRO).
    // Price R$ 409.990 per the Signature version announced in the Hyundai press
    // conference (Salão do Automóvel 2025), converging across independent sources.
    const ioniq = byModel('Ioniq 5');
    expect(ioniq.battery).toBe(84);
    expect(ioniq.price).toBe(409990);
  });

  it('GAC Aion ES and Aion V Elite should match the official Brazilian specification pages', () => {
    // gacgroup.com/pt-br configuration pages + model landings (checked 2026-08-25):
    // AION ES: LFP 55,2 kWh, DC 68 kW, AC 6,6 kW, from R$ 170.990;
    // AION V Elite: LFP 75,3 kWh, DC 180 kW, AC 6,6 kW, landing "A partir de R$ 219.990".
    const es = byModel('Aion ES');
    expect(es.price).toBe(170990);
    expect(es.battery).toBe(55.2);
    expect(es.chargeDC).toBe(68);
    expect(es.chargeAC).toBe(6.6);
    const v = byModel('Aion V Elite');
    expect(v.price).toBe(219990);
    expect(v.battery).toBe(75.3);
    expect(v.chargeAC).toBe(6.6);
    expect(v.chargeDC).toBe(180);
  });

  it('GAC Hyptec HT should match the official current-line Elite entry point', () => {
    // gacgroup.com/pt-br hyptec-ht landing (checked 2026-08-25): "A partir de
    // R$ 314.990"; official configuration page: 250 kW (340 cv), LFP 83 kWh,
    // AC 6,6 kW / DC 280 kW, rear-wheel drive.
    const ht = byModel('Hyptec HT');
    expect(ht.price).toBe(314990);
    expect(ht.battery).toBe(83);
    expect(ht.chargeAC).toBe(6.6);
    expect(ht.chargeDC).toBe(280);
    expect(ht.power).toBe(340);
  });

  it('Geely EX5 should match the official table prices and specification sheet', () => {
    // geelybrasil.com.br release (jul/2025) + current official offers (checked
    // 2026-08-25): EX5 Pro R$ 205.800 and EX5 Max R$ 225.800 table prices; the
    // advertised R$ 195.800 for the Pro includes the promotional bonus.
    // Official spec sheet: LFP Short Blade 60,22 kWh, AC 11 kW / DC 100 kW.
    const pro = byModel('EX5 Pro');
    expect(pro.price).toBe(205800);
    expect(pro.battery).toBe(60.2);
    expect(pro.chargeDC).toBe(100);
    const max = byModel('EX5 Max');
    expect(max.price).toBe(225800);
    expect(max.battery).toBe(60.22);
    expect(max.chargeDC).toBe(100);
  });

  it('Geely EX2 versions should match the official specification sheet', () => {
    // Official Geely Brasil EX2 spec sheet and model page (checked 2026-08-25):
    // LFP 39,4 kWh in both versions, AC 6,6 kW / DC 70 kW, up to 289 km (INMETRO).
    const pro = byModel('EX2 Pro');
    expect(pro.battery).toBe(39.4);
    expect(pro.chargeAC).toBe(6.6);
    expect(pro.chargeDC).toBe(70);
    const max = byModel('EX2 Max');
    expect(max.battery).toBe(39.4);
    expect(max.chargeAC).toBe(6.6);
  });

  it('JAC E-JS1 and E-JS4 should match the official Brazilian model pages', () => {
    // jacmotors.com.br model pages (checked 2026-08-25): E-JS1 with LFP
    // 31,4 kWh battery, 62 cv, from R$ 119.900; E-JS4 with 147 kW (200 cv),
    // 55 kWh, R$ 254.900 and up to 307 km (INMETRO).
    const js1 = byModel('E-JS1');
    expect(js1.price).toBe(119900);
    expect(js1.battery).toBe(31.4);
    expect(js1.power).toBe(62);
    const js4 = byModel('E-JS4');
    expect(js4.price).toBe(254900);
    expect(js4.power).toBe(200);
    expect(js4.battery).toBe(55);
  });

  it('Kia EV5 Land and EV9 GT-Line should match the official Kia Brasil specification sheets', () => {
    // kia.com.br specification pages and official spec sheets (checked 2026-08-25):
    // EV5 Land R$ 389.990 with LFP Blade 88,16 kWh; EV9 GT-Line R$ 749.990 with
    // NCM 99,8 kWh and combined output of 283 kW (385 cv).
    const ev5 = byModel('EV5 Land');
    expect(ev5.price).toBe(389990);
    expect(ev5.battery).toBe(88.16);
    expect(ev5.power).toBe(217);
    const ev9 = byModel('EV9 GT-Line');
    expect(ev9.price).toBe(749990);
    expect(ev9.power).toBe(385);
    expect(ev9.battery).toBe(99.8);
    expect(ev9.range).toBe(434);
  });

  it('Lexus RZ 500e should carry the manufacturer battery and AC charging figures', () => {
    // Manufacturer data announced at the Brazilian launch (May/2026), converged
    // across specialist coverage of the official press material: lithium-ion
    // battery 77 kWh and 22 kW AC onboard charging; DC up to 150 kW.
    const rz = byModel('RZ 500e');
    expect(rz.price).toBe(499990);
    expect(rz.battery).toBe(77);
    expect(rz.chargeAC).toBe(22);
    expect(rz.chargeDC).toBe(150);
    expect(rz.power).toBe(381);
  });

  it('Renault entries should match the official Brazilian prices page', () => {
    // renault.com.br versions-and-prices pages (checked 2026-08-25): Megane
    // E-Tech from R$ 279.990; Kwid E-Tech actively offered from R$ 99.990.
    // PBEV table homologates the Kwid at 185 km (catalog carried 180).
    const megane = byModel('Megane E-Tech');
    expect(megane.price).toBe(279990);
    const kwid = byModel('Kwid E-Tech');
    expect(kwid.price).toBe(99990);
    expect(kwid.range).toBe(185);
    expect(kwid.discontinued ?? false).toBe(false);
  });

  it('Peugeot e-2008 should carry the facelift powertrain of the sold version', () => {
    // Official Stellantis/Peugeot launch release (Oct/2024): new e-2008 with
    // 158 cv, battery increased from 50 to 54 kWh, up to 261 km PBEV (INMETRO).
    const e2008 = byModel('e-2008');
    expect(e2008.power).toBe(158);
    expect(e2008.battery).toBe(54);
    expect(e2008.range).toBe(261);
  });

  it('Audi Q8 e-tron should be flagged as discontinued after end of production', () => {
    // Global production of the Q8 e-tron family ended in Brussels in Feb/2025;
    // the Audi Brazil 2026 lineup releases no longer include the model.
    expect(byModel('Q8 e-tron').discontinued).toBe(true);
  });

  it('PBEV table 2026_14_AGOd alignment for consumption and range', () => {
    // Final PBEV lot (checked 2026-08-25 against the official Inmetro PDF,
    // SHA-256 confirmed): values extracted row by row and manually paired.
    const pbev: Array<[string, number | null, number]> = [
      // pacote B - consumption corrections
      ['Dolphin Mini GS', 0.41, 280],
      ['Dolphin GS', 0.42, 291],
      ['Ora 03 Skin BEV48', 0.52, 232],
      ['Ora 03 GT BEV63', 0.54, 295],
      ['MG4 Comfort', 0.5, 364],
      ['MG4 Luxury', 0.5, 364],
      ['Zeekr X', 0.55, 332],
      ['EX30 Plus', 0.55, 250],
      ['EX40 (XC40)', 0.55, 364],
      // pacote C - fills
      ['Dolphin Mini GL', 0.39, 224],
      ['Dolphin Special Edition', 0.49, 272],
      ['Yuan Plus AWD', 0.58, 378],
      ['EX2 Pro', 0.39, 289],
      ['B10 BEV', 0.55, 288],
      ['iEV330P', 0.75, 226],
      // pacote D - range corrections + fills
      ['iX xDrive40', 0.59, 327],
      ['Blazer EV RS', 0.63, 481],
      ['Q8 e-tron', 0.61, 424],
    ];
    for (const [model, mj, range] of pbev) {
      const car = byModel(model);
      expect(car.energyMJkm ?? null).toBe(mj);
      expect(car.range).toBe(range);
    }
    // pacote A - identical values now pinned as verified
    expect(byModel('Equinox EV').energyMJkm).toBeCloseTo(0.56, 5);
    expect(byModel('Cayenne EV').range).toBe(493);
    expect(byModel('Taycan 4S').energyMJkm).toBeCloseTo(0.69, 5);
    expect(byModel('Kwid E-Tech').energyMJkm).toBeCloseTo(0.44, 5);
    expect(byModel('Yuan Plus').energyMJkm).toBeCloseTo(0.56, 5);
    expect(byModel('Dolphin Plus').energyMJkm).toBeCloseTo(0.51, 5);
  });

  it('traction should match the official drivetrain of the sold versions', () => {
    // hyundai.com.br official catalog (checked 2026-08-25): Ioniq 5 Signature
    // AWD HTRAC, dual motor, 325 cv combined.
    expect(byModel('Ioniq 5').traction).toBe('AWD');
    // geelybrasil.com.br EX2 page and spec sheet (checked 2026-08-25): rear
    // electric motor, rear-wheel drive - "o único do segmento com tração traseira".
    expect(byModel('EX2 Pro').traction).toBe('RWD');
    expect(byModel('EX2 Max').traction).toBe('RWD');
  });
});
