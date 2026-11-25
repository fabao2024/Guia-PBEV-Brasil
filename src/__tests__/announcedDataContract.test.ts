import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ANNOUNCED_CARS } from '../constants/announcedVehicles';
import { CAR_DB } from '../constants';

const payload = JSON.parse(readFileSync('public/data/cars.json', 'utf8'));
const provenance = JSON.parse(readFileSync('.github/data/catalog-provenance.json', 'utf8'));

describe('contrato público de anúncios e proveniência', () => {
  it('preserva o array e as contagens do catálogo com preço', () => {
    expect(payload.total).toBe(CAR_DB.length);
    expect(payload.cars).toHaveLength(CAR_DB.length);
    expect(payload.cars.every((car: { price: number }) => Number.isFinite(car.price) && car.price > 0)).toBe(true);
    expect(payload.announced_total).toBe(ANNOUNCED_CARS.length);
    expect(payload.announced_cars).toHaveLength(ANNOUNCED_CARS.length);
    const car = payload.announced_cars[0];
    expect(car).toMatchObject({ brand: 'DENZA', model: 'BAO 3', price: null, price_status: 'unannounced',
      presale_starts_on: '2026-12-01', power_cv: 354, range_km: 427, slug: 'denza-bao-3' });
    expect(car.specification_note).toMatch(/imprensa/);
    const slugs = [...payload.cars, ...payload.announced_cars].map(car => car.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('documenta pendências sem promover notícia ou ausência de preço a evidência oficial', () => {
    const entry = provenance.vehicles['denza-bao-3'];
    expect(entry.fields.power).toMatchObject({ verificationStatus: 'verified', sourceType: 'official_manufacturer' });
    for (const field of ['price', 'range_km', 'consumption', 'battery', 'charging', 'availability', 'dimensions', 'trunk', 'weight']) {
      expect(entry.fields[field].verificationStatus, field).not.toBe('verified');
      expect(entry.fields[field].verifiedAt, field).toBeNull();
      expect(provenance.legacyExceptions[`denza-bao-3.${field}`].reason, field).toBeTruthy();
      expect(provenance.legacyExceptions[`denza-bao-3.${field}`].reviewCondition, field).toBeTruthy();
    }
  });
});
