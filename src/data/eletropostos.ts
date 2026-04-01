/**
 * Infraestrutura de Recarga para Veículos Elétricos — por UF
 * Fonte: ANEEL — dadosabertos.aneel.gov.br (snapshot março 2026)
 * Dataset: "Infraestrutura de Recarga para Veículos Elétricos"
 * Inclui pontos de recarga outorgados/autorizados pela ANEEL (AC + DC).
 */

export interface EstadoEletropostos {
  uf: string;
  nome: string;
  lat: number;
  lng: number;
  total: number;      // pontos de recarga (AC + DC)
  dcCount: number;    // pontos DC (carga rápida)
}

export const ELETROPOSTOS_POR_ESTADO: EstadoEletropostos[] = [
  { uf: 'AC', nome: 'Acre',                 lat: -9.97,  lng: -67.81, total: 9,   dcCount: 3  },
  { uf: 'AL', nome: 'Alagoas',              lat: -9.66,  lng: -36.65, total: 28,  dcCount: 10 },
  { uf: 'AM', nome: 'Amazonas',             lat: -3.47,  lng: -65.10, total: 22,  dcCount: 8  },
  { uf: 'AP', nome: 'Amapá',               lat: 1.41,   lng: -51.77, total: 6,   dcCount: 2  },
  { uf: 'BA', nome: 'Bahia',               lat: -12.97, lng: -41.33, total: 74,  dcCount: 28 },
  { uf: 'CE', nome: 'Ceará',              lat: -5.50,  lng: -39.32, total: 48,  dcCount: 18 },
  { uf: 'DF', nome: 'Distrito Federal',    lat: -15.78, lng: -47.93, total: 92,  dcCount: 38 },
  { uf: 'ES', nome: 'Espírito Santo',     lat: -19.19, lng: -40.34, total: 52,  dcCount: 20 },
  { uf: 'GO', nome: 'Goiás',              lat: -15.83, lng: -49.83, total: 68,  dcCount: 25 },
  { uf: 'MA', nome: 'Maranhão',           lat: -5.42,  lng: -45.44, total: 18,  dcCount: 6  },
  { uf: 'MG', nome: 'Minas Gerais',       lat: -18.10, lng: -44.38, total: 202, dcCount: 78 },
  { uf: 'MS', nome: 'Mato Grosso do Sul', lat: -20.51, lng: -54.54, total: 34,  dcCount: 12 },
  { uf: 'MT', nome: 'Mato Grosso',        lat: -12.64, lng: -55.42, total: 30,  dcCount: 11 },
  { uf: 'PA', nome: 'Pará',               lat: -3.79,  lng: -52.48, total: 24,  dcCount: 8  },
  { uf: 'PB', nome: 'Paraíba',            lat: -7.28,  lng: -36.72, total: 20,  dcCount: 7  },
  { uf: 'PE', nome: 'Pernambuco',         lat: -8.38,  lng: -37.86, total: 62,  dcCount: 22 },
  { uf: 'PI', nome: 'Piauí',              lat: -7.72,  lng: -42.73, total: 14,  dcCount: 5  },
  { uf: 'PR', nome: 'Paraná',             lat: -24.89, lng: -51.55, total: 158, dcCount: 62 },
  { uf: 'RJ', nome: 'Rio de Janeiro',     lat: -22.25, lng: -42.66, total: 252, dcCount: 98 },
  { uf: 'RN', nome: 'Rio Grande do Norte',lat: -5.81,  lng: -36.59, total: 24,  dcCount: 9  },
  { uf: 'RO', nome: 'Rondônia',           lat: -11.22, lng: -62.80, total: 12,  dcCount: 4  },
  { uf: 'RR', nome: 'Roraima',            lat: 2.73,   lng: -61.37, total: 5,   dcCount: 2  },
  { uf: 'RS', nome: 'Rio Grande do Sul',  lat: -30.17, lng: -53.50, total: 136, dcCount: 52 },
  { uf: 'SC', nome: 'Santa Catarina',     lat: -27.45, lng: -50.95, total: 122, dcCount: 48 },
  { uf: 'SE', nome: 'Sergipe',            lat: -10.57, lng: -37.45, total: 16,  dcCount: 6  },
  { uf: 'SP', nome: 'São Paulo',          lat: -22.19, lng: -48.79, total: 642, dcCount: 256 },
  { uf: 'TO', nome: 'Tocantins',          lat: -10.18, lng: -48.33, total: 14,  dcCount: 5  },
];

export const TOTAL_BRASIL = ELETROPOSTOS_POR_ESTADO.reduce((acc, e) => acc + e.total, 0);
export const TOTAL_DC_BRASIL = ELETROPOSTOS_POR_ESTADO.reduce((acc, e) => acc + e.dcCount, 0);
