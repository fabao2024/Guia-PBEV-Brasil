import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CAR_DB, isCarNew } from '../constants';
import { resolveIpva } from '../utils/ipva';

const root = process.cwd();
const registry = JSON.parse(readFileSync(resolve(root, '.github/data/catalog-provenance.json'), 'utf8'));
const versions = () => CAR_DB.filter(car => car.brand === 'Toyota' && car.model.startsWith('RAV4'));

describe('Brazilian Toyota RAV4 catalog', () => {
  it('adds the S and SX HEV separately without inventing the pending PHEV calculation inputs', () => {
    expect(versions().map(car => car.model)).toEqual(['RAV4 S Hybrid', 'RAV4 SX Hybrid']);
    expect(versions().map(car => car.price)).toEqual([317190, 349290]);
    for (const car of versions()) {
      expect(car).toMatchObject({
        cat: 'SUV', powertrain: 'HEV', fuelType2: 'gasolina', range: 0,
        power: 239, powerBasis: 'combined', combinedPowerCv: 239,
        traction: 'AWD', battery: 1.1,
        fuelConsumptionKml: 16.1, energyMJkm: 1.42, pbeRating: 'B',
        lengthMm: 4600, widthMm: 1855, heightMm: 1695, wheelbaseMm: 2690,
        warrantyYears: 5, warrantyBatteryYears: 8,
        url: 'https://www.toyota.com.br/modelos/rav4',
      });
      expect(car.electricRangeKm).toBeUndefined();
      expect(car.combinedRangeKm).toBeUndefined();
      expect(car.chargeAC).toBeUndefined();
      expect(car.chargeDC).toBeUndefined();
      expect(car.fuelConsumptionKmlEthanol).toBeUndefined();
      expect(car.torque).toBeUndefined(); // torque térmico não é o torque combinado
      expect(car.groundClearanceMm).toBeUndefined();
      expect(isCarNew(car)).toBe(false);
      expect(resolveIpva(car, 'SP')).toMatchObject({ rate: 0.04, reason: 'fuel' });
      expect(car.features?.some(feature => feature.includes('13,5 km/l'))).toBe(true);
      expect(car.features?.some(feature => feature.includes('Brasília') && feature.includes('referência'))).toBe(true);
      expect(car.features?.some(feature => feature.includes('Toyota 10') && feature.includes('condições'))).toBe(true);
    }
  });

  it('keeps luggage, weights and equipment version-specific', () => {
    const [s, sx] = versions();
    expect(s).toMatchObject({ weightKg: 1755, trunkLiters: 514 });
    expect(sx).toMatchObject({ weightKg: 1770, trunkLiters: 456 });
    expect(s?.features?.some(feature => feature.includes('10,5"') && feature.includes('câmera de ré'))).toBe(true);
    expect(sx?.features?.some(feature => feature.includes('12,9"') && feature.includes('360°'))).toBe(true);
  });

  it.each(['toyota-rav4-s-hybrid', 'toyota-rav4-sx-hybrid'])('documents ten field sources for %s', slug => {
    const entry = registry.vehicles[slug];
    expect(entry?.brand).toBe('Toyota');
    expect(Object.keys(entry?.fields ?? {}).sort()).toEqual([
      'availability', 'battery', 'charging', 'consumption', 'dimensions',
      'power', 'price', 'range_km', 'trunk', 'weight',
    ]);
    expect(entry?.fields.consumption).toMatchObject({
      verificationStatus: 'verified', sourceType: 'official_regulator', verifiedAt: '2026-11-26',
    });
    expect(entry?.fields.consumption.notes).toContain('S/SX HYBRID');
    expect(entry?.fields.consumption.notes).toContain('CONNECT');
    // A rede autorizada confirma oferta/preço, mas não vira verificação da fábrica.
    expect(entry?.fields.price.verificationStatus).toBe('legacy_unverified');
    expect(registry.legacyExceptions[`${slug}.price`]?.reason).toContain('Brasília');
  });

  it('ships local approved photography and documents why XSE remains pending', () => {
    expect(versions()).toHaveLength(2);
    for (const car of versions()) {
      expect(car.img).toMatch(/^\/car-images\/toyota-rav4-/);
      expect(existsSync(resolve(root, `public${car.img}`))).toBe(true);
    }
    const doc = readFileSync(resolve(root, 'docs/catalogo-toyota-rav4.md'), 'utf8');
    expect(doc).toContain('XSE');
    expect(doc).toContain('sustentação');
    expect(doc).toContain('403');
  });
});
