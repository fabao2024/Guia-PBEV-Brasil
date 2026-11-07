import { describe, expect, it } from 'vitest';
import { CAR_DB } from '../constants';
import { Car } from '../types';
import { resolveIpva, spHybridRate, IPVA_REFERENCE_YEAR } from '../utils/ipva';
import { calcTCO } from '../utils/tco';
import { IPVA_BY_STATE } from '../constants/ipvaByState';
import { TAX_PROFILES } from '../constants/taxProfiles';

const car: Car = { model: 'Fixture', brand: 'Test', price: 200000, range: 300, cat: 'SUV', img: '', powertrain: 'BEV' };
const hybrid: Car = {
  ...car, powertrain: 'HEV', fuelType2: 'flex',
  taxProfile: { spClass: 'general', electricMotorKw: 40, voltageV: 150, regenerativeBraking: true, sourceUrl: 'https://example.com/specs' },
};
const params = { kms: 1500, gasPrice: 6, gasolinePrice: 6, blendedKwhPrice: 1, fuelType: 'gasoline' as const, selectedState: 'SP' };

describe('SP IPVA rules (2026 reference)', () => {
  it('uses 4% for a passenger BEV, including legacy missing powertrain', () => {
    expect(resolveIpva(car, 'SP')).toMatchObject({ rate: 0.04, amount: 8000, reason: 'bev' });
    expect(resolveIpva({ ...car, powertrain: undefined }, 'SP').rate).toBe(0.04);
  });
  it.each(['HEV', 'PHEV', 'REEV'] as const)('does not exempt a gasoline %s', powertrain => {
    expect(resolveIpva({ ...hybrid, powertrain, fuelType2: 'gasolina' }, 'SP')).toMatchObject({ rate: 0.04, amount: 8000, reason: 'fuel' });
  });
  it('does not use combined cv or battery capacity as technical proof', () => {
    const result = resolveIpva({ ...hybrid, taxProfile: undefined, power: 500, battery: 40 }, 'SP');
    expect(result).toMatchObject({ rate: null, amount: null, standardRate: 0.04, status: 'conditional', reason: 'technical' });
    expect(result.missing).toEqual(expect.arrayContaining(['electricMotorKw', 'voltageV', 'regenerativeBraking']));
  });
  it('requires fuel and an evidence URL and treats low specs as ineligible', () => {
    expect(resolveIpva({ ...hybrid, fuelType2: undefined }, 'SP').status).toBe('conditional');
    expect(resolveIpva({ ...hybrid, taxProfile: { ...hybrid.taxProfile!, sourceUrl: '' } }, 'SP').status).toBe('conditional');
    for (const patch of [{ electricMotorKw: 39.9 }, { voltageV: 149 }, { regenerativeBraking: false }]) {
      expect(resolveIpva({ ...hybrid, taxProfile: { ...hybrid.taxProfile!, ...patch } }, 'SP')).toMatchObject({ rate: 0.04, reason: 'technicalFail' });
    }
  });
  it('applies the inclusive 2026 ceiling and does not freeze it for later years', () => {
    expect(resolveIpva({ ...hybrid, price: 261154.45 }, 'SP')).toMatchObject({ rate: 0, amount: 0, reason: 'eligible', status: 'estimate' });
    expect(resolveIpva({ ...hybrid, price: 261154.46 }, 'SP')).toMatchObject({ rate: 0.04, reason: 'threshold' });
    expect(resolveIpva(hybrid, 'SP', { year: 2027 })).toMatchObject({ rate: null, amount: null, status: 'conditional', reason: 'futureCeiling', benefitRate: 0.01 });
  });
  it('uses the statutory calendar, not ownership-year indexes', () => {
    expect([2025, 2026, 2027, 2028, 2029, 2030].map(spHybridRate)).toEqual([0, 0, 0.01, 0.02, 0.03, 0.04]);
    expect(resolveIpva(hybrid, 'SP', { year: 2024 }).amount).toBeNull();
  });
  it('does not guess a commercial vehicle fiscal class or fall back to SP for other UFs', () => {
    expect(resolveIpva({ ...car, cat: 'Comercial' }, 'SP')).toMatchObject({ amount: null, reason: 'classification' });
    expect(resolveIpva({ ...car, cat: 'Comercial', taxProfile: { spClass: 'truck', sourceUrl: 'https://example.com' } }, 'SP').rate).toBe(0.015);
    expect(resolveIpva({ ...car, cat: 'Comercial', taxProfile: { spClass: 'singleCabPickup', sourceUrl: 'https://example.com' } }, 'SP').rate).toBe(0.02);
    expect(resolveIpva(car, 'RJ').amount).toBeNull();
    expect(resolveIpva(car, 'invalid').amount).toBeNull();
  });
  it('rejects invalid bases instead of claiming exemption', () => {
    for (const baseValue of [0, -1, NaN, Infinity]) {
      expect(resolveIpva(car, 'SP', { baseValue }).amount).toBeNull();
    }
  });
  it('resolves a known exceeded ceiling even when some technical evidence is missing', () => {
    expect(resolveIpva({ ...hybrid, price: 300000, taxProfile: undefined }, 'SP')).toMatchObject({ reason: 'threshold', rate: 0.04 });
  });
  it.each(['Corolla GLi Hybrid', 'Corolla Altis Hybrid', 'Corolla Cross Hybrid', 'Yaris Cross XRE Hybrid', 'Yaris Cross XRX Hybrid', 'Haval H6 PHEV19', 'Haval H7 PHEV', 'CS55 PHEV'])('recognizes sourced 2026 eligibility for %s', model => {
    const entry = CAR_DB.find(c => c.model === model)!;
    expect(entry).toBeDefined();
    expect(resolveIpva(entry, 'SP')).toMatchObject({ rate: 0, amount: 0, reason: 'eligible' });
    expect(entry.taxProfile?.sourceUrl).toMatch(/^https:\/\//);
  });
  it.each(['Haval H6 PHEV35', 'Haval H6 GT', 'Tank 300'])('does not exempt %s above the estimated ceiling', model => {
    expect(resolveIpva(CAR_DB.find(c => c.model === model)!, 'SP')).toMatchObject({ rate: 0.04, reason: 'threshold' });
  });
  it.each(['Song Pro GL', 'Song Pro GS', 'Atto 2 GS', 'Haval H6 HEV ONE', 'Haval H6 HEV2'])('does not turn missing or inconsistent evidence for %s into a 4%% assessment', model => {
    expect(resolveIpva(CAR_DB.find(c => c.model === model)!, 'SP')).toMatchObject({ rate: null, amount: null, status: 'conditional', reason: 'technical' });
  });
  it('records the Wey 07 gasoline engine rather than treating fuel as unknown', () => {
    const wey = CAR_DB.find(c => c.model === 'Wey 07')!;
    expect(wey.fuelType2).toBe('gasolina');
    expect(resolveIpva(wey, 'SP')).toMatchObject({ rate: 0.04, reason: 'fuel' });
  });
  it('covers every catalog model without granting exemption on missing evidence', () => {
    expect(IPVA_REFERENCE_YEAR).toBe(2026);
    for (const entry of CAR_DB) {
      const result = resolveIpva(entry, 'SP');
      expect(result.year).toBe(2026);
      if (result.rate === 0) expect(entry.taxProfile?.sourceUrl).toBeTruthy();
      if (entry.cat === 'Comercial' && !entry.taxProfile) expect(result.amount).toBeNull();
    }
  });
  it('keeps scoped evidence for every flex hybrid without orphan profiles', () => {
    const flex = CAR_DB.filter(entry => entry.powertrain && entry.powertrain !== 'BEV' && entry.fuelType2 === 'flex');
    expect(Object.keys(TAX_PROFILES).sort()).toEqual(flex.map(entry => entry.model).sort());
    for (const entry of flex) {
      expect(entry.taxProfile?.scope).toContain('Brasil');
      expect(entry.taxProfile?.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.taxProfile?.sourceUrl).toMatch(/^https:\/\//);
    }
  });
});

describe('catalog × UF coverage', () => {
  it('lists exactly the 26 states and DF', () => {
    expect(IPVA_BY_STATE).toHaveLength(27);
    expect(new Set(IPVA_BY_STATE.map(state => state.abbr)).size).toBe(27);
  });
  it.each(IPVA_BY_STATE)('evaluates all catalog models in $abbr without cross-state inheritance', state => {
    for (const entry of CAR_DB) {
      const result = resolveIpva(entry, state.abbr);
      expect(result.state).toBe(state.abbr);
      expect(result.year).toBe(2026);
      if (state.abbr !== 'SP') {
        expect(result.status).toBe('unavailable');
        expect(result.rate).toBeNull();
        expect(result.amount).toBeNull();
      }
    }
  });
});

describe('IPVA in TCO', () => {
  it('does not round a base above the legal ceiling into exemption', () => {
    const result = calcTCO({ ...hybrid, price: 261154.46 }, params);
    expect(result.years[0].ipvaEstimate).toMatchObject({ rate: 0.04, reason: 'threshold', baseValue: 261154.46 });
  });
  it('keeps the 2026 exemption separate from future unconfirmed ceilings', () => {
    const result = calcTCO(hybrid, { ...params, projectIpvaBenefit: false });
    expect(result.years.map(y => y.calendarYear)).toEqual([2026, 2027, 2028, 2029]);
    expect(result.years[0].ipvaEV).toBe(0);
    expect(result.years[1].ipvaEV).toBeNull();
    expect(result.years[1].ipvaComb).toBeNull();
    expect(result.ipvaIncluded).toBe(false);
    expect(result.ipvaScenario).toBe(true);
    expect(result.years[0].ipvaComb).toBe(8000);
    for (const year of result.years.slice(1)) {
      expect(year.totalEV).toBe(year.energyEV + year.insuranceEV + year.maintEV);
      expect(year.totalComb).toBe(year.energyComb + year.insuranceComb + year.maintComb);
    }
  });
  it('excludes IPVA from BOTH sides of partial comparisons, without displaying zero tax', () => {
    const result = calcTCO({ ...car, cat: 'Comercial' }, params);
    expect(result.ipvaIncluded).toBe(false);
    for (const year of result.years) {
      expect(year.ipvaEV).toBeNull();
      expect(year.ipvaComb).toBeNull();
      expect(year.totalEV).toBe(year.energyEV + year.insuranceEV + year.maintEV);
      expect(year.totalComb).toBe(year.energyComb + year.insuranceComb + year.maintComb);
    }
  });
  it('does not apply unverified legacy exemptions to non-SP TCO', () => {
    expect(calcTCO(car, { ...params, selectedState: 'MG' }).ipvaIncluded).toBe(false);
  });
});
