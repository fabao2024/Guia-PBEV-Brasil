import { CAR_DB } from '../constants';

// Bloco 3 — preenchimento de PBE para veículos cujo range comercial bate exatamente
// com a versão homologada na Tabela PBEV 2026_14_AGOd (Inmetro, atualização 14-Aug-26).
// Cada par (modelo/versão) foi verificado linha a linha no PDF oficial.
describe('CAR_DB PBE coverage per table 2026_14_AGOd', () => {
  const byModel = (model: string) => {
    const car = CAR_DB.find(c => c.model === model);
    expect(car).toBeDefined();
    return car!;
  };

  it.each([
    ['Tan EV', 430, 'A', 0.73],
    ['Han EV', 349, 'A', 0.69],
    ['Seal AWD', 372, 'A', 0.62],
    ['Sealion 7', 360, 'A', 0.66],
    ['Aion ES', 314, 'A', 0.45],
    ['Aion V Elite', 389, 'A', 0.54],
    ['Hyptec HT', 431, 'A', 0.53],
    ['Ioniq 5', 374, 'A', 0.66],
    ['i5 M60', 393, 'A', 0.61],
    ['i7 xDrive60', 467, 'A', 0.65],
    ['Captiva EV', 304, 'A', 0.62],
    ['Equinox EV', 443, 'A', 0.56],
    ['Avatr 11', 497, 'A', 0.6],
    ['Ora 5', 349, 'A', 0.49],
    ['EX5 Max', 349, 'A', 0.51],
    ['EX5 Pro', 413, 'A', 0.42],
    ['Aion UT Premium', 253, 'A', 0.51],
    ['Aion UT Elite', 310, 'A', 0.57],
  ] as const)('%s carries homologated range/PBE/MJ', (model, range, pbe, mj) => {
    const car = byModel(model);
    expect(car.range).toBe(range);
    expect(car.pbeRating).toBe(pbe);
    expect(car.energyMJkm).toBeCloseTo(mj, 5);
  });

  it("Suzuki e-Vitara AWD matches its 4WD homologated row", () => {
    const car = CAR_DB.find(c => c.model === 'e-Vitara');
    expect(car).toBeDefined();
    expect(car!.range).toBe(293); // table '4STY 4WD'
    expect(car!.pbeRating).toBe('A');
    expect(car!.energyMJkm).toBeCloseTo(0.58, 5);
  });
});