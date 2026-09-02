// Tarifas residenciais B1 (TE + TUSD, sem ICMS, sem bandeira tarifária)
// Fonte: dadosabertos.aneel.gov.br — tarifas-homologadas-distribuidoras-energia-eletrica.csv · recurso fcf2906c-7c32-4b9b-a637-054e7a5234f4
// Referência: distribuidora principal por estado (maior cobertura populacional)
// Atualizado em: 2026-09-01
// Vigência sem registro atual na ANEEL: PB (EPB até 2026-08-27). Valor mantido como último registro publicado; confirmar no próximo ciclo.

export const ELECTRICITY_PRICES_UPDATED = 'set de 2026';

export const ELECTRICITY_PRICES_BY_STATE: Record<string, number> = {
  AC: 0.83, // Energisa Acre
  AL: 0.85, // Equatorial AL
  AM: 0.88, // Amazonas Energia
  AP: 0.83, // CEA
  BA: 0.88, // Neoenergia Coelba (+3.93% abr/2026)
  CE: 0.70, // Enel CE
  DF: 0.83, // Neoenergia Brasília
  ES: 0.84, // EDP ES
  GO: 0.86, // Equatorial GO + CHESP (média)
  MA: 0.89, // Equatorial MA
  MG: 0.90, // CEMIG-D (~95% do estado)
  MS: 0.99, // Energisa MS (+11.75% abr/2026)
  MT: 0.90, // Energisa MT (+5.27% abr/2026)
  PA: 0.98, // Equatorial PA
  PB: 0.68, // Energisa PB
  PE: 0.80, // Neoenergia PE
  PI: 0.95, // Equatorial PI
  PR: 0.77, // COPEL-DIS (~75% do estado)
  RJ: 0.97, // Enel RJ + Light (média pós-reajuste mar/2026)
  RN: 0.78, // COSERN (+3.74% abr/2026)
  RO: 0.76, // Energisa RO
  RR: 0.79, // Boa Vista Energia (+22,90% jan/2026)
  RS: 0.88, // CEEE-D + RGE (~60% do estado)
  SC: 0.76, // CELESC (~95% do estado)
  SE: 0.74, // Energisa SE + Sulgipe (média)
  SP: 0.79, // Média de 7 distribuidoras (Enel SP, EDP, CPFL, Elektro…)
  TO: 0.99, // Energisa TO
};

export function getDefaultElectricityPrice(state: string): number {
  return ELECTRICITY_PRICES_BY_STATE[state] ?? ELECTRICITY_PRICES_BY_STATE['SP'];
}
