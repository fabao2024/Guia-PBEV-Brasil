/**
 * Eletropostos individuais — Brasil
 * Fonte: dados públicos dos operadores (sites, apps e press releases) · referência mar/2026
 * Posições aproximadas à área do local declarado pelo operador.
 * Inclui apenas pontos com carga DC disponível (≥ 50 kW).
 */

export type ConnectorType = 'CCS2' | 'CHAdeMO' | 'CCS2+CHAdeMO' | 'CCS2+Type2' | 'Supercharger' | 'GB/T';

export interface Eletroposto {
  id: number;
  nome: string;            // nome do ponto / local
  operador: string;        // operador da rede
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  potenciaDC: number;      // kW — potência máxima DC
  conector: ConnectorType;
}

export const ELETROPOSTOS: Eletroposto[] = [
  // ── SÃO PAULO — CAPITAL ─────────────────────────────────────────────────
  { id: 1,  nome: 'Shell Recharge Ipiranga Paulista',    operador: 'Shell Recharge', cidade: 'São Paulo',       uf: 'SP', lat: -23.5389, lng: -46.6476, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 2,  nome: 'Electra Marginal Pinheiros',          operador: 'Electra',        cidade: 'São Paulo',       uf: 'SP', lat: -23.5830, lng: -46.6936, potenciaDC: 350, conector: 'CCS2' },
  { id: 3,  nome: 'Tupinambá JK Iguatemi',               operador: 'Tupinambá',      cidade: 'São Paulo',       uf: 'SP', lat: -23.5950, lng: -46.6860, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 4,  nome: 'Shell Recharge Av. Paulista',         operador: 'Shell Recharge', cidade: 'São Paulo',       uf: 'SP', lat: -23.5631, lng: -46.6541, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 5,  nome: 'BYD Store Morumbi',                   operador: 'BYD',            cidade: 'São Paulo',       uf: 'SP', lat: -23.6147, lng: -46.7189, potenciaDC: 120, conector: 'CCS2' },
  { id: 6,  nome: 'Electra Berrini',                     operador: 'Electra',        cidade: 'São Paulo',       uf: 'SP', lat: -23.5977, lng: -46.6872, potenciaDC: 350, conector: 'CCS2' },
  { id: 7,  nome: 'Tesla Supercharger Rebouças',         operador: 'Tesla',          cidade: 'São Paulo',       uf: 'SP', lat: -23.5589, lng: -46.6644, potenciaDC: 250, conector: 'Supercharger' },
  { id: 8,  nome: 'Shell Recharge Guarulhos Shopping',   operador: 'Shell Recharge', cidade: 'Guarulhos',       uf: 'SP', lat: -23.4658, lng: -46.5255, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 9,  nome: 'Electra ABC Plaza',                   operador: 'Electra',        cidade: 'Santo André',     uf: 'SP', lat: -23.6557, lng: -46.5260, potenciaDC: 200, conector: 'CCS2' },
  { id: 10, nome: 'Shell Recharge Campinas Shopping',    operador: 'Shell Recharge', cidade: 'Campinas',        uf: 'SP', lat: -22.9035, lng: -47.0537, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 11, nome: 'Tupinambá Iguatemi Campinas',         operador: 'Tupinambá',      cidade: 'Campinas',        uf: 'SP', lat: -22.8963, lng: -47.0620, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 12, nome: 'Volvo Cars Campinas',                 operador: 'Volvo Cars',     cidade: 'Campinas',        uf: 'SP', lat: -22.9090, lng: -47.0680, potenciaDC: 150, conector: 'CCS2' },
  { id: 13, nome: 'Shell Recharge Sorocaba',             operador: 'Shell Recharge', cidade: 'Sorocaba',        uf: 'SP', lat: -23.5015, lng: -47.4581, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 14, nome: 'Electra Bandeirantes km 100',         operador: 'Electra',        cidade: 'Jundiaí',         uf: 'SP', lat: -23.1855, lng: -46.9150, potenciaDC: 350, conector: 'CCS2' },
  { id: 15, nome: 'Tesla Supercharger Jundiaí',          operador: 'Tesla',          cidade: 'Jundiaí',         uf: 'SP', lat: -23.1862, lng: -46.8932, potenciaDC: 250, conector: 'Supercharger' },
  { id: 16, nome: 'Shell Recharge Ribeirão Preto',       operador: 'Shell Recharge', cidade: 'Ribeirão Preto',  uf: 'SP', lat: -21.1775, lng: -47.8103, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 17, nome: 'BYD Store São José dos Campos',       operador: 'BYD',            cidade: 'São José dos Campos', uf: 'SP', lat: -23.1803, lng: -45.8756, potenciaDC: 120, conector: 'CCS2' },
  { id: 18, nome: 'Volvo Cars Alphaville SP',            operador: 'Volvo Cars',     cidade: 'Barueri',         uf: 'SP', lat: -23.5072, lng: -46.8490, potenciaDC: 150, conector: 'CCS2' },
  { id: 19, nome: 'WEG Osasco Hub',                      operador: 'WEG',            cidade: 'Osasco',          uf: 'SP', lat: -23.5325, lng: -46.7918, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },
  { id: 20, nome: 'EDP Smart Tatuapé',                   operador: 'EDP Smart',      cidade: 'São Paulo',       uf: 'SP', lat: -23.5430, lng: -46.5775, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },
  { id: 21, nome: 'Be Charge Ibirapuera',                operador: 'Be Charge',      cidade: 'São Paulo',       uf: 'SP', lat: -23.5877, lng: -46.6566, potenciaDC: 120, conector: 'CCS2' },
  { id: 22, nome: 'Electra Dutra Volta Redonda',         operador: 'Electra',        cidade: 'Volta Redonda',   uf: 'RJ', lat: -22.5230, lng: -44.0994, potenciaDC: 350, conector: 'CCS2' },

  // ── RIO DE JANEIRO ──────────────────────────────────────────────────────
  { id: 23, nome: 'Electra BarraShopping',               operador: 'Electra',        cidade: 'Rio de Janeiro',  uf: 'RJ', lat: -22.9993, lng: -43.3665, potenciaDC: 350, conector: 'CCS2' },
  { id: 24, nome: 'Tesla Supercharger Niterói',          operador: 'Tesla',          cidade: 'Niterói',         uf: 'RJ', lat: -22.8833, lng: -43.1035, potenciaDC: 250, conector: 'Supercharger' },
  { id: 25, nome: 'Shell Recharge RJ Botafogo',          operador: 'Shell Recharge', cidade: 'Rio de Janeiro',  uf: 'RJ', lat: -22.9451, lng: -43.1828, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 26, nome: 'Tupinambá Rio Design Leblon',         operador: 'Tupinambá',      cidade: 'Rio de Janeiro',  uf: 'RJ', lat: -22.9848, lng: -43.2192, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 27, nome: 'BYD Store Barra da Tijuca',           operador: 'BYD',            cidade: 'Rio de Janeiro',  uf: 'RJ', lat: -23.0072, lng: -43.3575, potenciaDC: 120, conector: 'CCS2' },
  { id: 28, nome: 'Electra VillageMall',                 operador: 'Electra',        cidade: 'Rio de Janeiro',  uf: 'RJ', lat: -22.9980, lng: -43.3500, potenciaDC: 200, conector: 'CCS2' },
  { id: 29, nome: 'Volvo Cars Rio de Janeiro',           operador: 'Volvo Cars',     cidade: 'Rio de Janeiro',  uf: 'RJ', lat: -22.9764, lng: -43.2140, potenciaDC: 150, conector: 'CCS2' },
  { id: 30, nome: 'Be Charge Shopping Leblon',           operador: 'Be Charge',      cidade: 'Rio de Janeiro',  uf: 'RJ', lat: -22.9836, lng: -43.2235, potenciaDC: 120, conector: 'CCS2' },
  { id: 31, nome: 'EDP Smart RJ Centro',                 operador: 'EDP Smart',      cidade: 'Rio de Janeiro',  uf: 'RJ', lat: -22.9049, lng: -43.1729, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },

  // ── MINAS GERAIS ────────────────────────────────────────────────────────
  { id: 32, nome: 'Electra Diamond Mall BH',             operador: 'Electra',        cidade: 'Belo Horizonte',  uf: 'MG', lat: -19.9277, lng: -43.9345, potenciaDC: 350, conector: 'CCS2' },
  { id: 33, nome: 'Shell Recharge BH Savassi',           operador: 'Shell Recharge', cidade: 'Belo Horizonte',  uf: 'MG', lat: -19.9370, lng: -43.9331, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 34, nome: 'Tupinambá BH Contagem',               operador: 'Tupinambá',      cidade: 'Contagem',        uf: 'MG', lat: -19.9322, lng: -44.0534, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 35, nome: 'Tesla Supercharger BH',               operador: 'Tesla',          cidade: 'Belo Horizonte',  uf: 'MG', lat: -19.9100, lng: -43.9300, potenciaDC: 250, conector: 'Supercharger' },
  { id: 36, nome: 'Shell Recharge Uberlândia',           operador: 'Shell Recharge', cidade: 'Uberlândia',      uf: 'MG', lat: -18.9113, lng: -48.2758, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 37, nome: 'Volvo Cars BH',                       operador: 'Volvo Cars',     cidade: 'Belo Horizonte',  uf: 'MG', lat: -19.9500, lng: -43.9610, potenciaDC: 150, conector: 'CCS2' },
  { id: 38, nome: 'WEG Contagem',                        operador: 'WEG',            cidade: 'Contagem',        uf: 'MG', lat: -19.9200, lng: -44.0700, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },

  // ── PARANÁ ──────────────────────────────────────────────────────────────
  { id: 39, nome: 'Electra Palladium Curitiba',          operador: 'Electra',        cidade: 'Curitiba',        uf: 'PR', lat: -25.4288, lng: -49.2733, potenciaDC: 350, conector: 'CCS2' },
  { id: 40, nome: 'Shell Recharge Curitiba Batel',       operador: 'Shell Recharge', cidade: 'Curitiba',        uf: 'PR', lat: -25.4400, lng: -49.2790, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 41, nome: 'Tupinambá Pátio Batel',               operador: 'Tupinambá',      cidade: 'Curitiba',        uf: 'PR', lat: -25.4491, lng: -49.2789, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 42, nome: 'BYD Store Curitiba',                  operador: 'BYD',            cidade: 'Curitiba',        uf: 'PR', lat: -25.4180, lng: -49.2658, potenciaDC: 120, conector: 'CCS2' },
  { id: 43, nome: 'Shell Recharge Londrina',             operador: 'Shell Recharge', cidade: 'Londrina',        uf: 'PR', lat: -23.3045, lng: -51.1696, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 44, nome: 'Electra BR-376 Ponta Grossa',         operador: 'Electra',        cidade: 'Ponta Grossa',    uf: 'PR', lat: -25.0950, lng: -50.1619, potenciaDC: 350, conector: 'CCS2' },
  { id: 45, nome: 'Itaipu Corredor BR-277 Cascavel',     operador: 'Itaipu',         cidade: 'Cascavel',        uf: 'PR', lat: -24.9578, lng: -53.4595, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },
  { id: 46, nome: 'Itaipu Corredor BR-277 Guarapuava',   operador: 'Itaipu',         cidade: 'Guarapuava',      uf: 'PR', lat: -25.3954, lng: -51.4629, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },
  { id: 47, nome: 'Itaipu Corredor BR-277 Foz',          operador: 'Itaipu',         cidade: 'Foz do Iguaçu',  uf: 'PR', lat: -25.5478, lng: -54.5882, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },
  { id: 48, nome: 'Volvo Cars Curitiba',                 operador: 'Volvo Cars',     cidade: 'Curitiba',        uf: 'PR', lat: -25.4250, lng: -49.2600, potenciaDC: 150, conector: 'CCS2' },
  { id: 49, nome: 'EDP Smart Curitiba',                  operador: 'EDP Smart',      cidade: 'Curitiba',        uf: 'PR', lat: -25.4320, lng: -49.2688, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },

  // ── SANTA CATARINA ───────────────────────────────────────────────────────
  { id: 50, nome: 'Electra Florianópolis Beiramar',      operador: 'Electra',        cidade: 'Florianópolis',   uf: 'SC', lat: -27.5954, lng: -48.5480, potenciaDC: 350, conector: 'CCS2' },
  { id: 51, nome: 'Shell Recharge Joinville',            operador: 'Shell Recharge', cidade: 'Joinville',       uf: 'SC', lat: -26.3045, lng: -48.8456, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 52, nome: 'Tupinambá Blumenau Neumarkt',         operador: 'Tupinambá',      cidade: 'Blumenau',        uf: 'SC', lat: -26.9192, lng: -49.0661, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 53, nome: 'Tesla Supercharger Balneário',        operador: 'Tesla',          cidade: 'Balneário Camboriú', uf: 'SC', lat: -26.9884, lng: -48.6348, potenciaDC: 250, conector: 'Supercharger' },
  { id: 54, nome: 'BYD Store Florianópolis',             operador: 'BYD',            cidade: 'Florianópolis',   uf: 'SC', lat: -27.5855, lng: -48.5501, potenciaDC: 120, conector: 'CCS2' },
  { id: 55, nome: 'Volvo Cars Joinville',                operador: 'Volvo Cars',     cidade: 'Joinville',       uf: 'SC', lat: -26.3100, lng: -48.8500, potenciaDC: 150, conector: 'CCS2' },
  { id: 56, nome: 'WEG Jaraguá do Sul',                  operador: 'WEG',            cidade: 'Jaraguá do Sul',  uf: 'SC', lat: -26.4855, lng: -49.0699, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },
  { id: 57, nome: 'Be Charge Chapecó',                   operador: 'Be Charge',      cidade: 'Chapecó',         uf: 'SC', lat: -27.1007, lng: -52.6157, potenciaDC: 120, conector: 'CCS2' },

  // ── RIO GRANDE DO SUL ────────────────────────────────────────────────────
  { id: 58, nome: 'Electra Barra Shopping Sul POA',      operador: 'Electra',        cidade: 'Porto Alegre',    uf: 'RS', lat: -30.0680, lng: -51.1697, potenciaDC: 350, conector: 'CCS2' },
  { id: 59, nome: 'Shell Recharge Porto Alegre',         operador: 'Shell Recharge', cidade: 'Porto Alegre',    uf: 'RS', lat: -30.0346, lng: -51.2177, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 60, nome: 'Tupinambá Caxias do Sul',             operador: 'Tupinambá',      cidade: 'Caxias do Sul',   uf: 'RS', lat: -29.1686, lng: -51.1793, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 61, nome: 'Tesla Supercharger Canoas',           operador: 'Tesla',          cidade: 'Canoas',          uf: 'RS', lat: -29.9133, lng: -51.1844, potenciaDC: 250, conector: 'Supercharger' },
  { id: 62, nome: 'Shell Recharge Novo Hamburgo',        operador: 'Shell Recharge', cidade: 'Novo Hamburgo',   uf: 'RS', lat: -29.6783, lng: -51.1306, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 63, nome: 'Volvo Cars Porto Alegre',             operador: 'Volvo Cars',     cidade: 'Porto Alegre',    uf: 'RS', lat: -30.0270, lng: -51.2050, potenciaDC: 150, conector: 'CCS2' },
  { id: 64, nome: 'WEG Caxias do Sul',                   operador: 'WEG',            cidade: 'Caxias do Sul',   uf: 'RS', lat: -29.1620, lng: -51.1700, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },

  // ── DISTRITO FEDERAL ─────────────────────────────────────────────────────
  { id: 65, nome: 'Electra Park Shopping DF',            operador: 'Electra',        cidade: 'Brasília',        uf: 'DF', lat: -15.8340, lng: -48.0200, potenciaDC: 350, conector: 'CCS2' },
  { id: 66, nome: 'Shell Recharge Brasília Asa Norte',   operador: 'Shell Recharge', cidade: 'Brasília',        uf: 'DF', lat: -15.7801, lng: -47.8967, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 67, nome: 'BYD Store Brasília',                  operador: 'BYD',            cidade: 'Brasília',        uf: 'DF', lat: -15.8267, lng: -47.9218, potenciaDC: 120, conector: 'CCS2' },
  { id: 68, nome: 'Tupinambá Pátio Brasil DF',           operador: 'Tupinambá',      cidade: 'Brasília',        uf: 'DF', lat: -15.7943, lng: -47.8831, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 69, nome: 'Tesla Supercharger DF',               operador: 'Tesla',          cidade: 'Brasília',        uf: 'DF', lat: -15.7820, lng: -47.8920, potenciaDC: 250, conector: 'Supercharger' },
  { id: 70, nome: 'Volvo Cars Brasília',                 operador: 'Volvo Cars',     cidade: 'Brasília',        uf: 'DF', lat: -15.8100, lng: -47.9150, potenciaDC: 150, conector: 'CCS2' },

  // ── GOIÁS ────────────────────────────────────────────────────────────────
  { id: 71, nome: 'Zletric Goiânia Flamboyant',          operador: 'Zletric',        cidade: 'Goiânia',         uf: 'GO', lat: -16.7140, lng: -49.2640, potenciaDC: 120, conector: 'CCS2+CHAdeMO' },
  { id: 72, nome: 'Shell Recharge Goiânia',              operador: 'Shell Recharge', cidade: 'Goiânia',         uf: 'GO', lat: -16.6799, lng: -49.2550, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 73, nome: 'Electra BR-060 Anápolis',             operador: 'Electra',        cidade: 'Anápolis',        uf: 'GO', lat: -16.3285, lng: -48.9531, potenciaDC: 350, conector: 'CCS2' },
  { id: 74, nome: 'Be Charge Goiânia Shopping',          operador: 'Be Charge',      cidade: 'Goiânia',         uf: 'GO', lat: -16.6900, lng: -49.2580, potenciaDC: 120, conector: 'CCS2' },

  // ── BAHIA ────────────────────────────────────────────────────────────────
  { id: 75, nome: 'Electra Salvador Shopping',           operador: 'Electra',        cidade: 'Salvador',        uf: 'BA', lat: -12.9935, lng: -38.4717, potenciaDC: 200, conector: 'CCS2' },
  { id: 76, nome: 'Shell Recharge Salvador',             operador: 'Shell Recharge', cidade: 'Salvador',        uf: 'BA', lat: -12.9714, lng: -38.5014, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 77, nome: 'BYD Store Salvador',                  operador: 'BYD',            cidade: 'Salvador',        uf: 'BA', lat: -12.9800, lng: -38.4900, potenciaDC: 120, conector: 'CCS2' },
  { id: 78, nome: 'Volvo Cars Salvador',                 operador: 'Volvo Cars',     cidade: 'Salvador',        uf: 'BA', lat: -12.9720, lng: -38.4820, potenciaDC: 150, conector: 'CCS2' },

  // ── CEARÁ / NORDESTE ─────────────────────────────────────────────────────
  { id: 79, nome: 'Electra North Shopping Fortaleza',    operador: 'Electra',        cidade: 'Fortaleza',       uf: 'CE', lat: -3.7450,  lng: -38.5652, potenciaDC: 200, conector: 'CCS2' },
  { id: 80, nome: 'Shell Recharge Fortaleza',            operador: 'Shell Recharge', cidade: 'Fortaleza',       uf: 'CE', lat: -3.7172,  lng: -38.5433, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 81, nome: 'Shell Recharge Recife',               operador: 'Shell Recharge', cidade: 'Recife',          uf: 'PE', lat: -8.0539,  lng: -34.8811, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 82, nome: 'Electra RioMar Recife',               operador: 'Electra',        cidade: 'Recife',          uf: 'PE', lat: -8.0819,  lng: -34.9135, potenciaDC: 200, conector: 'CCS2' },
  { id: 83, nome: 'Be Charge Fortaleza Iguatemi',        operador: 'Be Charge',      cidade: 'Fortaleza',       uf: 'CE', lat: -3.7380,  lng: -38.4980, potenciaDC: 120, conector: 'CCS2' },
  { id: 84, nome: 'Shell Recharge Natal',                operador: 'Shell Recharge', cidade: 'Natal',           uf: 'RN', lat: -5.7945,  lng: -35.2110, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 85, nome: 'Shell Recharge Maceió',               operador: 'Shell Recharge', cidade: 'Maceió',          uf: 'AL', lat: -9.6660,  lng: -35.7350, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },

  // ── ESPÍRITO SANTO ───────────────────────────────────────────────────────
  { id: 86, nome: 'Electra Vitória Shopping',            operador: 'Electra',        cidade: 'Vitória',         uf: 'ES', lat: -20.2976, lng: -40.2958, potenciaDC: 200, conector: 'CCS2' },
  { id: 87, nome: 'Shell Recharge Vitória',              operador: 'Shell Recharge', cidade: 'Vitória',         uf: 'ES', lat: -20.3155, lng: -40.3128, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 88, nome: 'EDP Smart Vitória',                   operador: 'EDP Smart',      cidade: 'Vitória',         uf: 'ES', lat: -20.3100, lng: -40.3050, potenciaDC: 100, conector: 'CCS2+CHAdeMO' },

  // ── MATO GROSSO DO SUL ───────────────────────────────────────────────────
  { id: 89, nome: 'Shell Recharge Campo Grande',         operador: 'Shell Recharge', cidade: 'Campo Grande',    uf: 'MS', lat: -20.4697, lng: -54.6201, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 90, nome: 'BYD Store Campo Grande',              operador: 'BYD',            cidade: 'Campo Grande',    uf: 'MS', lat: -20.4780, lng: -54.6100, potenciaDC: 120, conector: 'CCS2' },
  { id: 91, nome: 'Zletric Campo Grande',                operador: 'Zletric',        cidade: 'Campo Grande',    uf: 'MS', lat: -20.4820, lng: -54.6050, potenciaDC: 120, conector: 'CCS2+CHAdeMO' },

  // ── MATO GROSSO ──────────────────────────────────────────────────────────
  { id: 92, nome: 'Shell Recharge Cuiabá',               operador: 'Shell Recharge', cidade: 'Cuiabá',          uf: 'MT', lat: -15.5961, lng: -56.0967, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 93, nome: 'Zletric Cuiabá',                      operador: 'Zletric',        cidade: 'Cuiabá',          uf: 'MT', lat: -15.6000, lng: -56.0900, potenciaDC: 120, conector: 'CCS2+CHAdeMO' },

  // ── AMAZONAS / PARÁ ─────────────────────────────────────────────────────
  { id: 94, nome: 'Shell Recharge Manaus',               operador: 'Shell Recharge', cidade: 'Manaus',          uf: 'AM', lat: -3.1190,  lng: -60.0217, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 95, nome: 'BYD Store Manaus',                    operador: 'BYD',            cidade: 'Manaus',          uf: 'AM', lat: -3.1021,  lng: -60.0259, potenciaDC: 120, conector: 'CCS2' },
  { id: 96, nome: 'Shell Recharge Belém',                operador: 'Shell Recharge', cidade: 'Belém',           uf: 'PA', lat: -1.4558,  lng: -48.5044, potenciaDC: 150, conector: 'CCS2+CHAdeMO' },
  { id: 97, nome: 'Electra Belém Pátio',                 operador: 'Electra',        cidade: 'Belém',           uf: 'PA', lat: -1.4620,  lng: -48.4980, potenciaDC: 200, conector: 'CCS2' },
];

