import type { AnnouncedCar } from '../types';

// Separados do CAR_DB: preço não divulgado nunca vira zero, estimativa ou base de TCO.
// Após oferta oficial, revisar os dados e promover explicitamente ao catálogo com preço.
export const ANNOUNCED_CARS: AnnouncedCar[] = [
  {
    model: 'BAO 3', brand: 'DENZA', cat: 'SUV', powertrain: 'BEV',
    price: null, priceStatus: 'unannounced',
    announcedOn: '2026-11-24', presaleStartsOn: '2026-12-01', reviewedOn: '2026-11-25',
    img: '/car-images/denza-bao-3.jpg',
    url: 'https://www.denza.com/br/denza-bao3.html',
    power: 354, torque: 27.5, traction: 'RWD', battery: 86.3, range: 427,
    supportsDcCharging: true,
    specificationNote: '427 km atribuídos ao PBEV e bateria de 86,3 kWh divulgados à imprensa; ficha e etiqueta brasileiras primárias ainda pendentes. Não representa verificação independente da homologação.',
    features: [
      'SUV 100% elétrico; configuração brasileira com motor traseiro de 354 cv',
      'Bateria Blade 2.0; capacidade de 86,3 kWh e autonomia de 427 km informadas à imprensa',
      'Compatibilidade com Flash Charging; pico AC/DC não confirmado e não inferido da estação',
      'Central multimídia DiLINK de 15,6 polegadas, Apple CarPlay e Android Auto',
      'Sistema de amortecimento inteligente DiSus-C, conforme página oficial brasileira',
      'Preço a divulgar; início da pré-venda previsto para 01/12/2026, sujeito a confirmação',
    ],
    sources: [
      { label: 'Página oficial DENZA Brasil', url: 'https://www.denza.com/br/denza-bao3.html', type: 'official_manufacturer' },
      {
        label: 'g1 — apresentação brasileira, 25/11/2026',
        url: 'https://g1.globo.com/carros/noticia/2026/11/25/denza-bao-3-conheca-o-suv-eletrico-de-mais-de-r-400-mil-que-promete-recarga-em-9-minutos.ghtml',
        type: 'specialist_media',
      },
    ],
  },
];
