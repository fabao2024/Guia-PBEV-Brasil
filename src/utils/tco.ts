import { Car } from '../types';
import { IPVA_REFERENCE_YEAR, resolveIpva, IpvaEstimate } from './ipva';
import {
  ETHANOL_FACTOR,
  calcMonthlyCost,
  hasPlugInRange,
} from './hybridCost';

export type { FuelType } from './hybridCost';
export { ETHANOL_FACTOR };

import type { FuelType } from './hybridCost';

export interface TCOParams {
  kms: number;             // km/month
  gasPrice: number;        // R$/L (preço do combustível escolhido)
  gasolinePrice: number;   // R$/L gasolina (usado por carros não-flex com etanol escolhido)
  blendedKwhPrice: number; // R$/kWh (blended AC+DC)
  fuelType: FuelType;      // tipo de combustível
  selectedState: string;
  startYear?: number;      // exercício inicial (não é idade do veículo)
  /** Projeta continuidade do enquadramento já estimado no exercício de referência. */
  projectIpvaBenefit?: boolean;
  customEvKwh?: number | null;   // override kWh/100km (já efetivo)
  customCombKmL?: number | null; // override km/L (já efetivo, com etanol ajustado se aplicável)
}

// Depreciação linear ao longo de 4 anos
export const EV_DEPR_ANNUAL   = 0.38 / 4; // 9,5% ao ano
export const COMB_DEPR_ANNUAL = 0.28 / 4; // 7,0% ao ano

// Alíquota de seguro sobre valor depreciado do veículo
export const EV_INS_RATE   = 0.033; // 3,3% do valor EV/ano
export const COMB_INS_RATE = 0.025; // 2,5% do valor combustão/ano

// Intervalo de revisão em km
export const EV_MAINT_KM   = 20_000; // revisão a cada 20.000 km (EV)
export const COMB_MAINT_KM = 10_000; // revisão a cada 10.000 km (combustão)
export const HYBRID_MAINT_KM = 15_000; // PHEV: meio-termo declarado (motor + elétrico)

// (movido para ./hybridCost — reexportado acima para compatibilidade)

interface TCOCategory {
  maintEVPerService: number;   // R$ por revisão (EV)
  maintCombPerService: number; // R$ por revisão (combustão)
  combKmL: number;             // km/l equivalente combustão (gasolina)
  efficiencyKwh: number;       // kWh/100km
}

// Custos de revisão baseados em planos oficiais BYD e dados de mercado BR 2025.
// EV: BYD Dolphin Mini/Dolphin/Seal/Song; combustão: VW Polo, Jeep Compass, Mercedes Classe C/GLC.
export const TCO_BY_CATEGORY: Record<string, TCOCategory> = {
  Urbano:    { maintEVPerService:  600, maintCombPerService: 1400, combKmL: 12.0, efficiencyKwh: 12 },
  Compacto:  { maintEVPerService:  700, maintCombPerService: 1500, combKmL: 11.0, efficiencyKwh: 14 },
  SUV:       { maintEVPerService: 1200, maintCombPerService: 2800, combKmL: 9.5,  efficiencyKwh: 16 },
  Sedan:     { maintEVPerService:  900, maintCombPerService: 2600, combKmL: 11.0, efficiencyKwh: 14 },
  Luxo:      { maintEVPerService: 2800, maintCombPerService: 5500, combKmL: 8.0,  efficiencyKwh: 21 },
  Comercial: { maintEVPerService: 2000, maintCombPerService: 4500, combKmL: 7.5,  efficiencyKwh: 22 },
};

/** Valor depreciado no início do ano Y (1-based) */
function depreciatedValue(originalPrice: number, annualRate: number, year: number): number {
  return Math.max(0, originalPrice * (1 - annualRate * (year - 1)));
}

export interface TCOYearBreakdown {
  year: number;
  calendarYear: number;
  ipvaEstimate: IpvaEstimate;
  /** Cenário separado do resultado fiscal: teto futuro ainda não confirmado. */
  ipvaProjection: { rate: number; amount: number; assumption: 'continuedEligibility' } | null;
  evValue: number;
  combValue: number;
  energyEV: number;
  energyComb: number;
  insuranceEV: number;
  insuranceComb: number;
  maintEV: number;
  maintComb: number;
  ipvaEV: number | null;
  ipvaComb: number | null;
  totalEV: number;
  totalComb: number;
  savingsEV: number;
}

export interface TCOResult {
  /** Todos os exercícios têm estimativa ou projeção; false pode preservar anos calculáveis. */
  ipvaIncluded: boolean;
  ipvaScenario: boolean;
  ipvaProjected: boolean;
  years: TCOYearBreakdown[];
  totalEV4y: number;
  totalComb4y: number;
  totalSavings4y: number;
  costPerKmEV: number;   // R$/km TCO total
  costPerKmComb: number; // R$/km TCO total
  // Resale analysis
  residualValueEV: number;   // estimated resale value after 4 years (EV)
  residualValueComb: number; // estimated resale value after 4 years (combustion)
  netAdvantageEV: number;    // totalSavings4y − extra depreciation loss; positive = EV wins total
}