export const OPERADORES = [...new Set(ELETROPOSTOS.map(e => e.operador))].sort();

/** Cor por operador para o mapa */
export const OPERADOR_COLOR: Record<string, string> = {
  'Shell Recharge': '#ffcc00',
  'Electra':        '#00b4ff',
  'Tupinambá':      '#22c55e',
  'Tesla':          '#ef4444',
  'BYD':            '#a855f7',
  'Zletric':        '#f97316',
  'Volvo Cars':     '#003057',
  'WEG':            '#1d9cd5',
  'Be Charge':      '#e84393',
  'EDP Smart':      '#7ec53d',
  'Itaipu':         '#00a878',
};

export const DEFAULT_OPERADOR_COLOR = '#888888';

/**
 * Busca o carregador pelo nome + operador no Google Maps centrado nas coordenadas.
 * Se a listing existir no Maps, aparece como primeiro resultado.
 * Zoom 19 = quarteirão, praticamente isola o ponto.
 */
export const gmapsUrl = (lat: number, lng: number, nome: string, operador: string) =>
  `https://www.google.com/maps/search/${encodeURIComponent(operador + ' ' + nome)}/@${lat},${lng},19z`;

/**
 * Abre o PlugShare centralizado e com zoom máximo (19) nas coordenadas do ponto.
 * Sem ID interno não é possível abrir a listing direta, mas zoom 19 isola o marcador.
 */
export const plugshareUrl = (lat: number, lng: number) =>
  `https://www.plugshare.com/?latitude=${lat}&longitude=${lng}&zoomLevel=19`;
