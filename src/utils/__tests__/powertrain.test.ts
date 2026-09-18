import { describe, expect, it } from 'vitest';
import type { Car } from '../../types';
import { carMetaDescription, combinedRangeOf, electricRangeOf, powertrainOf, primaryCarMetric } from '../powertrain';

const base: Car = {
  model: 'Teste',
  brand: 'PBEV',
  price: 100000,
  range: 0,
  cat: 'SUV',
  img: '/teste.webp',
};

describe('powertrain presentation contract', () => {
  it('keeps BEV range as PBEV autonomy', () => {
    const car = { ...base, range: 420 };
    expect(powertrainOf(car)).toBe('BEV');
    expect(electricRangeOf(car)).toBe(420);
    expect(primaryCarMetric(car)).toMatchObject({ label: 'Autonomia PBEV', value: 420, unit: 'km' });
    expect(carMetaDescription(car)).toContain('autonomia PBEV 420 km');
  });

  it('separates PHEV electric and combined autonomy', () => {
    const car: Car = { ...base, powertrain: 'PHEV', range: 60, electricRangeKm: 60, combinedRangeKm: 1100, fuelConsumptionKml: 16 };
    expect(electricRangeOf(car)).toBe(60);
    expect(combinedRangeOf(car)).toBe(1100);
    expect(primaryCarMetric(car)).toMatchObject({ label: 'Autonomia elétrica', value: 60, unit: 'km' });
    expect(carMetaDescription(car)).toContain('e total combinada 1100 km');
  });

  it('does not expose electric autonomy for HEV', () => {
    const car: Car = { ...base, powertrain: 'HEV', range: 0, fuelConsumptionKml: 14.5 };
    expect(electricRangeOf(car)).toBeUndefined();
    expect(combinedRangeOf(car)).toBeUndefined();
    expect(primaryCarMetric(car)).toMatchObject({ label: 'Consumo', value: 14.5, unit: 'km/l' });
    expect(carMetaDescription(car)).toContain('híbrido sem tomada');
  });

  it('keeps REEV total autonomy separate from electric autonomy', () => {
    const car: Car = { ...base, powertrain: 'REEV', range: 150, electricRangeKm: 150, combinedRangeKm: 950, fuelConsumptionKml: 15 };
    expect(primaryCarMetric(car).label).toBe('Autonomia elétrica');
    expect(combinedRangeOf(car)).toBe(950);
    expect(carMetaDescription(car)).toContain('elétrico com extensor de autonomia');
  });
});
