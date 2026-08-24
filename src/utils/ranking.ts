import type { Car } from '../types';

export type RankMode = 'catalog' | 'price-asc' | 'range-desc' | 'efficiency-asc' | 'power-desc';

function compareNumbers(a: number | undefined, b: number | undefined, direction: 'asc' | 'desc'): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return direction === 'asc' ? a - b : b - a;
}

/**
 * Orders the public catalog without mutating the source array.
 * Missing measurements are kept after measured values so rankings do not
 * silently treat an absent value as zero.
 */
export function sortCars(cars: Car[], mode: RankMode): Car[] {
  if (mode === 'catalog') return [...cars];

  return [...cars].sort((a, b) => {
    const primary = mode === 'price-asc'
      ? compareNumbers(a.price, b.price, 'asc')
      : mode === 'range-desc'
        ? compareNumbers(a.range, b.range, 'desc')
        : mode === 'power-desc'
          ? compareNumbers(a.power, b.power, 'desc')
          : compareNumbers(a.energyMJkm, b.energyMJkm, 'asc');

    if (primary !== 0) return primary;
    const rangeTieBreak = compareNumbers(a.range, b.range, 'desc');
    if (rangeTieBreak !== 0) return rangeTieBreak;
    const priceTieBreak = compareNumbers(a.price, b.price, 'asc');
    if (priceTieBreak !== 0) return priceTieBreak;
    return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, 'pt-BR');
  });
}
