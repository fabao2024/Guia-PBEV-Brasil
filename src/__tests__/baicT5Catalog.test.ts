import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CAR_DB } from '../constants';

const registry = JSON.parse(readFileSync(resolve(process.cwd(), '.github/data/catalog-provenance.json'), 'utf8'));

describe('Brazilian BAIC Arcfox T5 evidence', () => {
  it('documents primary-source gaps rather than promoting launch reporting to verified data', () => {
    const slug = 'baic-arcfox-t5';
    const entry = registry.vehicles[slug];
    expect(entry).toMatchObject({ brand: 'BAIC', model: 'Arcfox T5' });
    expect(registry.vehicles['baic-arcfox-t5-max']).toBeUndefined();
    expect(Object.keys(registry.legacyExceptions).some(key => key.startsWith('baic-arcfox-t5-max.'))).toBe(false);
    const fields = ['price', 'range_km', 'consumption', 'power', 'battery', 'charging',
      'availability', 'dimensions', 'trunk', 'weight'];
    expect(Object.keys(entry.fields).sort()).toEqual([...fields].sort());
    for (const field of fields.filter(field => field !== 'dimensions')) {
      expect(entry.fields[field].verificationStatus).toBe('legacy_unverified');
      expect(entry.fields[field].verifiedAt).toBeNull();
      expect(registry.legacyExceptions[`${slug}.${field}`].reason).toBeTruthy();
      expect(registry.legacyExceptions[`${slug}.${field}`].reviewCondition).toBeTruthy();
    }
    for (const field of ['price', 'range_km', 'power', 'battery', 'charging', 'availability']) {
      expect(entry.fields[field].sourceType).toBe('specialist_media');
      expect(entry.fields[field].sourceUrl).toMatch(/^https:\/\//);
      expect(entry.fields[field].sourceUpdatedAt).toBe('2026-11-11');
    }
  });

  it('records the official global dimensions separately from pending Brazilian evidence', () => {
    const slug = 'baic-arcfox-t5';
    const field = registry.vehicles[slug].fields.dimensions;
    expect(field).toMatchObject({
      verificationStatus: 'verified',
      sourceType: 'official_manufacturer',
      sourceUrl: 'https://www.arcfoxglobal.com/models/56',
      sourceUpdatedAt: '2026-11-12',
      verifiedAt: '2026-11-12',
      sourceDateKind: 'observed',
    });
    expect(field.notes).toContain('global');
    expect(field.notes).toContain('4.760 mm');
    expect(registry.legacyExceptions[`${slug}.dimensions`]).toBeUndefined();
  });

  it('ships a distinct local image and public source documentation', () => {
    const car = CAR_DB.find(car => car.model === 'Arcfox T5');
    expect(car).toBeDefined();
    expect(existsSync(resolve(process.cwd(), `public${car!.img}`))).toBe(true);
    expect(car!.img).not.toBe(CAR_DB.find(car => car.model === 'Arcfox T1 Max')?.img);
    expect(existsSync(resolve(process.cwd(), 'docs/catalogo-baic-t5.md'))).toBe(true);
  });
});
