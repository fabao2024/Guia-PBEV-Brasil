import { describe, expect, it } from 'vitest';
import {
  calcMonthlyCost,
  effectiveCarKmL,
  electricKwhPer100km,
  fuelPriceForCar,
  hasPlugInRange,
} from '../hybridCost';
import type { Car } from '../../types';

const base = (over: Partial<Car>): Car => ({
  model: 'T',
  brand: 'B',
  price: 200000,
  range: 300,
  cat: 'SUV',
  img: '/x.webp',
  ...over,
});

const input = (over = {}) => ({
  kms: 1500,
  blendedKwhPrice: 0.8,
  fuelPrice: 6.0,
  gasolinePrice: 6.2,
  fuelType: 'gasoline' as const,
  categoryKwh100: 16,
  categoryCombKmL: 9.5,
  ...over,
});

describe('electricKwhPer100km (Inmetro MJ/km primeiro)', () => {
  it('converte MJ/km oficial: 0,66 MJ/km → 18,33 kWh/100km', () => {
    expect(electricKwhPer100km(base({ energyMJkm: 0.66 }))).toBeCloseTo(18.333, 2);
  });
  it('fallback bateria útil 93% ÷ autonomia', () => {
    // Song Plus sem MJ: 26,6 kWh × 0,93 ÷ 99 km × 100
    expect(electricKwhPer100km(base({ battery: 26.6, range: 99 }))).toBeCloseTo(24.98, 1);
  });
  it('null sem dado oficial (usa categoria)', () => {
    expect(electricKwhPer100km(base({}))).toBeNull();
  });
});

describe('hasPlugInRange / fuelPriceForCar', () => {
  it('PHEV com electricRangeKm tem perna elétrica; HEV não', () => {
    expect(hasPlugInRange(base({ powertrain: 'PHEV', electricRangeKm: 60 }))).toBe(true);
    expect(hasPlugInRange(base({ powertrain: 'HEV' }))).toBe(false);
  });
  it('flex segue o preço escolhido; gasolina usa gasolina mesmo com etanol escolhido', () => {
    const flex = base({ fuelType2: 'flex' });
    const gas = base({ fuelType2: 'gasolina' });
    expect(fuelPriceForCar(flex, 'ethanol', 4.0, 6.2)).toBe(4.0);
    expect(fuelPriceForCar(gas, 'ethanol', 4.0, 6.2)).toBe(6.2);
    expect(fuelPriceForCar(gas, 'gasoline', 6.0, 6.2)).toBe(6.0);
  });
  it('etanol divide o km/L oficial só em flex', () => {
    expect(effectiveCarKmL(base({ fuelConsumptionKml: 14.0, fuelType2: 'flex' }), 'ethanol')).toBeCloseTo(10.769, 2);
    expect(effectiveCarKmL(base({ fuelConsumptionKml: 14.0, fuelType2: 'gasolina' }), 'ethanol')).toBe(14.0);
  });
  it('etanol oficial do carro prevalece sobre a estimativa ÷1,30', () => {
    // PHEV19: oficial 10,0 vs estimado 14,7/1,3 = 11,3
    expect(
      effectiveCarKmL(base({ fuelConsumptionKml: 14.7, fuelConsumptionKmlEthanol: 10.0, fuelType2: 'flex' }), 'ethanol'),
    ).toBe(10.0);
  });
});

describe('calcMonthlyCost — BEV inalterado', () => {
  it('usa MJ/km oficial no lugar da média da categoria', () => {
    const car = base({ energyMJkm: 0.66 });
    const r = calcMonthlyCost(car, input());
    // 1500/100 × 18,333 × 0,8 = 220
    expect(r.total).toBe(220);
    expect(r.costFuel).toBe(0);
    expect(r.electricKm).toBe(1500);
    // comparador: 1500/9,5 × 6 = 947
    expect(r.comparatorCost).toBe(947);
    expect(r.savings).toBe(947 - 220);
  });
});

describe('calcMonthlyCost — HEV somente combustão', () => {
  const hev = base({ powertrain: 'HEV', range: 0, fuelConsumptionKml: 15.8, fuelType2: 'flex' });
  it('sem parte elétrica', () => {
    const r = calcMonthlyCost(hev, input());
    expect(r.electricKm).toBe(0);
    expect(r.costElectric).toBe(0);
    // 1500/15,8 × 6 = 570
    expect(r.total).toBe(570);
    expect(r.kmLUsed).toBe(15.8);
  });
});

