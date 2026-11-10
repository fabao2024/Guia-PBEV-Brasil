import { BRAND_URLS, CAR_DB } from '../constants';
import type { Car } from '../types';
import { ALL_POWERTRAINS, DEFAULT_MIN_RANGE } from '../types';

describe('CAR_DB data integrity', () => {
  it('lists only the Brazilian DENZA versions under a brand separate from BYD', () => {
    const denza = CAR_DB.filter(car => car.brand === 'DENZA');
    expect(denza.map(car => car.model)).toEqual(['B5 GL', 'B5 GS', 'Z9GT EV', 'D9 EV']);
    expect(BRAND_URLS.DENZA).toBe('https://www.denza.com/br');
    expect(CAR_DB.some(car => car.brand === 'BYD' && /Denza|B5|Z9GT|D9/i.test(car.model))).toBe(false);
    for (const car of denza) {
      expect(car.url).toMatch(/^https:\/\/www\.denza\.com\/br\//);
      expect(car.img).toMatch(/^\/car-images\/denza-/);
      expect(car.discontinued).not.toBe(true);
    }
  });

  it('keeps B5 GL and GS PBEV ranges, equipment and official configurator prices distinct', () => {
    const gl = CAR_DB.find(car => car.brand === 'DENZA' && car.model === 'B5 GL');
    const gs = CAR_DB.find(car => car.brand === 'DENZA' && car.model === 'B5 GS');
    expect(gl).toMatchObject({ cat: 'SUV', powertrain: 'PHEV', price: 405000, range: 81,
      electricRangeKm: 81, combinedRangeKm: 745, fuelConsumptionKml: 8, battery: 31.8,
      weightKg: 2897, lengthMm: 4888, chargeAC: 11, chargeDC: 100 });
    expect(gs).toMatchObject({ cat: 'SUV', powertrain: 'PHEV', price: 505000, range: 74,
      electricRangeKm: 74, combinedRangeKm: 771, fuelConsumptionKml: 8.4, battery: 31.8,
      weightKg: 3055, lengthMm: 4921, chargeAC: 11, chargeDC: 100 });
    expect(gl?.features?.some(feature => feature.includes('DiSus-P'))).toBe(false);
    expect(gs?.features?.some(feature => feature.includes('DiSus-P'))).toBe(true);
    expect(gl?.img).not.toBe(gs?.img);
    // Altura máxima ajustável não é o vão livre estático sem carga do campo.
    expect(gs?.groundClearanceMm).toBeUndefined();
  });

  it('uses Brazilian electric DENZA specifications rather than international range cycles', () => {
    const z9 = CAR_DB.find(car => car.brand === 'DENZA' && car.model === 'Z9GT EV');
    const d9 = CAR_DB.find(car => car.brand === 'DENZA' && car.model === 'D9 EV');
    expect(z9).toMatchObject({ powertrain: 'BEV', price: 670000, range: 476, battery: 122.4,
      power: 1156, chargeAC: 11, weightKg: 2930, trunkLiters: 495 });
    expect(d9).toMatchObject({ powertrain: 'BEV', price: 750000, range: 421, battery: 115,
      power: 557, chargeAC: 7, chargeDC: 1196, weightKg: 2995, trunkLiters: 689 });
    // Potência da estação Flash não comprova o pico de entrada do Z9GT.
    expect(z9?.chargeDC).toBeUndefined();
  });

  it('records the DFM Brazilian preview models and provisional prices', () => {
    const box = CAR_DB.find(car => car.brand === 'DFM' && car.model === 'Box Urban');
    const vigo = CAR_DB.find(car => car.brand === 'DFM' && car.model === 'Vigo Urban Plus');
    expect(box).toMatchObject({ price: 135900, range: 275, battery: 43.89, power: 95, chargeDC: 88, weightKg: 1355, trunkLiters: 309 });
    expect(vigo).toMatchObject({ price: 169900, range: 302, battery: 51.87, power: 163, chargeDC: 167, weightKg: 1532, trunkLiters: 500 });
    for (const car of [box, vigo]) {
      expect(car?.features?.some(feature => /pré-venda/i.test(feature))).toBe(true);
      expect(car?.features?.some(feature => /referência/i.test(feature))).toBe(true);
    }
    expect(CAR_DB.some(car => car.brand === 'DFM' && car.model === 'Box E2')).toBe(false);
  });
  it('distinguishes the new electric Omoda E5 versions from the SHS-H hybrids', () => {
    const elite = CAR_DB.find(car => car.model === 'Omoda E5 Elite');
    const prestige = CAR_DB.find(car => car.model === 'Omoda E5 Prestige');
    expect(elite).toMatchObject({ powertrain: 'BEV', price: 149990, range: 278, battery: 50.6, power: 210, chargeAC: 6.6, chargeDC: 110, weightKg: 1660, lengthMm: 4545, heightMm: 1588, groundClearanceMm: 171 });
    expect(prestige).toMatchObject({ powertrain: 'BEV', price: 179990, range: 320, battery: 60.9, power: 210, chargeAC: 11, chargeDC: 130, weightKg: 1742, lengthMm: 4545, heightMm: 1588, groundClearanceMm: 171 });
    for (const car of [elite, prestige]) {
      expect(car?.features?.some(feature => feature.includes('372 L') && feature.includes('declarado'))).toBe(true);
      expect(car?.trunkLiters).toBe(372);
    }
    expect(elite?.features?.some(feature => feature.includes('câmera de ré'))).toBe(true);
    expect(prestige?.features?.some(feature => feature.includes('massagem'))).toBe(true);
    expect(elite?.img).not.toBe(prestige?.img);
    expect(elite?.img).not.toBe(CAR_DB.find(car => car.model === 'Omoda E5')?.img);
    expect(CAR_DB.find(car => car.model === 'Omoda 5 SHS-H Luxury')?.powertrain).toBe('HEV');
  });
  it('lists both Brazilian Arcfox T1 versions with launch specifications', () => {
    const versions = CAR_DB.filter(car => car.brand === 'BAIC');
    expect(versions.map(car => car.model)).toEqual(['Arcfox T1 Pro', 'Arcfox T1 Max']);
    expect(versions.map(car => car.price)).toEqual([129900, 139900]);
    for (const car of versions) {
      expect(car.range).toBe(283);
      expect(car.power).toBe(95);
      expect(car.battery).toBe(42.3);
      expect(car.features?.some(feature => feature.includes('EZT'))).toBe(true);
      expect(car.features?.some(feature => feature.includes('estacionamento automático'))).toBe(false);
    }
    expect(versions[1].features?.some(feature => feature.includes('indução') && feature.includes('opcional'))).toBe(true);
    expect(versions[1].features?.some(feature => feature.includes('frenagem autônoma'))).toBe(true);
  });
  it('should have at least one car', () => {
    expect(CAR_DB.length).toBeGreaterThan(0);
  });

  it('every car should have all required fields', () => {
    for (const car of CAR_DB) {
      expect(car.model).toBeDefined();
      expect(car.brand).toBeDefined();
      expect(car.price).toBeDefined();
      expect(car.range).toBeDefined();
      expect(car.cat).toBeDefined();
      expect(car.img).toBeDefined();
    }
  });

  it('every car should have non-empty string fields', () => {
    for (const car of CAR_DB) {
      expect(car.model.trim().length).toBeGreaterThan(0);
      expect(car.brand.trim().length).toBeGreaterThan(0);
      expect(car.cat.trim().length).toBeGreaterThan(0);
      expect(car.img.trim().length).toBeGreaterThan(0);
    }
  });

  it('every car should have valid price (positive number)', () => {
    for (const car of CAR_DB) {
      expect(car.price).toBeGreaterThan(0);
      expect(Number.isFinite(car.price)).toBe(true);
    }
  });

  it('every car should have valid range (positive number, zero only for HEV without electric mode)', () => {
    for (const car of CAR_DB) {
      if ((car.powertrain ?? 'BEV') === 'HEV') {
        expect(car.range, `${car.model}: HEV deve ter range 0 (sem modo elétrico)`).toBe(0);
      } else {
        expect(car.range).toBeGreaterThan(0);
        expect(Number.isFinite(car.range)).toBe(true);
      }
    }
  });

  it('every car should have a valid category', () => {
    const validCategories = ['Urbano', 'Compacto', 'SUV', 'Sedan', 'Luxo', 'Comercial'];
    for (const car of CAR_DB) {
      expect(validCategories).toContain(car.cat);
    }
  });

  it('model names should be unique', () => {
    const models = CAR_DB.map(c => c.model);
    const uniqueModels = new Set(models);
    expect(uniqueModels.size).toBe(models.length);
  });

  it('optional power should be a positive number when present', () => {
    for (const car of CAR_DB) {
      if (car.power !== undefined) {
        expect(car.power).toBeGreaterThan(0);
        expect(Number.isFinite(car.power)).toBe(true);
      }
    }
  });

  it('optional torque should be a positive number when present', () => {
    for (const car of CAR_DB) {
      if (car.torque !== undefined) {
        expect(car.torque).toBeGreaterThan(0);
        expect(Number.isFinite(car.torque)).toBe(true);
      }
    }
  });

  describe('dimension specs', () => {
    // Faixas físicas plausíveis para BEV à venda no Brasil (limites folgados
    // para não rejeitar edge cases reais; objetivos: detectar unidade errada,
    // dígito trocado ou campo em metros em vez de mm).
    const RANGES: Array<[keyof Car, number, number]> = [
      ['lengthMm', 2500, 6000],
      ['widthMm', 1450, 2100],
      // 3000 mm: furgões altos (eSprinter 2.718 mm etc.)
      ['heightMm', 1150, 3000],
      // 4000 mm: furgões grandes (eSprinter 3.665 mm, eView Grand 3.510 mm)
      ['wheelbaseMm', 1900, 4000],
      ['groundClearanceMm', 90, 300],
      ['weightKg', 700, 3500],
      // 12000 L: furgões de carga (eSprinter 10.500 L etc.)
      ['trunkLiters', 40, 12000],
    ];

    it('optional dimension fields should be integers within plausible ranges', () => {
      for (const car of CAR_DB) {
        for (const [field, min, max] of RANGES) {
          const value = car[field] as number | undefined;
          if (value !== undefined) {
            expect(typeof value).toBe('number');
          expect(Number.isFinite(value), `${car.model}.${String(field)} deve ser finito`).toBe(true);
          // até 1 casa decimal (fichas oficiais trazem valores como 115,5 mm)
          expect(Number.isInteger(Math.round(value * 10)), `${car.model}.${String(field)} deve ter no máximo 1 decimal`).toBe(true);
            expect(value, `${car.model}.${String(field)}=${value} fora da faixa ${min}-${max}`).toBeGreaterThanOrEqual(min);
            expect(value).toBeLessThanOrEqual(max);
          }
        }
      }
    });

    it('wheelbase should be smaller than length when both are present', () => {
      for (const car of CAR_DB) {
        if (car.wheelbaseMm !== undefined && car.lengthMm !== undefined) {
          expect(car.wheelbaseMm, `${car.model}: entre-eixos >= comprimento`).toBeLessThan(car.lengthMm);
        }
      }
    });

    it('ground clearance should be smaller than height when both are present', () => {
      for (const car of CAR_DB) {
        if (car.groundClearanceMm !== undefined && car.heightMm !== undefined) {
          expect(car.groundClearanceMm, `${car.model}: altura do solo >= altura`).toBeLessThan(car.heightMm);
        }
      }
    });
  });

  describe('powertrain specs', () => {
    const VALID_POWERTRAINS = ['BEV', 'PHEV', 'HEV', 'REEV'];

    it('powertrain should be a known value when present (absent = BEV)', () => {
      for (const car of CAR_DB) {
        if (car.powertrain !== undefined) {
          expect(VALID_POWERTRAINS, `${car.model}: powertrain inválido`).toContain(car.powertrain);
        }
      }
    });

    it('PHEV/REEV should have electric range and battery', () => {
      for (const car of CAR_DB) {
        if (car.powertrain === 'PHEV' || car.powertrain === 'REEV') {
          expect(car.electricRangeKm, `${car.model}: PHEV/REEV sem electricRangeKm`).toBeGreaterThan(0);
          // Bateria em kWh exige ficha técnica oficial; enquanto pendente, o campo fica ausente (fail-closed)
          if (car.battery !== undefined) {
            expect(car.battery, `${car.model}: battery inválida`).toBeGreaterThan(0);
          }
          expect(car.range, `${car.model}: range deve ser a autonomia elétrica PBEV`).toBe(car.electricRangeKm);
          // Combinada obrigatória (declarada pela montadora ou derivada de tanque oficial + km/L
          // Inmetro): base da fração elétrica α do simulador; sem ela o carro cai no fallback R×30
          expect(car.combinedRangeKm, `${car.model}: PHEV/REEV sem combinedRangeKm`).toBeGreaterThan(car.electricRangeKm!);
        }
      }
    });

    it('HEV should not have DC fast charging or electric-only range', () => {
      for (const car of CAR_DB) {
        if (car.powertrain === 'HEV') {
          expect(car.chargeDC, `${car.model}: HEV não tem recarga DC`).toBeFalsy();
          expect(car.electricRangeKm, `${car.model}: HEV não tem autonomia elétrica`).toBeUndefined();
        }
      }
    });
    it('fuel consumption should be plausible when present', () => {
      for (const car of CAR_DB) {
        if (car.fuelConsumptionKml !== undefined) {
          expect(car.fuelConsumptionKml, `${car.model}: km/L implausível`).toBeGreaterThanOrEqual(5);
          expect(car.fuelConsumptionKml, `${car.model}: km/L implausível`).toBeLessThanOrEqual(35);
        }
        // Flex exige etanol oficial (cidade); etanol sempre pior que gasolina
        if (car.fuelType2 === 'flex') {
          expect(car.fuelConsumptionKml, `${car.model}: flex sem km/L base`).toBeGreaterThan(0);
          expect(car.fuelConsumptionKmlEthanol, `${car.model}: flex sem etanol oficial`).toBeGreaterThan(0);
          expect(car.fuelConsumptionKmlEthanol!, `${car.model}: etanol deve ser pior que gasolina`).toBeLessThan(car.fuelConsumptionKml!);
        }
      }
    });

    it('every car should pass the default catalog filters (visible on first load)', () => {
      for (const car of CAR_DB) {
        // HEV não tem autonomia elétrica: passa o filtro minRange por definição
        if ((car.powertrain ?? 'BEV') !== 'HEV') {
          expect(car.range, `${car.model}: range abaixo do default`).toBeGreaterThanOrEqual(DEFAULT_MIN_RANGE);
        }
        expect(ALL_POWERTRAINS, `${car.model}: powertrain fora do default`).toContain(car.powertrain ?? 'BEV');
      }
    });

    it('every car image should be a local path or a live https URL', () => {
      for (const car of CAR_DB) {
        expect(car.img.startsWith('/car-images/') || car.img.startsWith('https://'), `${car.model}: img inválida`).toBe(true);
        expect(car.img, `${car.model}: img com URL morta conhecida`).not.toContain('1678122393858');
      }
    });
  });
});
