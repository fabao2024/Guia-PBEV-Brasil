// Tarifas residenciais B1 (TE + TUSD, sem ICMS, sem bandeira tarifária)
// Fonte: dadosabertos.aneel.gov.br — Tarifas Homologadas Distribuidoras
// Referência: distribuidora principal por estado (maior cobertura populacional)
// Atualizado em: jul/2026

export const ELECTRICITY_PRICES_UPDATED = 'jul/2026';

export const ELECTRICITY_PRICES_BY_STATE: Record<string, number> = {
  AC: 0.87, // Energisa Acre
  AL: 0.81, // Equatorial AL
  AM: 0.84, // Amazonas Energia
  AP: 0.81, // CEA
  BA: 0.87, // Neoenergia Coelba (+3.93% abr/2026)
  CE: 0.74, // Enel CE (+4.30% abr/2026)
  DF: 0.83, // Neoenergia Brasília
  ES: 0.79, // EDP ES
  GO: 0.86, // Equatorial GO + CHESP (média)
  MA: 0.84, // Equatorial MA
  MG: 0.86, // CEMIG-D (~95% do estado)
  MS: 0.98, // Energisa MS (+11.75% abr/2026)
  MT: 0.89, // Energisa MT (+5.27% abr/2026)
  PA: 0.98, // Equatorial PA
  PB: 0.68, // Energisa PB
  PE: 0.77, // Neoenergia PE
  PI: 0.95, // Equatorial PI
  PR: 0.64, // COPEL-DIS (~75% do estado)
  RJ: 0.97, // Enel RJ + Light (média pós-reajuste mar/2026)
  RN: 0.77, // COSERN (+3.74% abr/2026)
  RO: 0.83, // Energisa RO + Eletrobras RO (média)
  RR: 0.97, // Boa Vista Energia (+22,90% jan/2026)
  RS: 0.82, // CEEE-D + RGE (~60% do estado)
  SC: 0.70, // CELESC (~95% do estado)
  SE: 0.74, // Energisa SE + Sulgipe (média, +5% abr/2026)
  SP: 0.77, // Média de 7 distribuidoras (Enel SP +9,02% jul/2026, EDP, CPFL, Elektro…)
  TO: 0.93, // Energisa TO
};

export function getDefaultElectricityPrice(state: string): number {
  return ELECTRICITY_PRICES_BY_STATE[state] ?? ELECTRICITY_PRICES_BY_STATE['SP'];
}
