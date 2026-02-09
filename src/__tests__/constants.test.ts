import { CAR_DB } from '../constants';

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
    const validCategories = ['Compacto', 'SUV', 'Sedan', 'Luxo', 'Comercial'];
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
});
