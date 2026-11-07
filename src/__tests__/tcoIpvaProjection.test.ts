import { CAR_DB } from '../constants';
import { calcTCO, EV_DEPR_ANNUAL } from '../utils/tco';
import { resolveIpva } from '../utils/ipva';
import { IPVA_BY_STATE } from '../constants/ipvaByState';

const params = { kms: 1500, gasPrice: 6, gasolinePrice: 6, blendedKwhPrice: 1, fuelType: 'gasoline' as const, selectedState: 'SP' };
const eligibleModels = ['Corolla GLi Hybrid', 'Corolla Altis Hybrid', 'Corolla Cross Hybrid', 'Yaris Cross XRE Hybrid', 'Yaris Cross XRX Hybrid', 'Haval H6 PHEV19', 'Haval H7 PHEV', 'CS55 PHEV'];
const corolla = CAR_DB.find(car => car.model === 'Corolla GLi Hybrid')!;

describe('annual IPVA projections in TCO', () => {
  it.each(eligibleModels)('projects the statutory calendar, not four zero-tax years, for %s', model => {
    const car = CAR_DB.find(entry => entry.model === model)!;
    const result = calcTCO(car, params);
    expect(result.ipvaProjected).toBe(true);
    expect(result.ipvaIncluded).toBe(true);
    expect(result.years.map(year => year.ipvaEstimate.rate)).toEqual([0, null, null, null]);
    expect(result.years.map(year => year.ipvaProjection?.rate ?? year.ipvaEstimate.rate)).toEqual([0, 0.01, 0.02, 0.03]);
    for (const [index, year] of result.years.entries()) {
      expect(year.calendarYear).toBe(2026 + index);
      expect(year.ipvaEV).toBe(Math.round(car.price * (1 - EV_DEPR_ANNUAL * index) * index / 100));
      expect(year.totalEV).toBe(year.energyEV + year.insuranceEV + year.maintEV + year.ipvaEV!);
      expect(year.totalComb).toBe(year.energyComb + year.insuranceComb + year.maintComb + year.ipvaComb!);
      expect(year.savingsEV).toBe(year.totalComb - year.totalEV);
    }
    expect(result.totalEV4y).toBe(result.years.reduce((total, year) => total + year.totalEV, 0));
    expect(result.totalSavings4y).toBe(result.totalComb4y - result.totalEV4y);
    expect(result.costPerKmEV).toBe(result.totalEV4y / (params.kms * 12 * 4));
    // A projection must not mutate or replace the strict fiscal assessment.
    expect(resolveIpva(car, 'SP', { year: 2027 }).rate).toBeNull();
  });

  it('allows strict partial TCO without projecting an unknown ceiling', () => {
    const result = calcTCO(corolla, { ...params, projectIpvaBenefit: false });
    expect(result.ipvaProjected).toBe(false);
    expect(result.ipvaIncluded).toBe(false);
    expect(result.years.map(year => year.ipvaEV)).toEqual([0, null, null, null]);
    expect(result.years.slice(1).every(year => year.ipvaComb === null)).toBe(true);
  });

  it('uses calendar years and ends the benefit from 2030', () => {
    const result = calcTCO(corolla, { ...params, startYear: 2028 });
    expect(result.years.map(year => year.calendarYear)).toEqual([2028, 2029, 2030, 2031]);
    expect(result.years.map(year => year.ipvaProjection?.rate ?? year.ipvaEstimate.rate)).toEqual([0.02, 0.03, 0.04, 0.04]);
    expect(result.years.map(year => !!year.ipvaProjection)).toEqual([true, true, false, false]);
  });

  it.each(['Song Pro GL', 'Atto 2 GS', 'Haval H6 HEV2', 'Haval H6 PHEV35', 'Tank 300'])('does not invent continued eligibility for %s', model => {
    const result = calcTCO(CAR_DB.find(car => car.model === model)!, params);
    expect(result.ipvaProjected).toBe(false);
    expect(result.years.every(year => year.ipvaProjection === null)).toBe(true);
    expect(result.years[1].ipvaEV).toBeNull();
  });

  it.each([...IPVA_BY_STATE.filter(state => state.abbr !== 'SP').map(state => state.abbr), 'invalid'])('never inherits SP projections in %s', selectedState => {
    const result = calcTCO(corolla, { ...params, selectedState });
    expect(result.ipvaProjected).toBe(false);
    expect(result.years.every(year => year.ipvaEV === null && year.ipvaComb === null)).toBe(true);
  });

  it('does not change flex eligibility when the user chooses gasoline or ethanol for energy costs', () => {
    const gasoline = calcTCO(corolla, params);
    const ethanol = calcTCO(corolla, { ...params, fuelType: 'ethanol' });
    expect(ethanol.years.map(year => year.ipvaEV)).toEqual(gasoline.years.map(year => year.ipvaEV));
    expect(ethanol.ipvaProjected).toBe(true);
  });

  it.each(['Kwid E-Tech', 'Civic Advanced Hybrid'])('keeps regular rates for %s', model => {
    const result = calcTCO(CAR_DB.find(car => car.model === model)!, params);
    expect(result.ipvaProjected).toBe(false);
    expect(result.years.every(year => year.ipvaEstimate.rate === 0.04 && year.ipvaProjection === null)).toBe(true);
  });
});
