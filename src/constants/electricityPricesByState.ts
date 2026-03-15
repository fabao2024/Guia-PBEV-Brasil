// Tarifas residenciais B1 (TE + TUSD, sem ICMS, sem bandeira tarifária)
// Fonte: dadosabertos.aneel.gov.br — Tarifas Homologadas Distribuidoras
// Referência: distribuidora principal por estado (maior cobertura populacional)
// Atualizado em: mar/2026

export const ELECTRICITY_PRICES_UPDATED = 'mar/2026';

export const ELECTRICITY_PRICES_BY_STATE: Record<string, number> = {
  AC: 0.87, // Energisa Acre
  AL: 0.81, // Equatorial AL
  AM: 0.84, // Amazonas Energia
  AP: 0.81, // CEA
  BA: 0.84, // Neoenergia Bahia
  CE: 0.71, // Enel CE
  DF: 0.83, // Neoenergia Brasília
  ES: 0.79, // EDP ES
  GO: 0.86, // Equatorial GO + CHESP (média)
  MA: 0.84, // Equatorial MA
  MG: 0.86, // CEMIG-D (~95% do estado)
  MS: 0.88, // Energisa MS
  MT: 0.85, // Energisa MT
  PA: 0.98, // Equatorial PA
  PB: 0.68, // Energisa PB
  PE: 0.77, // Neoenergia PE
  PI: 0.95, // Equatorial PI
  PR: 0.64, // COPEL-DIS (~75% do estado)
  RJ: 0.97, // Enel RJ + Light (média pós-reajuste mar/2026)
  RN: 0.74, // COSERN
  RO: 0.83, // Energisa RO + Eletrobras RO (média)
  RR: 0.79, // Boa Vista Energia
  RS: 0.82, // CEEE-D + RGE (~60% do estado)
  SC: 0.70, // CELESC (~95% do estado)
  SE: 0.70, // Energisa SE + Sulgipe (média)
  SP: 0.74, // Média de 7 distribuidoras (Eletropaulo, EDP, CPFL, Elektro…)
  TO: 0.93, // Energisa TO
};

export function getDefaultElectricityPrice(state: string): number {
  return ELECTRICITY_PRICES_BY_STATE[state] ?? ELECTRICITY_PRICES_BY_STATE['SP'];
}
