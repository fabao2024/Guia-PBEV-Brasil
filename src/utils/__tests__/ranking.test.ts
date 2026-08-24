import { describe, expect, it } from 'vitest';
import type { Car } from '../../types';
import { sortCars, type RankMode } from '../ranking';

const cars: Car[] = [
  { model: 'B', brand: 'Marca B', price: 150000, range: 400, cat: 'SUV', img: 'b', power: 200, energyMJkm: 0.48 },
  { model: 'C', brand: 'Marca C', price: 120000, range: 280, cat: 'Urbano', img: 'c', power: 100, energyMJkm: 0.39 },
  { model: 'A', brand: 'Marca A', price: 120000, range: 350, cat: 'Compacto', img: 'a', power: 150 },
];

describe('sortCars', () => {
  it.each([
    ['price-asc', ['A', 'C', 'B']],
    ['range-desc', ['B', 'A', 'C']],
    ['power-desc', ['B', 'A', 'C']],
    ['efficiency-asc', ['C', 'B', 'A']],
  ] as const)('orders cars by %s with deterministic ties', (mode: RankMode, expected) => {
    expect(sortCars(cars, mode).map(car => car.model)).toEqual(expected);
  });

  it('keeps catalog order when no ranking is selected', () => {
    expect(sortCars(cars, 'catalog').map(car => car.model)).toEqual(['B', 'C', 'A']);
  });

  it('places missing efficiency after measured values', () => {
    expect(sortCars(cars, 'efficiency-asc').at(-1)?.model).toBe('A');
  });
});
