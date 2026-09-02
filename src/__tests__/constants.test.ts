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
      ['heightMm', 1150, 2300],
      ['wheelbaseMm', 1900, 3400],
      ['groundClearanceMm', 90, 300],
      ['weightKg', 700, 3500],
      // 8000 L: furgões (Kangoo E-Tech 4.300 L etc.) declaram volume de carga
      ['trunkLiters', 40, 8000],
    ];

    it('optional dimension fields should be integers within plausible ranges', () => {
      for (const car of CAR_DB) {
        for (const [field, min, max] of RANGES) {
          const value = car[field];
          if (value !== undefined) {
            expect(typeof value).toBe('number');
            expect(Number.isFinite(value), `${car.model}.${String(field)} deve ser finito`).toBe(true);
            expect(Number.isInteger(value), `${car.model}.${String(field)} deve ser inteiro`).toBe(true);
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
});
