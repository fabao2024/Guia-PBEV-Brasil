import { describe, expect, it } from 'vitest';
import { CAR_DB } from '../constants';
import { ANNOUNCED_CARS } from '../constants/announcedVehicles';
import { selectAnnouncedCars } from '../utils/announcedVehicles';
import { ALL_POWERTRAINS, DEFAULT_MIN_RANGE, type FilterState } from '../types';

const filters: FilterState = {
  maxPrice: 1500000, minRange: DEFAULT_MIN_RANGE, categories: [], brands: [],
  showNew: false, fastChargeOnly: false, powertrains: [...ALL_POWERTRAINS],
};

describe('veículos anunciados sem preço', () => {
  it('registra somente o BAO 3 brasileiro sem inventar preço ou usar a versão AWD chinesa', () => {
    expect(ANNOUNCED_CARS).toHaveLength(1);
    const car = ANNOUNCED_CARS[0];
    expect(car).toMatchObject({
      model: 'BAO 3', brand: 'DENZA', price: null, priceStatus: 'unannounced',
      presaleStartsOn: '2026-12-01', announcedOn: '2026-11-24',
      powertrain: 'BEV', power: 354, torque: 27.5, traction: 'RWD',
      battery: 86.3, range: 427, supportsDcCharging: true,
      url: 'https://www.denza.com/br/denza-bao3.html',
    });
    // Car permanece um contrato com preço: não contaminar TCO, IPVA, quiz ou ranking.
    expect(CAR_DB.some(car => /bao\s*3|^b3$/i.test(car.model))).toBe(false);
    expect(car.chargeDC).toBeUndefined();
    expect(car.chargeAC).toBeUndefined();
    expect(car.energyMJkm).toBeUndefined();
    expect(car.pbeRating).toBeUndefined();
    expect(car.lengthMm).toBeUndefined();
    expect(car.features.join(' ')).not.toMatch(/510 cv|75,6 kWh|1\.500 kW/);
    expect(car.specificationNote).toMatch(/imprensa/i);
  });

  it('permite descoberta por busca, marca, carroceria e propulsão', () => {
    expect(selectAnnouncedCars(ANNOUNCED_CARS, filters, 'denza bao')).toHaveLength(1);
    expect(selectAnnouncedCars(ANNOUNCED_CARS, filters, 'bao3')).toHaveLength(1);
    expect(selectAnnouncedCars(ANNOUNCED_CARS, { ...filters, brands: ['DENZA'] }, '')).toHaveLength(1);
    expect(selectAnnouncedCars(ANNOUNCED_CARS, { ...filters, brands: ['BYD'] }, '')).toHaveLength(0);
    expect(selectAnnouncedCars(ANNOUNCED_CARS, { ...filters, categories: ['Sedan'] }, '')).toHaveLength(0);
    expect(selectAnnouncedCars(ANNOUNCED_CARS, { ...filters, powertrains: ['HEV'] }, '')).toHaveLength(0);
    expect(selectAnnouncedCars(ANNOUNCED_CARS, { ...filters, minRange: 450 }, '')).toHaveLength(0);
    expect(selectAnnouncedCars(ANNOUNCED_CARS, { ...filters, fastChargeOnly: true }, '')).toHaveLength(1);
  });

  it('não promete adequação a um orçamento nem recomenda um veículo sem preço', () => {
    expect(selectAnnouncedCars(ANNOUNCED_CARS, { ...filters, maxPrice: 400000 }, '')).toHaveLength(0);
    expect(selectAnnouncedCars(ANNOUNCED_CARS, filters, 'BAO 3', true, [])).toHaveLength(0);
    expect(selectAnnouncedCars(ANNOUNCED_CARS, filters, 'BAO 3', true, ['BAO 3'])).toHaveLength(1);
  });
});