export function calcTCO(car: Car, params: TCOParams): TCOResult {
  const cat = TCO_BY_CATEGORY[car.cat] ?? TCO_BY_CATEGORY['Compacto'];
  const startYear = params.startYear ?? IPVA_REFERENCE_YEAR;
  const ipvaEstimates = Array.from({ length: 4 }, (_, i) => resolveIpva(car, params.selectedState, {
    year: startYear + i,
    // Preservar centavos na comparação com o teto: arredondar só o imposto/exibição.
    baseValue: depreciatedValue(car.price, EV_DEPR_ANNUAL, i + 1),
  }));
  // Só projetar continuidade para um modelo já enquadrado pelos dados de referência.
  // Não congelar o teto de 2026, nem inventar enquadramento para modelos pendentes/acima dele.
  const canProjectBenefit = params.projectIpvaBenefit !== false
    && resolveIpva(car, params.selectedState).reason === 'eligible';
  const ipvaScenario = ipvaEstimates.some(estimate => estimate.status === 'conditional');

  const annualKms = params.kms * 12;

  // Energia anual via motor híbrido (BEV/HEV/PHEV): split elétrico + combustível.
  // PHEV usa o modo combinado; overrides manuais respeitados como no simulador.
  const monthly = calcMonthlyCost(car, {
    kms: params.kms,
    blendedKwhPrice: params.blendedKwhPrice,
    fuelPrice: params.gasPrice,
    gasolinePrice: params.gasolinePrice,
    fuelType: params.fuelType,
    categoryKwh100: cat.efficiencyKwh,
    categoryCombKmL: cat.combKmL,
    customKwh100: params.customEvKwh,
    customKmL: params.customCombKmL,
    mode: 'combined',
  });
  const annualEnergyEV = monthly.total * 12;
  const annualEnergyComb = params.kms > 0 ? monthly.comparatorCost * 12 : 0;

  // Manutenção proporcional ao km e intervalo de revisão.
  // HEV segue a tabela combustão; PHEV usa custo de revisão combustão no
  // intervalo híbrido declarado (15.000 km).
  const isHybrid = (car.powertrain ?? 'BEV') !== 'BEV';
  const isPlugIn = hasPlugInRange(car);
  const maintIntervalEV = isPlugIn ? HYBRID_MAINT_KM : isHybrid ? COMB_MAINT_KM : EV_MAINT_KM;
  const maintCostEV = isHybrid ? cat.maintCombPerService : cat.maintEVPerService;
  const annualMaintEV   = Math.round(maintCostEV * annualKms / maintIntervalEV);
  const annualMaintComb = Math.round(cat.maintCombPerService * annualKms / COMB_MAINT_KM);

  const years: TCOYearBreakdown[] = [];

  for (let y = 1; y <= 4; y++) {
    const evValue   = Math.round(depreciatedValue(car.price, EV_DEPR_ANNUAL,   y));
    const combValue = Math.round(depreciatedValue(car.price, COMB_DEPR_ANNUAL, y));

    const insuranceEV   = Math.round(evValue   * EV_INS_RATE);
    const insuranceComb = Math.round(combValue * COMB_INS_RATE);

    const ipvaEstimate = ipvaEstimates[y - 1];
    const ipvaProjection: TCOYearBreakdown['ipvaProjection'] = canProjectBenefit
      && ipvaEstimate.reason === 'futureCeiling' && ipvaEstimate.benefitRate !== null
      ? { rate: ipvaEstimate.benefitRate, amount: Math.round(ipvaEstimate.baseValue * ipvaEstimate.benefitRate), assumption: 'continuedEligibility' }
      : null;
    const ipvaEV = ipvaEstimate.amount ?? ipvaProjection?.amount ?? null;
    const standardRate = ipvaEstimate.standardRate;
    const ipvaComb = ipvaEV !== null && standardRate !== null ? Math.round(combValue * standardRate) : null;

    const totalEV   = annualEnergyEV   + insuranceEV   + annualMaintEV   + (ipvaEV ?? 0);
    const totalComb = annualEnergyComb + insuranceComb + annualMaintComb + (ipvaComb ?? 0);

    years.push({
      year: y, calendarYear: startYear + y - 1, ipvaEstimate, ipvaProjection, evValue, combValue,
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

  // Resale value at END of year 4 (after 4 full years of depreciation)
  const residualValueEV   = Math.round(Math.max(0, car.price * (1 - EV_DEPR_ANNUAL   * 4)));
  const residualValueComb = Math.round(Math.max(0, car.price * (1 - COMB_DEPR_ANNUAL * 4)));
  const totalSavings4y    = totalComb4y - totalEV4y;
  // Net advantage = operating savings minus the extra depreciation loss vs combustion
  const netAdvantageEV = totalSavings4y - (residualValueComb - residualValueEV);

  return {
    // Exercícios sem estimativa nem projeção excluem IPVA dos DOIS lados.
    ipvaIncluded: years.every(year => year.ipvaEV !== null && year.ipvaComb !== null),
    ipvaScenario,
    ipvaProjected: years.some(year => year.ipvaProjection !== null),
    years,
    totalEV4y,
    totalComb4y,
    totalSavings4y,
    costPerKmEV:   totalKms4y > 0 ? totalEV4y   / totalKms4y : 0,
    costPerKmComb: totalKms4y > 0 ? totalComb4y / totalKms4y : 0,
    residualValueEV,
    residualValueComb,
    netAdvantageEV,
  };
}
