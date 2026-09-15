import { CAR_DB } from '../constants';
import type { Car } from '../types';

describe('CAR_DB data integrity', () => {
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

  it('every car should have valid range (positive number)', () => {
    for (const car of CAR_DB) {
      expect(car.range).toBeGreaterThan(0);
      expect(Number.isFinite(car.range)).toBe(true);
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
      }
    });
  });
});
