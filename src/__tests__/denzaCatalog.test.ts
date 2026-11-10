import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CAR_DB } from '../constants';

const root = process.cwd();
const registry = JSON.parse(readFileSync(resolve(root, '.github/data/catalog-provenance.json'), 'utf8'));

describe('DENZA catalog evidence', () => {
  it('records official field sources and documents the one missing consumption value', () => {
    const slugs = ['denza-b5-gl', 'denza-b5-gs', 'denza-z9gt-ev', 'denza-d9-ev'];
    for (const slug of slugs) {
      const entry = registry.vehicles[slug];
      expect(entry.brand).toBe('DENZA');
      for (const [name, field] of Object.entries(entry.fields) as Array<[string, {
        verificationStatus: string; sourceType: string | null; sourceUrl: string | null;
      }]>) {
        if (slug === 'denza-d9-ev' && name === 'consumption') {
          expect(field.verificationStatus).toBe('legacy_unverified');
          expect(registry.legacyExceptions[`${slug}.${name}`].reason).toContain('permanece ausente');
        } else {
          expect(field.verificationStatus).toBe('verified');
          expect(field.sourceType).toBe('official_manufacturer');
          expect(field.sourceUrl).toMatch(/^https:\/\/www\.denza\.com\//);
        }
      }
    }
  });

  it('keeps the four approved official originals available locally', () => {
    const denza = CAR_DB.filter(car => car.brand === 'DENZA');
    expect(denza).toHaveLength(4);
    expect(new Set(denza.map(car => car.img)).size).toBe(4);
    for (const car of denza) {
      expect(existsSync(resolve(root, 'public', car.img.slice(1)))).toBe(true);
    }
  });

  it('keeps generated README metrics aligned in Portuguese and English', () => {
    const readme = readFileSync(resolve(root, 'README.md'), 'utf8');
    const brands = new Set(CAR_DB.map(car => car.brand)).size;
    expect(readme).toContain(`**${CAR_DB.length} veículos** (BEV + híbridos) cadastrados (${brands} marcas)`);
    expect(readme).toContain(`**${CAR_DB.length} vehicles** (BEV + hybrids) registered (${brands} brands)`);
  });
});
