// Preços médios de revenda por estado — ANP (SHPC), referência: jul de 2026
// Fonte: gov.br/anp · Produto: GASOLINA COMUM e ETANOL HIDRATADO (R$/L)
// Recurso: Julho de 2026
// Atualizado em: 2026-07-31

export const FUEL_PRICES_UPDATED = 'jul de 2026';

export const FUEL_PRICES_BY_STATE: Record<string, { gasoline: number; ethanol: number }> = {
  AC: { gasoline: 7.38, ethanol: 5.16 },
  AL: { gasoline: 6.90, ethanol: 5.15 },
  AM: { gasoline: 7.38, ethanol: 5.12 },
  AP: { gasoline: 6.50, ethanol: 5.83 },
  BA: { gasoline: 7.06, ethanol: 4.87 },
  CE: { gasoline: 6.95, ethanol: 5.22 },
  DF: { gasoline: 6.27, ethanol: 4.00 },
  ES: { gasoline: 6.63, ethanol: 4.74 },
  GO: { gasoline: 6.66, ethanol: 4.15 },
  MA: { gasoline: 6.97, ethanol: 5.31 },
  MG: { gasoline: 6.34, ethanol: 4.11 },
  MS: { gasoline: 6.59, ethanol: 4.03 },
  MT: { gasoline: 6.80, ethanol: 3.75 },
  PA: { gasoline: 6.77, ethanol: 5.02 },
  PB: { gasoline: 6.56, ethanol: 4.83 },
  PE: { gasoline: 6.95, ethanol: 5.14 },
  PI: { gasoline: 6.91, ethanol: 4.93 },
  PR: { gasoline: 6.66, ethanol: 4.21 },
  RJ: { gasoline: 6.72, ethanol: 4.85 },
  RN: { gasoline: 6.89, ethanol: 5.48 },
  RO: { gasoline: 7.36, ethanol: 5.49 },
  RR: { gasoline: 7.57, ethanol: 5.42 },
  RS: { gasoline: 6.31, ethanol: 4.76 },
  SC: { gasoline: 6.51, ethanol: 4.60 },
  SE: { gasoline: 7.11, ethanol: 5.48 },
  SP: { gasoline: 6.44, ethanol: 3.78 },
  TO: { gasoline: 7.07, ethanol: 5.05 },
};

export function getDefaultFuelPrice(state: string, fuelType: 'gasoline' | 'ethanol'): number {
  const prices = FUEL_PRICES_BY_STATE[state] ?? FUEL_PRICES_BY_STATE['SP'];
  return prices[fuelType];
}
