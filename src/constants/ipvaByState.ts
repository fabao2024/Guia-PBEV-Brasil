export interface IpvaStateInfo {
  name: string;
  abbr: string;
  bevRate: number;        // 0–1, e.g. 0.04 = 4%. 0 = full exemption.
  standardRate: number;   // combustion vehicle rate for this state
  condition: string | null;
  exemptionThreshold?: number; // max car price (BRL) for exemption to apply
}

export const IPVA_BY_STATE: IpvaStateInfo[] = [
  { abbr: 'AC', name: 'Acre',                  bevRate: 0,     standardRate: 0.02,  condition: null },
  { abbr: 'AL', name: 'Alagoas',               bevRate: 0,     standardRate: 0.03,  condition: 'Apenas veículos 0 km' },
  { abbr: 'AM', name: 'Amazonas',              bevRate: 0.015, standardRate: 0.03,  condition: '50% de desconto por 5 anos' },
  { abbr: 'AP', name: 'Amapá',                 bevRate: 0,     standardRate: 0.03,  condition: 'Isenção no 1º ano' },
  { abbr: 'BA', name: 'Bahia',                 bevRate: 0,     standardRate: 0.025, condition: null, exemptionThreshold: 300000 },
  { abbr: 'CE', name: 'Ceará',                 bevRate: 0.03,  standardRate: 0.03,  condition: null },
  { abbr: 'DF', name: 'Distrito Federal',      bevRate: 0,     standardRate: 0.035, condition: null },
  { abbr: 'ES', name: 'Espírito Santo',        bevRate: 0.02,  standardRate: 0.02,  condition: null },
  { abbr: 'GO', name: 'Goiás',                 bevRate: 0.03,  standardRate: 0.0375,condition: null },
  { abbr: 'MA', name: 'Maranhão',              bevRate: 0,     standardRate: 0.03,  condition: null },
  { abbr: 'MG', name: 'Minas Gerais',          bevRate: 0,     standardRate: 0.04,  condition: 'Apenas fabricados em MG' },
  { abbr: 'MS', name: 'Mato Grosso do Sul',    bevRate: 0,     standardRate: 0.03,  condition: 'Isenção no 1º ano; 70% desc. após' },
  { abbr: 'MT', name: 'Mato Grosso',           bevRate: 0.03,  standardRate: 0.03,  condition: null },
  { abbr: 'PA', name: 'Pará',                  bevRate: 0,     standardRate: 0.025, condition: null, exemptionThreshold: 150000 },
  { abbr: 'PB', name: 'Paraíba',               bevRate: 0,     standardRate: 0.025, condition: null },
  { abbr: 'PE', name: 'Pernambuco',            bevRate: 0,     standardRate: 0.024, condition: null },
  { abbr: 'PI', name: 'Piauí',                 bevRate: 0.01,  standardRate: 0.03,  condition: null },
  { abbr: 'PR', name: 'Paraná',                bevRate: 0.019, standardRate: 0.019, condition: null },
  { abbr: 'RJ', name: 'Rio de Janeiro',        bevRate: 0.005, standardRate: 0.04,  condition: null },
  { abbr: 'RN', name: 'Rio Grande do Norte',   bevRate: 0,     standardRate: 0.03,  condition: null },
  { abbr: 'RO', name: 'Rondônia',              bevRate: 0.03,  standardRate: 0.03,  condition: null },
  { abbr: 'RR', name: 'Roraima',               bevRate: 0.03,  standardRate: 0.03,  condition: null },
  { abbr: 'RS', name: 'Rio Grande do Sul',     bevRate: 0,     standardRate: 0.03,  condition: null },
  { abbr: 'SC', name: 'Santa Catarina',        bevRate: 0.03,  standardRate: 0.02,  condition: null },
  { abbr: 'SE', name: 'Sergipe',               bevRate: 0,     standardRate: 0.03,  condition: null },
  { abbr: 'SP', name: 'São Paulo',             bevRate: 0.04,  standardRate: 0.04,  condition: null },
  { abbr: 'TO', name: 'Tocantins',             bevRate: 0,     standardRate: 0.02,  condition: null },
];

export const STANDARD_COMBUSTION_IPVA_RATE = 0.04; // SP worst-case, used as comparison baseline
export const IPVA_DATA_UPDATED = 'março/2026';

export function calcIpva(price: number, state: IpvaStateInfo): number {
  if (state.exemptionThreshold !== undefined && price > state.exemptionThreshold) {
    return Math.round(price * state.standardRate);
  }
  return Math.round(price * state.bevRate);
}
