import { Car } from '../types';
import { IPVA_BY_STATE, calcIpva, STANDARD_COMBUSTION_IPVA_RATE } from '../constants/ipvaByState';

export interface TCOParams {
  kms: number;             // km/month
  gasPrice: number;        // R$/L
  blendedKwhPrice: number; // R$/kWh (blended AC+DC)
  downPaymentPct: number;  // % entrada (0–100)
  loanRateMonthly: number; // % a.m. (ex: 1.49)
  loanMonths: number;      // prazo em meses
  selectedState: string;
}

// Depreciação linear ao longo de 4 anos
const EV_DEPR_ANNUAL   = 0.38 / 4; // 9,5% ao ano
const COMB_DEPR_ANNUAL = 0.28 / 4; // 7,0% ao ano

// Alíquota de seguro sobre valor depreciado do veículo
const EV_INS_RATE   = 0.033; // 3,3% do valor EV/ano
const COMB_INS_RATE = 0.025; // 2,5% do valor combustão/ano

interface TCOCategory {
  maintEV: number;       // R$/ano
  maintComb: number;     // R$/ano
  combKmL: number;       // km/l
  efficiencyKwh: number; // kWh/100km
}

export const TCO_BY_CATEGORY: Record<string, TCOCategory> = {
  Urbano:    { maintEV: 600,  maintComb: 2800, combKmL: 12.0, efficiencyKwh: 12 },
  Compacto:  { maintEV: 800,  maintComb: 3200, combKmL: 11.0, efficiencyKwh: 14 },
  SUV:       { maintEV: 1200, maintComb: 4500, combKmL: 9.5,  efficiencyKwh: 16 },
  Sedan:     { maintEV: 1000, maintComb: 3800, combKmL: 11.0, efficiencyKwh: 14 },
  Luxo:      { maintEV: 2500, maintComb: 7000, combKmL: 8.0,  efficiencyKwh: 21 },
  Comercial: { maintEV: 1800, maintComb: 5500, combKmL: 7.5,  efficiencyKwh: 22 },
};

/** PMT — amortização francesa (juros compostos) */
function calcPMT(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months;
  const r = monthlyRate / 100;
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/** Valor depreciado no início do ano Y (1-based) */
function depreciatedValue(originalPrice: number, annualRate: number, year: number): number {
  return Math.max(0, originalPrice * (1 - annualRate * (year - 1)));
}

export interface TCOYearBreakdown {
  year: number;
  evValue: number;       // valor depreciado do EV nesse ano
  combValue: number;     // valor depreciado do combustão nesse ano
  energyEV: number;
  energyComb: number;
  insuranceEV: number;
  insuranceComb: number;
  maintEV: number;
  maintComb: number;
  ipvaEV: number;
  ipvaComb: number;
  financingAnnual: number; // parcelas pagas nesse ano (igual para ambos)
  totalEV: number;
  totalComb: number;
  savingsEV: number;
}

export interface TCOResult {
  years: TCOYearBreakdown[];
  totalEV4y: number;
  totalComb4y: number;
  totalSavings4y: number;
  monthlyPayment: number;
  totalInterestPaid: number;
}

export function calcTCO(car: Car, params: TCOParams): TCOResult {
  const cat = TCO_BY_CATEGORY[car.cat] ?? TCO_BY_CATEGORY['Compacto'];
  const ipvaStateInfo = IPVA_BY_STATE.find(s => s.abbr === params.selectedState)
    ?? IPVA_BY_STATE.find(s => s.abbr === 'SP')!;

  const annualKms = params.kms * 12;
  const downPayment = car.price * (params.downPaymentPct / 100);
  const principal = car.price - downPayment;
  const monthlyPayment = calcPMT(principal, params.loanRateMonthly, params.loanMonths);
  const totalInterestPaid = monthlyPayment * params.loanMonths - principal;

  // Energia anual — não varia com o tempo
  const annualEnergyEV   = Math.round((annualKms / 100) * cat.efficiencyKwh * params.blendedKwhPrice);
  const annualEnergyComb = Math.round((annualKms / cat.combKmL) * params.gasPrice);

  const years: TCOYearBreakdown[] = [];

  for (let y = 1; y <= 4; y++) {
    // Valor depreciado no início do ano
    const evValue   = Math.round(depreciatedValue(car.price, EV_DEPR_ANNUAL,   y));
    const combValue = Math.round(depreciatedValue(car.price, COMB_DEPR_ANNUAL, y));

    // Seguro sobre valor depreciado
    const insuranceEV   = Math.round(evValue   * EV_INS_RATE);
    const insuranceComb = Math.round(combValue * COMB_INS_RATE);

    // IPVA sobre valor depreciado
    const ipvaEV   = calcIpva(evValue, ipvaStateInfo);
    const ipvaComb = Math.round(combValue * STANDARD_COMBUSTION_IPVA_RATE);

    // Financiamento — parcelas desse ano
    const paymentsThisYear = Math.max(0, Math.min(12, params.loanMonths - (y - 1) * 12));
    const financingAnnual  = Math.round(monthlyPayment * paymentsThisYear);

    const totalEV   = annualEnergyEV   + insuranceEV   + cat.maintEV   + ipvaEV   + financingAnnual;
    const totalComb = annualEnergyComb + insuranceComb + cat.maintComb + ipvaComb + financingAnnual;

    years.push({
      year: y, evValue, combValue,
      energyEV: annualEnergyEV, energyComb: annualEnergyComb,
      insuranceEV, insuranceComb,
      maintEV: cat.maintEV, maintComb: cat.maintComb,
      ipvaEV, ipvaComb,
      financingAnnual,
      totalEV, totalComb,
      savingsEV: totalComb - totalEV,
    });
  }

  const totalEV4y   = years.reduce((s, y) => s + y.totalEV,   0);
  const totalComb4y = years.reduce((s, y) => s + y.totalComb, 0);

  return {
    years,
    totalEV4y,
    totalComb4y,
    totalSavings4y: totalComb4y - totalEV4y,
    monthlyPayment: Math.round(monthlyPayment),
    totalInterestPaid: Math.round(totalInterestPaid),
  };
}
