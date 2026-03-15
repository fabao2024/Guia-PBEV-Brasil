// Preços médios de revenda por estado — ANP (SHLP), referência: fevereiro/2026
// Fonte: gov.br/anp · Produto: GASOLINA COMUM e ETANOL HIDRATADO (R$/L)
// Atualizado em: 2026-02-01

export const FUEL_PRICES_UPDATED = 'fev/2026';

export const FUEL_PRICES_BY_STATE: Record<string, { gasoline: number; ethanol: number }> = {
  AC: { gasoline: 7.33, ethanol: 5.22 },
  AL: { gasoline: 6.15, ethanol: 4.97 },
  AM: { gasoline: 7.00, ethanol: 5.49 },
  AP: { gasoline: 6.08, ethanol: 5.89 },
  BA: { gasoline: 6.35, ethanol: 4.90 },
  CE: { gasoline: 6.44, ethanol: 5.01 },
  DF: { gasoline: 6.29, ethanol: 4.92 },
  ES: { gasoline: 6.28, ethanol: 4.81 },
  GO: { gasoline: 6.38, ethanol: 5.01 },
  MA: { gasoline: 5.89, ethanol: 4.87 },
  MG: { gasoline: 6.13, ethanol: 4.65 },
  MS: { gasoline: 6.10, ethanol: 4.30 },
  MT: { gasoline: 6.42, ethanol: 4.63 },
  PA: { gasoline: 6.20, ethanol: 4.91 },
  PB: { gasoline: 5.94, ethanol: 4.45 },
  PE: { gasoline: 6.52, ethanol: 5.13 },
  PI: { gasoline: 5.94, ethanol: 4.63 },
  PR: { gasoline: 6.58, ethanol: 4.69 },
  RJ: { gasoline: 6.25, ethanol: 4.97 },
  RN: { gasoline: 6.57, ethanol: 5.43 },
  RO: { gasoline: 6.94, ethanol: 5.48 },
  RR: { gasoline: 6.94, ethanol: 5.29 },
  RS: { gasoline: 6.26, ethanol: 5.04 },
  SC: { gasoline: 6.52, ethanol: 4.94 },
  SE: { gasoline: 6.51, ethanol: 4.87 },
  SP: { gasoline: 6.17, ethanol: 4.46 },
  TO: { gasoline: 6.54, ethanol: 5.28 },
};

export function getDefaultFuelPrice(state: string, fuelType: 'gasoline' | 'ethanol'): number {
  const prices = FUEL_PRICES_BY_STATE[state] ?? FUEL_PRICES_BY_STATE['SP'];
  return prices[fuelType];
}
