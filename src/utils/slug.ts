import { Car } from '../types';

/**
 * Generate a URL-friendly slug from brand + model.
 * Examples:
 *   ("BYD", "Dolphin GS")      → "byd-dolphin-gs"
 *   ("Volvo", "EX30")          → "volvo-ex30"
 *   ("Mercedes-Benz", "EQS 450") → "mercedes-benz-eqs-450"
 */
export function toSlug(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')     // non-alphanum → hyphen
    .replace(/(^-|-$)/g, '');        // trim leading/trailing hyphens
}

/**
 * Find a car by its slug in a car array.
 */
export function findCarBySlug(slug: string, cars: Car[]): Car | undefined {
  return cars.find(car => toSlug(car.brand, car.model) === slug);
}

/**
 * Get the canonical URL for a car's detail page.
 */
export function getCarUrl(car: Car): string {
  return `/carro/${toSlug(car.brand, car.model)}`;
}
