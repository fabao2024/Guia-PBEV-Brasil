import { Car } from '../types';
import { IPVA_BY_STATE, calcIpva, STANDARD_COMBUSTION_IPVA_RATE } from '../constants/ipvaByState';

export interface TCOParams {
  kms: number;          // km/month
  gasPrice: number;     // R$/L
  blendedKwhPrice: number; // R$/kWh (blended AC+DC)
  downPaymentPct: number;  // % entrada (0–100)
  loanRateMonthly: number; // % a.m. (ex: 1.49)
  loanMonths: number;      // prazo em meses
  selectedState: string;
}

interface TCOCategory {
  maintEV: number;       // R$/year
  maintComb: number;     // R$/year
  insRateComb: number;   // % of car price/year
  combKmL: number;       // km/l
  efficiencyKwh: number; // kWh/100km
}

export const TCO_BY_CATEGORY: Record<string, TCOCategory> = {
  Urbano:    { maintEV: 600,  maintComb: 2800, insRateComb: 0.035, combKmL: 12.0, efficiencyKwh: 12 },
  Compacto:  { maintEV: 800,  maintComb: 3200, insRateComb: 0.040, combKmL: 11.0, efficiencyKwh: 14 },
  SUV:       { maintEV: 1200, maintComb: 4500, insRateComb: 0.045, combKmL: 9.5,  efficiencyKwh: 16 },
  Sedan:     { maintEV: 1000, maintComb: 3800, insRateComb: 0.040, combKmL: 11.0, efficiencyKwh: 14 },
  Luxo:      { maintEV: 2500, maintComb: 7000, insRateComb: 0.055, combKmL: 8.0,  efficiencyKwh: 21 },
  Comercial: { maintEV: 1800, maintComb: 5500, insRateComb: 0.030, combKmL: 7.5,  efficiencyKwh: 22 },
};

// EV insurance gets 15% discount vs combustion (industry average BR)
const EV_INSURANCE_DISCOUNT = 0.15;

/** PMT formula for fixed-rate loan */
function calcPMT(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months;
  const r = monthlyRate / 100;
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export interface TCOYearBreakdown {
  year: number;
  energyEV: number;
  energyComb: number;
  insuranceEV: number;
  insuranceComb: number;
  maintEV: number;
  maintComb: number;
  ipvaEV: number;
  ipvaComb: number;
  financingEV: number;   // financing cost (juros paid that year)
  totalEV: number;
  totalComb: number;
  savingsEV: number;     // totalComb - totalEV
}

export interface TCOResult {
  years: TCOYearBreakdown[];
  totalEV5y: number;
  totalComb5y: number;
  totalSavings5y: number;
  monthlyPayment: number;
  totalInterestPaid: number;
}

export function calcTCO(car: Car, params: TCOParams): TCOResult {
  const cat = TCO_BY_CATEGORY[car.cat] ?? TCO_BY_CATEGORY['Compacto'];
  const ipvaStateInfo = IPVA_BY_STATE.find(s => s.abbr === params.selectedState) ?? IPVA_BY_STATE.find(s => s.abbr === 'SP')!;

  const annualKms = params.kms * 12;
  const downPayment = car.price * (params.downPaymentPct / 100);
  const principal = car.price - downPayment;
  const monthlyPayment = calcPMT(principal, params.loanRateMonthly, params.loanMonths);
  const totalPaid = monthlyPayment * params.loanMonths;
  const totalInterestPaid = totalPaid - principal;

  // Annual costs — energy
  const annualEnergyEV = Math.round((annualKms / 100) * cat.efficiencyKwh * params.blendedKwhPrice);
  const annualEnergyComb = Math.round((annualKms / cat.combKmL) * params.gasPrice);

  // Annual insurance (on original price — simplified, no depreciation)
  const annualInsuranceComb = Math.round(car.price * cat.insRateComb);
  const annualInsuranceEV = Math.round(annualInsuranceComb * (1 - EV_INSURANCE_DISCOUNT));

  // IPVA
  const annualIpvaEV = calcIpva(car.price, ipvaStateInfo);
  const annualIpvaComb = Math.round(car.price * STANDARD_COMBUSTION_IPVA_RATE);

  const years: TCOYearBreakdown[] = [];
  let cumulativeInterest = 0;

  for (let y = 1; y <= 5; y++) {
    // Financing: calculate interest paid in this year's installments
    const startMonth = (y - 1) * 12 + 1;
    const endMonth = Math.min(y * 12, params.loanMonths);
    let yearInterest = 0;
    let remainingBalance = principal;

    for (let m = 1; m <= Math.min(endMonth, params.loanMonths); m++) {
      const interestPortion = remainingBalance * (params.loanRateMonthly / 100);
      const principalPortion = monthlyPayment - interestPortion;
      if (m >= startMonth) yearInterest += interestPortion;
      remainingBalance -= principalPortion;
      if (remainingBalance < 0) remainingBalance = 0;
    }
    cumulativeInterest += yearInterest;

    // Financing payments this year (capped at loan term)
    const paymentsThisYear = Math.max(0, Math.min(12, params.loanMonths - (y - 1) * 12));
    const financingEV = Math.round(monthlyPayment * paymentsThisYear);

    const totalEV = annualEnergyEV + annualInsuranceEV + cat.maintEV + annualIpvaEV + financingEV;
    const totalComb = annualEnergyComb + annualInsuranceComb + cat.maintComb + annualIpvaComb + financingEV; // same financing for fair comparison

    years.push({
      year: y,
      energyEV: annualEnergyEV,
      energyComb: annualEnergyComb,
      insuranceEV: annualInsuranceEV,
      insuranceComb: annualInsuranceComb,
      maintEV: cat.maintEV,
      maintComb: cat.maintComb,
      ipvaEV: annualIpvaEV,
      ipvaComb: annualIpvaComb,
      financingEV,
      totalEV,
      totalComb,
      savingsEV: totalComb - totalEV,
    });
  }

  const totalEV5y = years.reduce((s, y) => s + y.totalEV, 0);
  const totalComb5y = years.reduce((s, y) => s + y.totalComb, 0);

  return {
    years,
    totalEV5y,
    totalComb5y,
    totalSavings5y: totalComb5y - totalEV5y,
    monthlyPayment: Math.round(monthlyPayment),
    totalInterestPaid: Math.round(totalInterestPaid),
  };
}
