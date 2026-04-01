/**
 * Eletropostos individuais — Brasil
 * Fonte: dados públicos dos operadores (sites, apps e press releases) · referência mar/2026
 * Posições aproximadas à área do local declarado pelo operador.
 * Inclui apenas pontos com carga DC disponível (≥ 50 kW).
 */

export type ConnectorType = 'CCS2' | 'CHAdeMO' | 'CCS2+CHAdeMO' | 'CCS2+Type2' | 'Supercharger' | 'GB/T';

export interface Eletroposto {
  id: number;
  nome: string;
  operador: string;
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  potenciaDC: number;   // kW máximo DC
  conector: ConnectorType;
}

export const ELETROPOSTOS: Eletroposto[] = [

  // ═══════════════════════════════════════════════════════════════════════
  // SÃO PAULO — CAPITAL
  // ═══════════════════════════════════════════════════════════════════════
  { id:1,   nome:'Shell Recharge Ipiranga Paulista',      operador:'Shell Recharge',  cidade:'São Paulo',          uf:'SP', lat:-23.5389, lng:-46.6476, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:2,   nome:'Electra Marginal Pinheiros',            operador:'Electra',         cidade:'São Paulo',          uf:'SP', lat:-23.5830, lng:-46.6936, potenciaDC:350, conector:'CCS2' },
  { id:3,   nome:'Tupinambá JK Iguatemi',                 operador:'Tupinambá',       cidade:'São Paulo',          uf:'SP', lat:-23.5950, lng:-46.6860, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:4,   nome:'Shell Recharge Av. Paulista',           operador:'Shell Recharge',  cidade:'São Paulo',          uf:'SP', lat:-23.5631, lng:-46.6541, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:5,   nome:'BYD Store Morumbi',                     operador:'BYD',             cidade:'São Paulo',          uf:'SP', lat:-23.6147, lng:-46.7189, potenciaDC:120, conector:'CCS2' },
  { id:6,   nome:'Electra Berrini',                       operador:'Electra',         cidade:'São Paulo',          uf:'SP', lat:-23.5977, lng:-46.6872, potenciaDC:350, conector:'CCS2' },
  { id:7,   nome:'Tesla Supercharger Rebouças',           operador:'Tesla',           cidade:'São Paulo',          uf:'SP', lat:-23.5589, lng:-46.6644, potenciaDC:250, conector:'Supercharger' },
  { id:8,   nome:'BMW Charging Granja Viana',             operador:'BMW Charging',    cidade:'São Paulo',          uf:'SP', lat:-23.5950, lng:-46.8480, potenciaDC: 50, conector:'CCS2' },
  { id:9,   nome:'Mercedes EQ Charge Morumbi',            operador:'Mercedes EQ',     cidade:'São Paulo',          uf:'SP', lat:-23.6100, lng:-46.7100, potenciaDC:150, conector:'CCS2' },
  { id:10,  nome:'EDP Smart Tatuapé',                     operador:'EDP Smart',       cidade:'São Paulo',          uf:'SP', lat:-23.5430, lng:-46.5775, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:11,  nome:'Be Charge Ibirapuera',                  operador:'Be Charge',       cidade:'São Paulo',          uf:'SP', lat:-23.5877, lng:-46.6566, potenciaDC:120, conector:'CCS2' },
  { id:12,  nome:'Volvo Cars Alphaville SP',              operador:'Volvo Cars',      cidade:'Barueri',            uf:'SP', lat:-23.5072, lng:-46.8490, potenciaDC:150, conector:'CCS2' },
  { id:13,  nome:'ChargeHouse Shopping Eldorado',         operador:'ChargeHouse',     cidade:'São Paulo',          uf:'SP', lat:-23.5966, lng:-46.6958, potenciaDC:120, conector:'CCS2' },
  { id:14,  nome:'CPFL Energia Vila Madalena',            operador:'CPFL Energia',    cidade:'São Paulo',          uf:'SP', lat:-23.5530, lng:-46.6892, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:15,  nome:'Porsche Destination Brooklin',          operador:'Porsche',         cidade:'São Paulo',          uf:'SP', lat:-23.6018, lng:-46.6825, potenciaDC: 50, conector:'CCS2' },
  { id:16,  nome:'WEG Osasco',                            operador:'WEG',             cidade:'Osasco',             uf:'SP', lat:-23.5325, lng:-46.7918, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  // SP Grande São Paulo
  { id:17,  nome:'Shell Recharge Guarulhos Shopping',     operador:'Shell Recharge',  cidade:'Guarulhos',          uf:'SP', lat:-23.4658, lng:-46.5255, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:18,  nome:'Electra ABC Plaza',                     operador:'Electra',         cidade:'Santo André',        uf:'SP', lat:-23.6557, lng:-46.5260, potenciaDC:200, conector:'CCS2' },
  { id:19,  nome:'Tesla Supercharger Osasco',             operador:'Tesla',           cidade:'Osasco',             uf:'SP', lat:-23.5322, lng:-46.7905, potenciaDC:250, conector:'Supercharger' },
  { id:20,  nome:'ChargeHouse Santo André',               operador:'ChargeHouse',     cidade:'Santo André',        uf:'SP', lat:-23.6640, lng:-46.5330, potenciaDC:120, conector:'CCS2' },

  // ═══════════════════════════════════════════════════════════════════════
  // SÃO PAULO — INTERIOR E RODOVIAS
  // ═══════════════════════════════════════════════════════════════════════
  { id:21,  nome:'Shell Recharge Campinas Shopping',      operador:'Shell Recharge',  cidade:'Campinas',           uf:'SP', lat:-22.9035, lng:-47.0537, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:22,  nome:'Tupinambá Iguatemi Campinas',           operador:'Tupinambá',       cidade:'Campinas',           uf:'SP', lat:-22.8963, lng:-47.0620, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:23,  nome:'Volvo Cars Campinas',                   operador:'Volvo Cars',      cidade:'Campinas',           uf:'SP', lat:-22.9090, lng:-47.0680, potenciaDC:150, conector:'CCS2' },
  { id:24,  nome:'CPFL Energia Campinas',                 operador:'CPFL Energia',    cidade:'Campinas',           uf:'SP', lat:-22.9050, lng:-47.0600, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:25,  nome:'BMW Charging Campinas',                 operador:'BMW Charging',    cidade:'Campinas',           uf:'SP', lat:-22.9100, lng:-47.0700, potenciaDC: 50, conector:'CCS2' },
  { id:26,  nome:'Electra Bandeirantes km 100',           operador:'Electra',         cidade:'Jundiaí',            uf:'SP', lat:-23.1855, lng:-46.9150, potenciaDC:350, conector:'CCS2' },
  { id:27,  nome:'Tesla Supercharger Jundiaí',            operador:'Tesla',           cidade:'Jundiaí',            uf:'SP', lat:-23.1862, lng:-46.8932, potenciaDC:250, conector:'Supercharger' },
  { id:28,  nome:'Shell Recharge Ribeirão Preto',         operador:'Shell Recharge',  cidade:'Ribeirão Preto',     uf:'SP', lat:-21.1775, lng:-47.8103, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:29,  nome:'Electra Ribeirão Preto',                operador:'Electra',         cidade:'Ribeirão Preto',     uf:'SP', lat:-21.1800, lng:-47.8050, potenciaDC:350, conector:'CCS2' },
  { id:30,  nome:'BYD Store São José dos Campos',         operador:'BYD',             cidade:'São José dos Campos',uf:'SP', lat:-23.1803, lng:-45.8756, potenciaDC:120, conector:'CCS2' },
  { id:31,  nome:'Electra Dutra São José dos Campos',     operador:'Electra',         cidade:'São José dos Campos',uf:'SP', lat:-23.2100, lng:-45.9000, potenciaDC:350, conector:'CCS2' },
  { id:32,  nome:'Shell Recharge Sorocaba',               operador:'Shell Recharge',  cidade:'Sorocaba',           uf:'SP', lat:-23.5015, lng:-47.4581, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:33,  nome:'Shell Recharge Santos',                 operador:'Shell Recharge',  cidade:'Santos',             uf:'SP', lat:-23.9618, lng:-46.3322, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:34,  nome:'Electra Anchieta Santos',               operador:'Electra',         cidade:'Santos',             uf:'SP', lat:-23.9650, lng:-46.3300, potenciaDC:350, conector:'CCS2' },
  { id:35,  nome:'Shell Recharge Bauru',                  operador:'Shell Recharge',  cidade:'Bauru',              uf:'SP', lat:-22.3154, lng:-49.0609, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:36,  nome:'CPFL Energia São Carlos',               operador:'CPFL Energia',    cidade:'São Carlos',         uf:'SP', lat:-22.0154, lng:-47.8910, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:37,  nome:'Shell Recharge Presidente Prudente',    operador:'Shell Recharge',  cidade:'Presidente Prudente',uf:'SP', lat:-22.1256, lng:-51.3889, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:38,  nome:'Electra Anhanguera km 150',             operador:'Electra',         cidade:'Americana',          uf:'SP', lat:-22.7370, lng:-47.2900, potenciaDC:350, conector:'CCS2' },
  { id:39,  nome:'Electra Anhanguera km 300',             operador:'Electra',         cidade:'Limeira',            uf:'SP', lat:-22.5650, lng:-47.4010, potenciaDC:350, conector:'CCS2' },
  { id:40,  nome:'Shell Recharge Castello Branco km 80',  operador:'Shell Recharge',  cidade:'Itu',                uf:'SP', lat:-23.2644, lng:-47.2993, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:41,  nome:'Electra Régis Bittencourt',             operador:'Electra',         cidade:'Itapecerica da Serra',uf:'SP', lat:-23.7186, lng:-46.8500, potenciaDC:350, conector:'CCS2' },
  { id:42,  nome:'Electra Fernão Dias BR-381 SP',         operador:'Electra',         cidade:'Atibaia',            uf:'SP', lat:-23.1169, lng:-46.5506, potenciaDC:350, conector:'CCS2' },

  // ═══════════════════════════════════════════════════════════════════════
  // RIO DE JANEIRO
  // ═══════════════════════════════════════════════════════════════════════
  { id:43,  nome:'Electra Dutra Volta Redonda',           operador:'Electra',         cidade:'Volta Redonda',      uf:'RJ', lat:-22.5230, lng:-44.0994, potenciaDC:350, conector:'CCS2' },
  { id:44,  nome:'Electra BarraShopping',                 operador:'Electra',         cidade:'Rio de Janeiro',     uf:'RJ', lat:-22.9993, lng:-43.3665, potenciaDC:350, conector:'CCS2' },
  { id:45,  nome:'Tesla Supercharger Niterói',            operador:'Tesla',           cidade:'Niterói',            uf:'RJ', lat:-22.8833, lng:-43.1035, potenciaDC:250, conector:'Supercharger' },
  { id:46,  nome:'Shell Recharge RJ Botafogo',            operador:'Shell Recharge',  cidade:'Rio de Janeiro',     uf:'RJ', lat:-22.9451, lng:-43.1828, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:47,  nome:'Tupinambá Rio Design Leblon',           operador:'Tupinambá',       cidade:'Rio de Janeiro',     uf:'RJ', lat:-22.9848, lng:-43.2192, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:48,  nome:'BYD Store Barra da Tijuca',             operador:'BYD',             cidade:'Rio de Janeiro',     uf:'RJ', lat:-23.0072, lng:-43.3575, potenciaDC:120, conector:'CCS2' },
  { id:49,  nome:'Electra VillageMall',                   operador:'Electra',         cidade:'Rio de Janeiro',     uf:'RJ', lat:-22.9980, lng:-43.3500, potenciaDC:200, conector:'CCS2' },
  { id:50,  nome:'Volvo Cars Rio de Janeiro',             operador:'Volvo Cars',      cidade:'Rio de Janeiro',     uf:'RJ', lat:-22.9764, lng:-43.2140, potenciaDC:150, conector:'CCS2' },
  { id:51,  nome:'Be Charge Shopping Leblon',             operador:'Be Charge',       cidade:'Rio de Janeiro',     uf:'RJ', lat:-22.9836, lng:-43.2235, potenciaDC:120, conector:'CCS2' },
  { id:52,  nome:'EDP Smart RJ Centro',                   operador:'EDP Smart',       cidade:'Rio de Janeiro',     uf:'RJ', lat:-22.9049, lng:-43.1729, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:53,  nome:'BMW Charging Rio de Janeiro',           operador:'BMW Charging',    cidade:'Rio de Janeiro',     uf:'RJ', lat:-22.9500, lng:-43.1900, potenciaDC: 50, conector:'CCS2' },
  { id:54,  nome:'Mercedes EQ Charge Barra',              operador:'Mercedes EQ',     cidade:'Rio de Janeiro',     uf:'RJ', lat:-23.0010, lng:-43.3600, potenciaDC:150, conector:'CCS2' },
  { id:55,  nome:'ChargeHouse Via Parque RJ',             operador:'ChargeHouse',     cidade:'Rio de Janeiro',     uf:'RJ', lat:-22.9880, lng:-43.3640, potenciaDC:120, conector:'CCS2' },
  { id:56,  nome:'Shell Recharge Petrópolis',             operador:'Shell Recharge',  cidade:'Petrópolis',         uf:'RJ', lat:-22.5056, lng:-43.1791, potenciaDC:150, conector:'CCS2+CHAdeMO' },

  // ═══════════════════════════════════════════════════════════════════════
  // MINAS GERAIS
  // ═══════════════════════════════════════════════════════════════════════
  { id:57,  nome:'Electra Diamond Mall BH',               operador:'Electra',         cidade:'Belo Horizonte',     uf:'MG', lat:-19.9277, lng:-43.9345, potenciaDC:350, conector:'CCS2' },
  { id:58,  nome:'Shell Recharge BH Savassi',             operador:'Shell Recharge',  cidade:'Belo Horizonte',     uf:'MG', lat:-19.9370, lng:-43.9331, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:59,  nome:'Tupinambá BH Contagem',                 operador:'Tupinambá',       cidade:'Contagem',           uf:'MG', lat:-19.9322, lng:-44.0534, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:60,  nome:'Tesla Supercharger BH',                 operador:'Tesla',           cidade:'Belo Horizonte',     uf:'MG', lat:-19.9100, lng:-43.9300, potenciaDC:250, conector:'Supercharger' },
  { id:61,  nome:'Shell Recharge Uberlândia',             operador:'Shell Recharge',  cidade:'Uberlândia',         uf:'MG', lat:-18.9113, lng:-48.2758, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:62,  nome:'Volvo Cars BH',                         operador:'Volvo Cars',      cidade:'Belo Horizonte',     uf:'MG', lat:-19.9500, lng:-43.9610, potenciaDC:150, conector:'CCS2' },
  { id:63,  nome:'WEG Contagem',                          operador:'WEG',             cidade:'Contagem',           uf:'MG', lat:-19.9200, lng:-44.0700, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:64,  nome:'BMW Charging BH',                       operador:'BMW Charging',    cidade:'Belo Horizonte',     uf:'MG', lat:-19.9350, lng:-43.9400, potenciaDC: 50, conector:'CCS2' },
  { id:65,  nome:'Electra Fernão Dias BR-381 MG',         operador:'Electra',         cidade:'Betim',              uf:'MG', lat:-19.9680, lng:-44.1980, potenciaDC:350, conector:'CCS2' },
  { id:66,  nome:'Shell Recharge Juiz de Fora',           operador:'Shell Recharge',  cidade:'Juiz de Fora',       uf:'MG', lat:-21.7642, lng:-43.3503, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:67,  nome:'Electra Via Dutra MG',                  operador:'Electra',         cidade:'Juiz de Fora',       uf:'MG', lat:-21.7700, lng:-43.3600, potenciaDC:350, conector:'CCS2' },
  { id:68,  nome:'BYD Store Belo Horizonte',              operador:'BYD',             cidade:'Belo Horizonte',     uf:'MG', lat:-19.9230, lng:-43.9550, potenciaDC:120, conector:'CCS2' },

  // ═══════════════════════════════════════════════════════════════════════
  // PARANÁ
  // ═══════════════════════════════════════════════════════════════════════
  { id:69,  nome:'Electra Palladium Curitiba',            operador:'Electra',         cidade:'Curitiba',           uf:'PR', lat:-25.4288, lng:-49.2733, potenciaDC:350, conector:'CCS2' },
  { id:70,  nome:'Shell Recharge Curitiba Batel',         operador:'Shell Recharge',  cidade:'Curitiba',           uf:'PR', lat:-25.4400, lng:-49.2790, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:71,  nome:'Tupinambá Pátio Batel',                 operador:'Tupinambá',       cidade:'Curitiba',           uf:'PR', lat:-25.4491, lng:-49.2789, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:72,  nome:'BYD Store Curitiba',                    operador:'BYD',             cidade:'Curitiba',           uf:'PR', lat:-25.4180, lng:-49.2658, potenciaDC:120, conector:'CCS2' },
  { id:73,  nome:'Shell Recharge Londrina',               operador:'Shell Recharge',  cidade:'Londrina',           uf:'PR', lat:-23.3045, lng:-51.1696, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:74,  nome:'Electra BR-376 Ponta Grossa',           operador:'Electra',         cidade:'Ponta Grossa',       uf:'PR', lat:-25.0950, lng:-50.1619, potenciaDC:350, conector:'CCS2' },
  { id:75,  nome:'Itaipu Corredor Cascavel',              operador:'Itaipu',          cidade:'Cascavel',           uf:'PR', lat:-24.9578, lng:-53.4595, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:76,  nome:'Itaipu Corredor Guarapuava',            operador:'Itaipu',          cidade:'Guarapuava',         uf:'PR', lat:-25.3954, lng:-51.4629, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:77,  nome:'Itaipu Corredor Foz do Iguaçu',        operador:'Itaipu',          cidade:'Foz do Iguaçu',     uf:'PR', lat:-25.5478, lng:-54.5882, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:78,  nome:'Volvo Cars Curitiba',                   operador:'Volvo Cars',      cidade:'Curitiba',           uf:'PR', lat:-25.4250, lng:-49.2600, potenciaDC:150, conector:'CCS2' },
  { id:79,  nome:'EDP Smart Curitiba',                    operador:'EDP Smart',       cidade:'Curitiba',           uf:'PR', lat:-25.4320, lng:-49.2688, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:80,  nome:'Copel EV Curitiba',                     operador:'Copel EV',        cidade:'Curitiba',           uf:'PR', lat:-25.4200, lng:-49.2650, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:81,  nome:'BMW Charging Curitiba',                 operador:'BMW Charging',    cidade:'Curitiba',           uf:'PR', lat:-25.4350, lng:-49.2720, potenciaDC: 50, conector:'CCS2' },
  { id:82,  nome:'Mercedes EQ Charge Curitiba',           operador:'Mercedes EQ',     cidade:'Curitiba',           uf:'PR', lat:-25.4450, lng:-49.2800, potenciaDC:150, conector:'CCS2' },
  { id:83,  nome:'Shell Recharge Maringá',                operador:'Shell Recharge',  cidade:'Maringá',            uf:'PR', lat:-23.4251, lng:-51.9386, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:84,  nome:'Copel EV Maringá',                      operador:'Copel EV',        cidade:'Maringá',            uf:'PR', lat:-23.4200, lng:-51.9300, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:85,  nome:'Copel EV Londrina',                     operador:'Copel EV',        cidade:'Londrina',           uf:'PR', lat:-23.3100, lng:-51.1600, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:86,  nome:'Electra BR-116 Curitiba Sul',           operador:'Electra',         cidade:'Araucária',          uf:'PR', lat:-25.5932, lng:-49.4056, potenciaDC:350, conector:'CCS2' },

  // ═══════════════════════════════════════════════════════════════════════
  // SANTA CATARINA
  // ═══════════════════════════════════════════════════════════════════════
  { id:87,  nome:'Electra Florianópolis Beiramar',        operador:'Electra',         cidade:'Florianópolis',      uf:'SC', lat:-27.5954, lng:-48.5480, potenciaDC:350, conector:'CCS2' },
  { id:88,  nome:'Shell Recharge Joinville',              operador:'Shell Recharge',  cidade:'Joinville',          uf:'SC', lat:-26.3045, lng:-48.8456, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:89,  nome:'Tupinambá Blumenau Neumarkt',           operador:'Tupinambá',       cidade:'Blumenau',           uf:'SC', lat:-26.9192, lng:-49.0661, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:90,  nome:'Tesla Supercharger Balneário',          operador:'Tesla',           cidade:'Balneário Camboriú', uf:'SC', lat:-26.9884, lng:-48.6348, potenciaDC:250, conector:'Supercharger' },
  { id:91,  nome:'BYD Store Florianópolis',               operador:'BYD',             cidade:'Florianópolis',      uf:'SC', lat:-27.5855, lng:-48.5501, potenciaDC:120, conector:'CCS2' },
  { id:92,  nome:'Volvo Cars Joinville',                  operador:'Volvo Cars',      cidade:'Joinville',          uf:'SC', lat:-26.3100, lng:-48.8500, potenciaDC:150, conector:'CCS2' },
  { id:93,  nome:'WEG Jaraguá do Sul',                    operador:'WEG',             cidade:'Jaraguá do Sul',     uf:'SC', lat:-26.4855, lng:-49.0699, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:94,  nome:'Be Charge Chapecó',                     operador:'Be Charge',       cidade:'Chapecó',            uf:'SC', lat:-27.1007, lng:-52.6157, potenciaDC:120, conector:'CCS2' },
  { id:95,  nome:'Shell Recharge Itajaí',                 operador:'Shell Recharge',  cidade:'Itajaí',             uf:'SC', lat:-26.9077, lng:-48.6614, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:96,  nome:'Electra Criciúma',                      operador:'Electra',         cidade:'Criciúma',           uf:'SC', lat:-28.6780, lng:-49.3697, potenciaDC:200, conector:'CCS2' },
  { id:97,  nome:'ChargeHouse Florianópolis',             operador:'ChargeHouse',     cidade:'Florianópolis',      uf:'SC', lat:-27.5900, lng:-48.5490, potenciaDC:120, conector:'CCS2' },
  { id:98,  nome:'BMW Charging Joinville',                operador:'BMW Charging',    cidade:'Joinville',          uf:'SC', lat:-26.3080, lng:-48.8530, potenciaDC: 50, conector:'CCS2' },

  // ═══════════════════════════════════════════════════════════════════════
  // RIO GRANDE DO SUL
  // ═══════════════════════════════════════════════════════════════════════
  { id:99,  nome:'Electra Barra Shopping Sul POA',        operador:'Electra',         cidade:'Porto Alegre',       uf:'RS', lat:-30.0680, lng:-51.1697, potenciaDC:350, conector:'CCS2' },
  { id:100, nome:'Shell Recharge Porto Alegre',           operador:'Shell Recharge',  cidade:'Porto Alegre',       uf:'RS', lat:-30.0346, lng:-51.2177, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:101, nome:'Tupinambá Caxias do Sul',               operador:'Tupinambá',       cidade:'Caxias do Sul',      uf:'RS', lat:-29.1686, lng:-51.1793, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:102, nome:'Tesla Supercharger Canoas',             operador:'Tesla',           cidade:'Canoas',             uf:'RS', lat:-29.9133, lng:-51.1844, potenciaDC:250, conector:'Supercharger' },
  { id:103, nome:'Shell Recharge Novo Hamburgo',          operador:'Shell Recharge',  cidade:'Novo Hamburgo',      uf:'RS', lat:-29.6783, lng:-51.1306, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:104, nome:'Volvo Cars Porto Alegre',               operador:'Volvo Cars',      cidade:'Porto Alegre',       uf:'RS', lat:-30.0270, lng:-51.2050, potenciaDC:150, conector:'CCS2' },
  { id:105, nome:'WEG Caxias do Sul',                     operador:'WEG',             cidade:'Caxias do Sul',      uf:'RS', lat:-29.1620, lng:-51.1700, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:106, nome:'BMW Charging Porto Alegre',             operador:'BMW Charging',    cidade:'Porto Alegre',       uf:'RS', lat:-30.0320, lng:-51.2100, potenciaDC: 50, conector:'CCS2' },
  { id:107, nome:'Mercedes EQ Charge Porto Alegre',       operador:'Mercedes EQ',     cidade:'Porto Alegre',       uf:'RS', lat:-30.0400, lng:-51.2000, potenciaDC:150, conector:'CCS2' },
  { id:108, nome:'Shell Recharge Santa Maria',            operador:'Shell Recharge',  cidade:'Santa Maria',        uf:'RS', lat:-29.6842, lng:-53.8069, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:109, nome:'Shell Recharge Pelotas',                operador:'Shell Recharge',  cidade:'Pelotas',            uf:'RS', lat:-31.7654, lng:-52.3376, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:110, nome:'ChargeHouse Porto Alegre',              operador:'ChargeHouse',     cidade:'Porto Alegre',       uf:'RS', lat:-30.0500, lng:-51.1900, potenciaDC:120, conector:'CCS2' },

  // ═══════════════════════════════════════════════════════════════════════
  // DISTRITO FEDERAL
  // ═══════════════════════════════════════════════════════════════════════
  { id:111, nome:'Electra Park Shopping DF',              operador:'Electra',         cidade:'Brasília',           uf:'DF', lat:-15.8340, lng:-48.0200, potenciaDC:350, conector:'CCS2' },
  { id:112, nome:'Shell Recharge Brasília Asa Norte',     operador:'Shell Recharge',  cidade:'Brasília',           uf:'DF', lat:-15.7801, lng:-47.8967, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:113, nome:'BYD Store Brasília',                    operador:'BYD',             cidade:'Brasília',           uf:'DF', lat:-15.8267, lng:-47.9218, potenciaDC:120, conector:'CCS2' },
  { id:114, nome:'Tupinambá Pátio Brasil DF',             operador:'Tupinambá',       cidade:'Brasília',           uf:'DF', lat:-15.7943, lng:-47.8831, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:115, nome:'Tesla Supercharger DF',                 operador:'Tesla',           cidade:'Brasília',           uf:'DF', lat:-15.7820, lng:-47.8920, potenciaDC:250, conector:'Supercharger' },
  { id:116, nome:'Volvo Cars Brasília',                   operador:'Volvo Cars',      cidade:'Brasília',           uf:'DF', lat:-15.8100, lng:-47.9150, potenciaDC:150, conector:'CCS2' },
  { id:117, nome:'BMW Charging Brasília',                 operador:'BMW Charging',    cidade:'Brasília',           uf:'DF', lat:-15.8000, lng:-47.9050, potenciaDC: 50, conector:'CCS2' },
  { id:118, nome:'Mercedes EQ Charge Brasília',           operador:'Mercedes EQ',     cidade:'Brasília',           uf:'DF', lat:-15.7900, lng:-47.9100, potenciaDC:150, conector:'CCS2' },
  { id:119, nome:'Neoenergia Brasília',                   operador:'Neoenergia',      cidade:'Brasília',           uf:'DF', lat:-15.8150, lng:-47.9200, potenciaDC:100, conector:'CCS2+CHAdeMO' },

  // ═══════════════════════════════════════════════════════════════════════
  // GOIÁS
  // ═══════════════════════════════════════════════════════════════════════
  { id:120, nome:'Zletric Goiânia Flamboyant',            operador:'Zletric',         cidade:'Goiânia',            uf:'GO', lat:-16.7140, lng:-49.2640, potenciaDC:120, conector:'CCS2+CHAdeMO' },
  { id:121, nome:'Shell Recharge Goiânia',                operador:'Shell Recharge',  cidade:'Goiânia',            uf:'GO', lat:-16.6799, lng:-49.2550, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:122, nome:'Electra BR-060 Anápolis',               operador:'Electra',         cidade:'Anápolis',           uf:'GO', lat:-16.3285, lng:-48.9531, potenciaDC:350, conector:'CCS2' },
  { id:123, nome:'Be Charge Goiânia Shopping',            operador:'Be Charge',       cidade:'Goiânia',            uf:'GO', lat:-16.6900, lng:-49.2580, potenciaDC:120, conector:'CCS2' },
  { id:124, nome:'BYD Store Goiânia',                     operador:'BYD',             cidade:'Goiânia',            uf:'GO', lat:-16.6850, lng:-49.2600, potenciaDC:120, conector:'CCS2' },

  // ═══════════════════════════════════════════════════════════════════════
  // BAHIA
  // ═══════════════════════════════════════════════════════════════════════
  { id:125, nome:'Electra Salvador Shopping',             operador:'Electra',         cidade:'Salvador',           uf:'BA', lat:-12.9935, lng:-38.4717, potenciaDC:200, conector:'CCS2' },
  { id:126, nome:'Shell Recharge Salvador',               operador:'Shell Recharge',  cidade:'Salvador',           uf:'BA', lat:-12.9714, lng:-38.5014, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:127, nome:'BYD Store Salvador',                    operador:'BYD',             cidade:'Salvador',           uf:'BA', lat:-12.9800, lng:-38.4900, potenciaDC:120, conector:'CCS2' },
  { id:128, nome:'Volvo Cars Salvador',                   operador:'Volvo Cars',      cidade:'Salvador',           uf:'BA', lat:-12.9720, lng:-38.4820, potenciaDC:150, conector:'CCS2' },
  { id:129, nome:'Neoenergia Salvador',                   operador:'Neoenergia',      cidade:'Salvador',           uf:'BA', lat:-12.9650, lng:-38.4950, potenciaDC:100, conector:'CCS2+CHAdeMO' },

  // ═══════════════════════════════════════════════════════════════════════
  // CEARÁ / PERNAMBUCO / NORDESTE
  // ═══════════════════════════════════════════════════════════════════════
  { id:130, nome:'Electra North Shopping Fortaleza',      operador:'Electra',         cidade:'Fortaleza',          uf:'CE', lat:-3.7450,  lng:-38.5652, potenciaDC:200, conector:'CCS2' },
  { id:131, nome:'Shell Recharge Fortaleza',              operador:'Shell Recharge',  cidade:'Fortaleza',          uf:'CE', lat:-3.7172,  lng:-38.5433, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:132, nome:'Be Charge Fortaleza Iguatemi',          operador:'Be Charge',       cidade:'Fortaleza',          uf:'CE', lat:-3.7380,  lng:-38.4980, potenciaDC:120, conector:'CCS2' },
  { id:133, nome:'Neoenergia Fortaleza',                  operador:'Neoenergia',      cidade:'Fortaleza',          uf:'CE', lat:-3.7300,  lng:-38.5200, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:134, nome:'Shell Recharge Recife',                 operador:'Shell Recharge',  cidade:'Recife',             uf:'PE', lat:-8.0539,  lng:-34.8811, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:135, nome:'Electra RioMar Recife',                 operador:'Electra',         cidade:'Recife',             uf:'PE', lat:-8.0819,  lng:-34.9135, potenciaDC:200, conector:'CCS2' },
  { id:136, nome:'Neoenergia Recife',                     operador:'Neoenergia',      cidade:'Recife',             uf:'PE', lat:-8.0600,  lng:-34.8900, potenciaDC:100, conector:'CCS2+CHAdeMO' },
  { id:137, nome:'Shell Recharge Natal',                  operador:'Shell Recharge',  cidade:'Natal',              uf:'RN', lat:-5.7945,  lng:-35.2110, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:138, nome:'Shell Recharge Maceió',                 operador:'Shell Recharge',  cidade:'Maceió',             uf:'AL', lat:-9.6660,  lng:-35.7350, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:139, nome:'Shell Recharge João Pessoa',            operador:'Shell Recharge',  cidade:'João Pessoa',        uf:'PB', lat:-7.1195,  lng:-34.8450, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:140, nome:'Shell Recharge Teresina',               operador:'Shell Recharge',  cidade:'Teresina',           uf:'PI', lat:-5.0920,  lng:-42.8034, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:141, nome:'Shell Recharge São Luís',               operador:'Shell Recharge',  cidade:'São Luís',           uf:'MA', lat:-2.5297,  lng:-44.2973, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:142, nome:'Shell Recharge Aracaju',                operador:'Shell Recharge',  cidade:'Aracaju',            uf:'SE', lat:-10.9472, lng:-37.0731, potenciaDC:150, conector:'CCS2+CHAdeMO' },

  // ═══════════════════════════════════════════════════════════════════════
  // ESPÍRITO SANTO
  // ═══════════════════════════════════════════════════════════════════════
  { id:143, nome:'Electra Vitória Shopping',              operador:'Electra',         cidade:'Vitória',            uf:'ES', lat:-20.2976, lng:-40.2958, potenciaDC:200, conector:'CCS2' },
  { id:144, nome:'Shell Recharge Vitória',                operador:'Shell Recharge',  cidade:'Vitória',            uf:'ES', lat:-20.3155, lng:-40.3128, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:145, nome:'EDP Smart Vitória',                     operador:'EDP Smart',       cidade:'Vitória',            uf:'ES', lat:-20.3100, lng:-40.3050, potenciaDC:100, conector:'CCS2+CHAdeMO' },

  // ═══════════════════════════════════════════════════════════════════════
  // CENTRO-OESTE
  // ═══════════════════════════════════════════════════════════════════════
  { id:146, nome:'Shell Recharge Campo Grande',           operador:'Shell Recharge',  cidade:'Campo Grande',       uf:'MS', lat:-20.4697, lng:-54.6201, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:147, nome:'BYD Store Campo Grande',                operador:'BYD',             cidade:'Campo Grande',       uf:'MS', lat:-20.4780, lng:-54.6100, potenciaDC:120, conector:'CCS2' },
  { id:148, nome:'Zletric Campo Grande',                  operador:'Zletric',         cidade:'Campo Grande',       uf:'MS', lat:-20.4820, lng:-54.6050, potenciaDC:120, conector:'CCS2+CHAdeMO' },
  { id:149, nome:'Shell Recharge Cuiabá',                 operador:'Shell Recharge',  cidade:'Cuiabá',             uf:'MT', lat:-15.5961, lng:-56.0967, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:150, nome:'Zletric Cuiabá',                        operador:'Zletric',         cidade:'Cuiabá',             uf:'MT', lat:-15.6000, lng:-56.0900, potenciaDC:120, conector:'CCS2+CHAdeMO' },
  { id:151, nome:'Shell Recharge Porto Velho',            operador:'Shell Recharge',  cidade:'Porto Velho',        uf:'RO', lat:-8.7612,  lng:-63.9004, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:152, nome:'Shell Recharge Palmas',                 operador:'Shell Recharge',  cidade:'Palmas',             uf:'TO', lat:-10.2128, lng:-48.3603, potenciaDC:150, conector:'CCS2+CHAdeMO' },

  // ═══════════════════════════════════════════════════════════════════════
  // NORTE
  // ═══════════════════════════════════════════════════════════════════════
  { id:153, nome:'Shell Recharge Manaus',                 operador:'Shell Recharge',  cidade:'Manaus',             uf:'AM', lat:-3.1190,  lng:-60.0217, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:154, nome:'BYD Store Manaus',                      operador:'BYD',             cidade:'Manaus',             uf:'AM', lat:-3.1021,  lng:-60.0259, potenciaDC:120, conector:'CCS2' },
  { id:155, nome:'Shell Recharge Belém',                  operador:'Shell Recharge',  cidade:'Belém',              uf:'PA', lat:-1.4558,  lng:-48.5044, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:156, nome:'Electra Belém Pátio',                   operador:'Electra',         cidade:'Belém',              uf:'PA', lat:-1.4620,  lng:-48.4980, potenciaDC:200, conector:'CCS2' },
  { id:157, nome:'Shell Recharge Macapá',                 operador:'Shell Recharge',  cidade:'Macapá',             uf:'AP', lat:0.0389,   lng:-51.0664, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:158, nome:'Shell Recharge Boa Vista',              operador:'Shell Recharge',  cidade:'Boa Vista',          uf:'RR', lat:2.8235,   lng:-60.6758, potenciaDC:150, conector:'CCS2+CHAdeMO' },
  { id:159, nome:'Shell Recharge Rio Branco',             operador:'Shell Recharge',  cidade:'Rio Branco',         uf:'AC', lat:-9.9753,  lng:-67.8249, potenciaDC:150, conector:'CCS2+CHAdeMO' },
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
  'Volvo Cars':     '#5b8dd9',
  'WEG':            '#1d9cd5',
  'Be Charge':      '#e84393',
  'EDP Smart':      '#7ec53d',
  'Itaipu':         '#00a878',
  'BMW Charging':   '#0066b1',
  'Mercedes EQ':    '#00adef',
  'CPFL Energia':   '#e8460a',
  'Neoenergia':     '#ff6a00',
  'Copel EV':       '#6d3fa0',
  'ChargeHouse':    '#14b8a6',
  'Porsche':        '#c0a84b',
};

export const DEFAULT_OPERADOR_COLOR = '#888888';

/** Busca o carregador pelo nome + operador no Google Maps (zoom 19 = quarteirão) */
export const gmapsUrl = (lat: number, lng: number, nome: string, operador: string) =>
  `https://www.google.com/maps/search/${encodeURIComponent(operador + ' ' + nome)}/@${lat},${lng},19z`;

/** Abre PlugShare com zoom máximo nas coordenadas do ponto */
export const plugshareUrl = (lat: number, lng: number) =>
  `https://www.plugshare.com/?latitude=${lat}&longitude=${lng}&zoomLevel=19`;
