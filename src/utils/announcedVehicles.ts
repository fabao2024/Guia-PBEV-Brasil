import type { AnnouncedCar, FilterState } from '../types';
import { DEFAULT_MIN_RANGE } from '../types';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function selectAnnouncedCars(
  cars: AnnouncedCar[], filters: FilterState, query: string,
  favoritesOnly = false, favorites: string[] = [],
): AnnouncedCar[] {
  // Um limite escolhido pelo visitante não pode ser satisfeito por preço desconhecido.
  if (filters.maxPrice < 1500000) return [];
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return cars.filter(car => {
    if (favoritesOnly && !favorites.includes(car.model)) return false;
    if (filters.brands.length && !filters.brands.includes(car.brand)) return false;
    if (filters.categories.length && !filters.categories.includes(car.cat)) return false;
    if (filters.powertrains.length && !filters.powertrains.includes(car.powertrain ?? 'BEV')) return false;
    if (filters.minRange > DEFAULT_MIN_RANGE && car.range < filters.minRange) return false;
    if (filters.fastChargeOnly && !car.supportsDcCharging) return false;
    if (filters.showNew) {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - 3);
      if (car.announcedOn < cutoff.toISOString().slice(0, 10)) return false;
    }
    const searchable = normalize(`${car.brand} ${car.model} ${car.cat}`);
    const compact = searchable.replace(/[^a-z0-9]/g, '');
    return terms.every(term => searchable.includes(term) || compact.includes(term.replace(/[^a-z0-9]/g, '')));
  });
}

export function announcedDateLabel(date: string, locale = 'pt-BR'): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(locale, { timeZone: 'UTC' });
}
