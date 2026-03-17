import { Car } from '../types';
import { IPVA_BY_STATE, calcIpva, STANDARD_COMBUSTION_IPVA_RATE } from '../constants/ipvaByState';

export type FuelType = 'gasoline' | 'ethanol';

export interface TCOParams {
  kms: number;             // km/month
  gasPrice: number;        // R$/L
  blendedKwhPrice: number; // R$/kWh (blended AC+DC)
  fuelType: FuelType;      // tipo de combustível
  selectedState: string;
  customEvKwh?: number | null;   // override kWh/100km (já efetivo)
  customCombKmL?: number | null; // override km/L (já efetivo, com etanol ajustado se aplicável)
}

// Depreciação linear ao longo de 4 anos
const EV_DEPR_ANNUAL   = 0.38 / 4; // 9,5% ao ano
const COMB_DEPR_ANNUAL = 0.28 / 4; // 7,0% ao ano

// Alíquota de seguro sobre valor depreciado do veículo
const EV_INS_RATE   = 0.033; // 3,3% do valor EV/ano
const COMB_INS_RATE = 0.025; // 2,5% do valor combustão/ano

// Intervalo de revisão em km
export const EV_MAINT_KM   = 20_000; // revisão a cada 20.000 km (EV)
export const COMB_MAINT_KM = 10_000; // revisão a cada 10.000 km (combustão)

// Etanol consome 30% mais volume que gasolina para a mesma distância
export const ETHANOL_FACTOR = 1.30;

interface TCOCategory {
  maintEVPerService: number;   // R$ por revisão (EV)
  maintCombPerService: number; // R$ por revisão (combustão)
  combKmL: number;             // km/l equivalente combustão (gasolina)
  efficiencyKwh: number;       // kWh/100km
}

export const TCO_BY_CATEGORY: Record<string, TCOCategory> = {
  Urbano:    { maintEVPerService: 900,  maintCombPerService: 1800, combKmL: 12.0, efficiencyKwh: 12 },
  Compacto:  { maintEVPerService: 1100, maintCombPerService: 2200, combKmL: 11.0, efficiencyKwh: 14 },
  SUV:       { maintEVPerService: 1800, maintCombPerService: 3200, combKmL: 9.5,  efficiencyKwh: 16 },
  Sedan:     { maintEVPerService: 1400, maintCombPerService: 2600, combKmL: 11.0, efficiencyKwh: 14 },
  Luxo:      { maintEVPerService: 3500, maintCombPerService: 5000, combKmL: 8.0,  efficiencyKwh: 21 },
  Comercial: { maintEVPerService: 2500, maintCombPerService: 4000, combKmL: 7.5,  efficiencyKwh: 22 },
};

/** Valor depreciado no início do ano Y (1-based) */
function depreciatedValue(originalPrice: number, annualRate: number, year: number): number {
  return Math.max(0, originalPrice * (1 - annualRate * (year - 1)));
}

export interface TCOYearBreakdown {
  year: number;
  evValue: number;
  combValue: number;
  energyEV: number;
  energyComb: number;
  insuranceEV: number;
  insuranceComb: number;
  maintEV: number;
  maintComb: number;
  ipvaEV: number;
  ipvaComb: number;
  totalEV: number;
  totalComb: number;
  savingsEV: number;
}

export interface TCOResult {
  years: TCOYearBreakdown[];
  totalEV4y: number;
  totalComb4y: number;
  totalSavings4y: number;
  costPerKmEV: number;   // R$/km TCO total
  costPerKmComb: number; // R$/km TCO total
}

export function calcTCO(car: Car, params: TCOParams): TCOResult {
  const cat = TCO_BY_CATEGORY[car.cat] ?? TCO_BY_CATEGORY['Compacto'];
  const ipvaStateInfo = IPVA_BY_STATE.find(s => s.abbr === params.selectedState)
    ?? IPVA_BY_STATE.find(s => s.abbr === 'SP')!;

  const annualKms = params.kms * 12;

  // Consumo efetivo: usa valor personalizado se fornecido, caso contrário padrão por categoria
  const efficiencyKwh = params.customEvKwh ?? cat.efficiencyKwh;
  const effectiveCombKmL = params.customCombKmL ??
    (params.fuelType === 'ethanol' ? cat.combKmL / ETHANOL_FACTOR : cat.combKmL);

  // Energia anual — constante ao longo dos anos
  const annualEnergyEV   = Math.round((annualKms / 100) * efficiencyKwh * params.blendedKwhPrice);
  const annualEnergyComb = annualKms > 0
    ? Math.round((annualKms / effectiveCombKmL) * params.gasPrice)
    : 0;

  // Manutenção proporcional ao km e intervalo de revisão
  const annualMaintEV   = Math.round(cat.maintEVPerService   * annualKms / EV_MAINT_KM);
  const annualMaintComb = Math.round(cat.maintCombPerService * annualKms / COMB_MAINT_KM);

  const years: TCOYearBreakdown[] = [];

  for (let y = 1; y <= 4; y++) {
    const evValue   = Math.round(depreciatedValue(car.price, EV_DEPR_ANNUAL,   y));
    const combValue = Math.round(depreciatedValue(car.price, COMB_DEPR_ANNUAL, y));

    const insuranceEV   = Math.round(evValue   * EV_INS_RATE);
    const insuranceComb = Math.round(combValue * COMB_INS_RATE);

    const ipvaEV   = calcIpva(evValue, ipvaStateInfo);
    const ipvaComb = Math.round(combValue * STANDARD_COMBUSTION_IPVA_RATE);

    const totalEV   = annualEnergyEV   + insuranceEV   + annualMaintEV   + ipvaEV;
    const totalComb = annualEnergyComb + insuranceComb + annualMaintComb + ipvaComb;

    years.push({
      year: y, evValue, combValue,
      energyEV: annualEnergyEV, energyComb: annualEnergyComb,
      insuranceEV, insuranceComb,
      maintEV: annualMaintEV, maintComb: annualMaintComb,
      ipvaEV, ipvaComb,
      totalEV, totalComb,
      savingsEV: totalComb - totalEV,
    });
  }

  const totalEV4y   = years.reduce((s, y) => s + y.totalEV,   0);
  const totalComb4y = years.reduce((s, y) => s + y.totalComb, 0);
  const totalKms4y  = annualKms * 4;

  return {
    years,
    totalEV4y,
    totalComb4y,
    totalSavings4y: totalComb4y - totalEV4y,
    costPerKmEV:   totalKms4y > 0 ? totalEV4y   / totalKms4y : 0,
    costPerKmComb: totalKms4y > 0 ? totalComb4y / totalKms4y : 0,
  };
}
