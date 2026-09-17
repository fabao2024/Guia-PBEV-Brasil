import { Car } from '../types';

export type FuelType = 'gasoline' | 'ethanol';

/**
 * Motor de custo mensal por propulsão (BEV / HEV / PHEV).
 *
 * Regras (ver /metodologia):
 * - Consumo elétrico oficial: `energyMJkm` (Inmetro/PBEV) convertido para
 *   kWh/100km. Fallback: bateria útil (93%) ÷ autonomia. Último recurso:
 *   média da categoria informada pelo chamador.
 * - Consumo em sustentação: `fuelConsumptionKml` oficial (Inmetro, cidade).
 * - PHEV no modo combinado: fração elétrica α = autonomia elétrica PBEV (R)
 *   ÷ autonomia combinada do carro (C, declarada pela montadora ou derivada
 *   de tanque oficial + km/L Inmetro). Sem C, fallback é utilização plena
 *   (R × 30 dias). Sem perguntar hábito de recarga.
 * - HEV: somente combustível (sem perna elétrica, `range == 0`).
 * - Preço do combustível: `fuelType2 === 'flex'` segue a escolha do usuário;
 *   demais (gasolina) usam sempre o preço da gasolina.
 */

// Etanol consome 30% mais volume que gasolina para a mesma distância
export const ETHANOL_FACTOR = 1.30;

// Fração útil da bateria considerada disponível (mesmo fator do planejador de rota)
export const USABLE_BATTERY_FACTOR = 0.93;

// Dias de utilização plena da autonomia elétrica por mês (premissa do modo combinado)
export const FULL_UTILIZATION_DAYS = 30;

export type HybridMode = 'combined' | 'electric' | 'fuel';

/** kWh/100km oficial (MJ/km Inmetro) ou fallback bateria/autonomia. null = usar categoria. */
export function electricKwhPer100km(car: Car): number | null {
  if (car.energyMJkm != null && car.energyMJkm > 0) return (car.energyMJkm * 100) / 3.6;
  if (car.battery != null && car.battery > 0 && car.range > 0) {
    return ((car.battery * USABLE_BATTERY_FACTOR) / car.range) * 100;
  }
  return null;
}

/** true quando o carro tem perna elétrica recarregável (PHEV/REEV/BEV com autonomia). */
export function hasPlugInRange(car: Car): boolean {
  return (car.electricRangeKm ?? 0) > 0;
}

/**
 * km/L efetivo em sustentação a partir do dado oficial do carro.
 * `flex` + etanol escolhido usa o etanol oficial do carro; sem ele, estima ÷1,30.
 * Demais usam gasolina.
 */
export function effectiveCarKmL(car: Car, fuelType: FuelType): number | null {
  if (car.fuelConsumptionKml == null || car.fuelConsumptionKml <= 0) return null;
  if (fuelType === 'ethanol' && car.fuelType2 === 'flex') {
    return car.fuelConsumptionKmlEthanol ?? car.fuelConsumptionKml / ETHANOL_FACTOR;
  }
  return car.fuelConsumptionKml;
}

/** Preço do litro aplicável ao carro (flex segue a escolha; demais, gasolina). */
export function fuelPriceForCar(car: Car, fuelType: FuelType, chosenPrice: number, gasolinePrice: number): number {
  if (car.fuelType2 === 'flex') return chosenPrice;
  return fuelType === 'gasoline' ? chosenPrice : gasolinePrice;
}

export interface MonthlyCostInput {
  kms: number;
  blendedKwhPrice: number;
  /** Preço do combustível escolhido (gasolina ou etanol, por UF). */
  fuelPrice: number;
  /** Preço da gasolina (por UF) — usado por carros não-flex com etanol escolhido. */
  gasolinePrice: number;
  fuelType: FuelType;
  /** Fallbacks por categoria (comparador + BEV sem dado oficial). */
  categoryKwh100: number;
  categoryCombKmL: number;
  customKwh100?: number | null;
  /** Override EFETIVO de km/L (já com etanol ajustado, como no simulador). */
  customKmL?: number | null;
  /** PHEV apenas. Default: 'combined'. */
  mode?: HybridMode;
}

export interface MonthlyCostResult {
  costElectric: number;
  costFuel: number;
  total: number;
  comparatorCost: number;
  savings: number;
  electricKm: number;
  fuelKm: number;
  kwh100Used: number | null;
  kmLUsed: number | null;
}

export function calcMonthlyCost(car: Car, p: MonthlyCostInput): MonthlyCostResult {
  const powertrain = car.powertrain ?? 'BEV';
  const mode: HybridMode = p.mode ?? 'combined';
  const effCombKmL =
    p.customKmL ?? (p.fuelType === 'ethanol' ? p.categoryCombKmL / ETHANOL_FACTOR : p.categoryCombKmL);
  const comparatorCost = p.kms > 0 && effCombKmL > 0 ? Math.round((p.kms / effCombKmL) * p.fuelPrice) : 0;

  const kwh100 = p.customKwh100 ?? electricKwhPer100km(car) ?? p.categoryKwh100;
  const carKmL =
    p.customKmL ??
    effectiveCarKmL(car, p.fuelType) ??
    (p.fuelType === 'ethanol' ? p.categoryCombKmL / ETHANOL_FACTOR : p.categoryCombKmL);
  const fuelPrice = fuelPriceForCar(car, p.fuelType, p.fuelPrice, p.gasolinePrice);

  let electricKm = 0;
  let fuelKm = 0;

  if (powertrain === 'BEV' || !hasPlugInRange(car)) {
    if (powertrain === 'BEV') {
      electricKm = p.kms;
    } else {
      // HEV (e congêneres sem perna elétrica): somente combustão
      fuelKm = p.kms;
    }
  } else if (mode === 'electric') {
    electricKm = p.kms;
  } else if (mode === 'fuel') {
    fuelKm = p.kms;
  } else {
    // Combinado: α = R/C (premissas do próprio carro). Fallback sem C: R×30.
    const R = car.electricRangeKm ?? 0;
    const C = car.combinedRangeKm ?? 0;
    if (C > R && R > 0) {
      const alpha = R / C;
      electricKm = p.kms * alpha;
      fuelKm = p.kms - electricKm;
    } else {
      electricKm = Math.min(p.kms, R * FULL_UTILIZATION_DAYS);
      fuelKm = p.kms - electricKm;
    }
  }

  const costElectric = electricKm > 0 ? Math.round((electricKm / 100) * kwh100 * p.blendedKwhPrice) : 0;
  const costFuel =
    fuelKm > 0 && carKmL != null && carKmL > 0 ? Math.round((fuelKm / carKmL) * fuelPrice) : 0;
  const total = costElectric + costFuel;

  return {
    costElectric,
    costFuel,
    total,
    comparatorCost,
    savings: comparatorCost - total,
    electricKm,
    fuelKm,
    kwh100Used: electricKm > 0 ? kwh100 : null,
    kmLUsed: fuelKm > 0 ? carKmL : null,
  };
}
