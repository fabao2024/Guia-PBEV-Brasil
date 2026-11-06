export interface IpvaStateInfo {
  name: string;
  abbr: string;
}

// Lista de seleção, NÃO tabela fiscal. Regras auditadas: ../utils/ipva.ts.
// As antigas alíquotas BEV, sem prova de elegibilidade, não devem ser reutilizadas.
export const IPVA_BY_STATE: IpvaStateInfo[] = [
  { abbr: 'AC', name: 'Acre' },
  { abbr: 'AL', name: 'Alagoas' },
  { abbr: 'AM', name: 'Amazonas' },
  { abbr: 'AP', name: 'Amapá' },
  { abbr: 'BA', name: 'Bahia' },
  { abbr: 'CE', name: 'Ceará' },
  { abbr: 'DF', name: 'Distrito Federal' },
  { abbr: 'ES', name: 'Espírito Santo' },
  { abbr: 'GO', name: 'Goiás' },
  { abbr: 'MA', name: 'Maranhão' },
  { abbr: 'MG', name: 'Minas Gerais' },
  { abbr: 'MS', name: 'Mato Grosso do Sul' },
  { abbr: 'MT', name: 'Mato Grosso' },
  { abbr: 'PA', name: 'Pará' },
  { abbr: 'PB', name: 'Paraíba' },
  { abbr: 'PE', name: 'Pernambuco' },
  { abbr: 'PI', name: 'Piauí' },
  { abbr: 'PR', name: 'Paraná' },
  { abbr: 'RJ', name: 'Rio de Janeiro' },
  { abbr: 'RN', name: 'Rio Grande do Norte' },
  { abbr: 'RO', name: 'Rondônia' },
  { abbr: 'RR', name: 'Roraima' },
  { abbr: 'RS', name: 'Rio Grande do Sul' },
  { abbr: 'SC', name: 'Santa Catarina' },
  { abbr: 'SE', name: 'Sergipe' },
  { abbr: 'SP', name: 'São Paulo' },
  { abbr: 'TO', name: 'Tocantins' },
];