describe('calcMonthlyCost — PHEV combinado (α = R/C, premissa do carro)', () => {
  const phev = base({
    powertrain: 'PHEV', range: 60, electricRangeKm: 60, combinedRangeKm: 1200,
    fuelConsumptionKml: 14.0, fuelType2: 'gasolina',
    battery: 18.4, energyMJkm: 0.66,
  });
  it('reparte por α: 60/1200 = 5% elétrico em qualquer km', () => {
    const r = calcMonthlyCost(phev, input({ kms: 1500 }));
    expect(r.electricKm).toBeCloseTo(75, 6);
    expect(r.fuelKm).toBeCloseTo(1425, 6);
    // elétrico: 75/100 × 18,333 × 0,8 = 11; combustão: 1425/14 × 6,0 = 611
    expect(r.costElectric).toBe(11);
    expect(r.costFuel).toBe(611);
    expect(r.total).toBe(622);
  });
  it('combinado difere dos modos puros', () => {
    const comb = calcMonthlyCost(phev, input({ kms: 1500 }));
    const elec = calcMonthlyCost(phev, input({ kms: 1500, mode: 'electric' }));
    const fuel = calcMonthlyCost(phev, input({ kms: 1500, mode: 'fuel' }));
    expect(comb.total).not.toBe(elec.total);
    expect(comb.total).not.toBe(fuel.total);
    expect(elec.total).toBe(220);
    expect(fuel.total).toBe(643);
  });
  it('fallback sem C: utilização plena R×30', () => {
    const noC = base({
      powertrain: 'PHEV', range: 60, electricRangeKm: 60,
      fuelConsumptionKml: 14.0, fuelType2: 'gasolina', energyMJkm: 0.66,
    });
    const r = calcMonthlyCost(noC, input({ kms: 1500 })); // 60×30=1800 ≥ 1500
    expect(r.electricKm).toBe(1500);
    expect(r.fuelKm).toBe(0);
    expect(r.total).toBe(220);
  });
  it('modo fuel: tudo a combustão com preço da gasolina', () => {
    const r = calcMonthlyCost(phev, input({ kms: 1500, mode: 'fuel' }));
    expect(r.electricKm).toBe(0);
    // 1500/14 × 6,0 = 643
    expect(r.total).toBe(643);
  });
  it('modo electric: tudo elétrico', () => {
    const r = calcMonthlyCost(phev, input({ kms: 1500, mode: 'electric' }));
    expect(r.fuelKm).toBe(0);
    expect(r.total).toBe(220);
  });
  it('overrides manuais prevalecem', () => {
    const r = calcMonthlyCost(phev, input({ kms: 1000, customKwh100: 20, customKmL: 10, mode: 'fuel' }));
    expect(r.total).toBe(Math.round((1000 / 10) * 6.0));
  });
  it('carro a gasolina com etanol escolhido usa preço da gasolina', () => {
    const r = calcMonthlyCost(phev, input({ kms: 1500, mode: 'fuel', fuelType: 'ethanol', fuelPrice: 4.0 }));
    // 1500/14 × 6,2 (gasolina) = 664
    expect(r.total).toBe(664);
  });
  it('flex a etanol usa o oficial do carro (PHEV19: 10,0 km/L)', () => {
    const flex = base({
      powertrain: 'PHEV', range: 77, electricRangeKm: 77, combinedRangeKm: 886,
      fuelConsumptionKml: 14.7, fuelConsumptionKmlEthanol: 10.0, fuelType2: 'flex',
      battery: 19, energyMJkm: 0.6,
    });
    const r = calcMonthlyCost(flex, input({ kms: 1500, mode: 'fuel', fuelType: 'ethanol', fuelPrice: 4.0 }));
    // 1500/10 × 4,0 = 600
    expect(r.total).toBe(600);
    expect(r.kmLUsed).toBe(10.0);
  });
  it('REEV segue a mesma regra α (C10: 111/950)', () => {
    const reev = base({
      powertrain: 'REEV', range: 111, electricRangeKm: 111, combinedRangeKm: 950,
      fuelConsumptionKml: 12.0, fuelType2: 'gasolina',
      battery: 28.4, energyMJkm: 0.65,
    });
    const r = calcMonthlyCost(reev, input({ kms: 1500 }));
    // α = 111/950 = 11,68%: 175,3 km elétricos + 1324,7 a combustão
    expect(r.electricKm).toBeCloseTo(175.26, 1);
    expect(r.fuelKm).toBeCloseTo(1324.74, 1);
    expect(r.costFuel).toBe(Math.round((1324.7368 / 12.0) * 6.0));
  });
});
