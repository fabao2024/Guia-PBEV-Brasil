
import { Car } from './types';

export const BRAND_URLS: Record<string, string> = {
  "Renault": "https://www.renault.com.br",
  "CAOA Chery": "https://caoachery.com.br",
  "JAC": "https://jacmotors.com.br",
  "BYD": "https://www.byd.com/br",
  "Geely": "https://global.geely.com",
  "Neta": "https://www.netaauto.com.br",
  "GWM": "https://www.gwmmotors.com.br",
  "Chevrolet": "https://www.chevrolet.com.br",
  "Fiat": "https://www.fiat.com.br",
  "Peugeot": "https://cars.peugeot.com.br",
  "Mini": "https://www.mini.com.br",
  "Citroen": "https://www.citroen.com.br",
  "Nissan": "https://www.nissan.com.br",
  "GAC": "https://www.gac-motor.com",
  "Omoda": "https://omoda.com.br",
  "Hyundai": "https://www.hyundai.com.br",
  "Volvo": "https://www.volvocars.com/br",
  "BMW": "https://www.bmw.com.br",
  "Kia": "https://www.kia.com.br",
  "Mercedes-Benz": "https://www.mercedes-benz.com.br",
  "Zeekr": "https://zeekr.com.br",
  "Ford": "https://www.ford.com.br",
  "Porsche": "https://www.porsche.com/brazil/pt",
  "Audi": "https://www.audi.com.br",
  "Volkswagen": "https://www.vw.com.br",
  "MG Motor": "https://mgmotoroficial.com.br",
  "Leapmotor": "https://www.leapmotor.com.br"
};

// Image Strategy:
// 1. Use specific harvested Unsplash IDs for key brands where available.
// 2. Map remaining brands to a curated list of high-quality generic EV images to ensure consistency.
const SPECIFIC_IMAGES: Record<string, string> = {
  "Mercedes-Benz": "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80", // Mercedes EQ specific
  "Audi": "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=800&q=80", // Audi e-tron specific
  "Volkswagen": "https://images.unsplash.com/photo-1621360841013-c768371e93cf?auto=format&fit=crop&w=800&q=80", // VW ID specific
  "CAOA Chery": "https://images.unsplash.com/photo-1669225386007-84687d7b5f2c?auto=format&fit=crop&w=800&q=80", // Tiggo placeholder (high value SUV)
  "Ford": "https://images.unsplash.com/photo-1696520330349-80862d8540fb?auto=format&fit=crop&w=800&q=80", // Mach-E style
  "Volvo": "https://images.unsplash.com/photo-1628186414902-690a6e340b04?auto=format&fit=crop&w=800&q=80", // Volvo specific
  "BMW": "https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&w=800&q=80", // BMW i3/i8 style
  "Porsche": "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=800&q=80", // Porsche Taycan style
  "BYD": "https://images.unsplash.com/photo-1678122393858-450b2964b73e?auto=format&fit=crop&w=800&q=80", // Modern EV (BYD style)
  "Tesla": "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80" // Tesla (extra if needed)
};

const GENERIC_EV_IMAGES = [
  "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?auto=format&fit=crop&w=800&q=80", // 0: White Hatch
  "https://images.unsplash.com/photo-1594535182308-8ffefbb661e1?auto=format&fit=crop&w=800&q=80", // 1: Blue Sedan
  "https://images.unsplash.com/photo-1607197109166-3ab4ee4b468f?auto=format&fit=crop&w=800&q=80", // 2: Charging
  "https://images.unsplash.com/photo-1607171028974-319ba56cb013?auto=format&fit=crop&w=800&q=80", // 3: Front Grille
  "https://images.unsplash.com/photo-1567409378873-888d6fa7debc?auto=format&fit=crop&w=800&q=80", // 4: Yellow/Green?
  "https://images.unsplash.com/photo-1615901555268-839b7a1ede54?auto=format&fit=crop&w=800&q=80", // 5: Modern White
  "https://images.unsplash.com/photo-1615829386703-e2bb66a7cb7d?auto=format&fit=crop&w=800&q=80", // 6: Black SUV
  "https://images.unsplash.com/photo-1623572435912-9940866dca4e?auto=format&fit=crop&w=800&q=80", // 7: Interior/Dash
  "https://images.unsplash.com/photo-1624633022679-f790cc44a517?auto=format&fit=crop&w=800&q=80", // 8: Charging Close
  "https://images.unsplash.com/photo-1630716059383-b3203bdda1e4?auto=format&fit=crop&w=800&q=80", // 9: Red Car
  "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80", // 10: Silver Sedan
  "https://images.unsplash.com/photo-1619383579442-90669ced4a0f?auto=format&fit=crop&w=800&q=80"  // 11: Orange/Sporty
];

// Map brands to specific images or a stable generic index
const BRAND_IMG_MAP: Record<string, string | number> = {
  "Renault": 0, // White Hatch
  "JAC": 2,
  "Geely": 4,
  "Neta": 5,
  "GWM": 6,
  "Chevrolet": 10,
  "Fiat": 9,
  "Peugeot": 11,
  "Mini": 1,
  "Citroen": 0,
  "Nissan": 1,
  "GAC": 3,
  "Omoda": 5,
  "Hyundai": 10,
  "Kia": 11,
  "Zeekr": 4,
  "BYD": "https://images.unsplash.com/photo-1678122393858-450b2964b73e?auto=format&fit=crop&w=800&q=80", // Specific BYD style
  // Specifics override generic indices
  ...SPECIFIC_IMAGES
};

const getBrandImage = (brand: string): string => {
  const mapped = BRAND_IMG_MAP[brand];
  if (typeof mapped === 'string') return mapped;
  if (typeof mapped === 'number') return GENERIC_EV_IMAGES[mapped % GENERIC_EV_IMAGES.length];
  // Fallback for unknown brands
  return GENERIC_EV_IMAGES[Math.abs(brand.charCodeAt(0)) % GENERIC_EV_IMAGES.length];
};

export const CAR_DB: Car[] = [
  // 1. COMPACTOS & HATCHES
  {
    model: "Kwid E-Tech", brand: "Renault", price: 99990, range: 185, cat: "Compacto",
    img: "/car-images/renault-kwid-e-tech-2026-diagonal-dianteira.avif",
    power: 65, torque: 11.5, traction: 'FWD', battery: 26.8,
    features: [
      "Bateria LFP 26,8 kWh (longa durabilidade)",
      "Carregamento AC 7 kW / DC 30 kW",
      "Central multimídia 8\" com CarPlay e Android Auto",
      "6 airbags",
      "Frenagem autônoma de emergência (AEB)",
      "Câmera de ré",
      "Ar-condicionado automático",
      "Montagem nacional (São José dos Pinhais - PR)"
    ]
  },
  {
    model: "iCar EQ", brand: "CAOA Chery", price: 119990, range: 197, cat: "Compacto",
    img: "/car-images/chery-icar.webp",
    power: 61, torque: 15.3, traction: 'RWD', battery: 30.8,
    features: [
      "Bateria LFP 30,8 kWh",
      "Carregamento AC 6,6 kW / DC 50 kW",
      "Tela central 12,3\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: AEB + alerta de saída de faixa (LDW)",
      "Câmera de ré",
      "Design retro-futurista inspirado em off-road",
      "Sensores de estacionamento dianteiros e traseiros"
    ]
  },
  {
    model: "E-JS1", brand: "JAC", price: 119900, range: 181, cat: "Compacto",
    img: "/car-images/e-js1.png",
    power: 62, torque: 15.3, traction: 'FWD', battery: 30.2,
    features: [
      "Bateria LFP 30,2 kWh",
      "Carregamento AC 6,6 kW / DC 40 kW",
      "Tela central 10,1\" com CarPlay e Android Auto",
      "6 airbags",
      "Câmera de ré",
      "Sensores de estacionamento",
      "Partida sem chave (keyless entry)",
      "Ar-condicionado automático"
    ]
  },
  {
    model: "Dolphin Mini", brand: "BYD", price: 119990, range: 280, cat: "Compacto",
    img: "/car-images/Dolphin-mini.png",
    power: 75, torque: 13.8, traction: 'FWD', battery: 38,
    features: [
      "Bateria LFP Blade 38 kWh (segurança superior a NMC)",
      "Carregamento AC 6,6 kW / DC 30 kW",
      "Tela 10,1\" com BYD DiLink (CarPlay e Android Auto)",
      "6 airbags",
      "ADAS básico: AEB + alerta de colisão frontal",
      "Câmera de ré",
      "Controle de cruzeiro adaptativo (ACC)",
      "Atualização de software OTA"
    ]
  },
  {
    model: "EX2 Max", brand: "Geely", price: 135100, range: 289, cat: "Compacto",
    img: "/car-images/geely-ex2-max.jpg",
    power: 116, torque: 15.3, traction: 'FWD', battery: 41,
    features: [
      "Bateria NMC 41 kWh",
      "Carregamento AC 7 kW / DC 50 kW",
      "Tela central 10,25\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: ACC + AEB + alerta de saída de faixa",
      "Câmera de ré",
      "Sensores de estacionamento dianteiros e traseiros",
      "Faróis LED full"
    ]
  },
  {
    model: "Aya Luxury", brand: "Neta", price: 149900, range: 263, cat: "Compacto",
    img: "/car-images/neta-aya.avif",
    power: 95, torque: 15.3, traction: 'FWD', battery: 40.7,
    features: [
      "Bateria NMC 40,7 kWh",
      "Carregamento AC 6,6 kW / DC 80 kW",
      "Tela central 12,3\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 1: ACC + AEB + alerta de saída de faixa (LDW)",
      "Câmera 360° (surround view)",
      "Teto solar panorâmico",
      "Sensores de estacionamento"
    ]
  },
  {
    model: "Ora 03 Skin BEV48", brand: "GWM", price: 154000, range: 232, cat: "Compacto",
    img: "/car-images/ora 03 skin bev48.webp",
    power: 171, torque: 25.5, traction: 'FWD', battery: 48,
    features: [
      "Bateria LFP 48 kWh",
      "Carregamento AC 6,6 kW / DC 80 kW",
      "Tela central 12,3\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: ACC com Stop&Go + AEB",
      "Câmera de ré",
      "Design retrô estilo vintage",
      "Ar-condicionado automático bizona"
    ]
  },
  {
    model: "Ora 03 Skin BEV58", brand: "GWM", price: 169000, range: 315, cat: "Compacto",
    img: "/car-images/ora 03 skin bev58.webp",
    power: 171, torque: 25.5, traction: 'FWD', battery: 63,
    features: [
      "Bateria LFP 63 kWh (maior autonomia da linha Skin)",
      "Carregamento AC 11 kW / DC 80 kW",
      "Tela central 12,3\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: ACC + AEB + alerta de ponto cego (BSM)",
      "Câmera 360°",
      "Teto solar panorâmico",
      "Design retrô com acabamento premium"
    ]
  },
  {
    model: "Ora 03 GT BEV63", brand: "GWM", price: 189000, range: 295, cat: "Compacto",
    img: "/car-images/ora 03 GT BEV63.webp",
    power: 171, torque: 25.5, traction: 'FWD', battery: 63,
    features: [
      "Bateria LFP 63 kWh",
      "Carregamento AC 11 kW / DC 80 kW",
      "Tela central 12,3\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2: ACC + manutenção de faixa (LCC) + AEB + BSM",
      "Câmera 360° surround view",
      "Bancos aquecidos",
      "Design esportivo GT com difusor traseiro"
    ]
  },
  {
    model: "Spark EUV", brand: "Chevrolet", price: 159990, range: 258, cat: "Compacto",
    img: "/car-images/Spark EUV.avif",
    power: 102, torque: 18.4, traction: 'FWD', battery: 65,
    features: [
      "Bateria 65 kWh",
      "Carregamento AC 11 kW / DC 80 kW",
      "Tela Infotainment 10,2\" com CarPlay sem fio e Android Auto",
      "6 airbags",
      "Super Cruise: piloto automático mãos livres em rodovias mapeadas",
      "ADAS: ACC + LCC + AEB + câmera de ré HD",
      "OnStar conectado (telemetria e assistência remota)",
      "Atualização de software OTA"
    ]
  },
  {
    model: "Dolphin GS", brand: "BYD", price: 149990, range: 291, cat: "Compacto",
    img: "/car-images/dolphin-gs.jpg",
    power: 95, torque: 18.3, traction: 'FWD', battery: 44.9,
    features: [
      "Bateria LFP Blade 44,9 kWh",
      "Carregamento AC 7 kW / DC 60 kW",
      "Tela 12,8\" rotativa com BYD DiLink 4.0 (CarPlay e Android Auto)",
      "6 airbags",
      "DiPilot: ACC + AEB + manutenção de faixa (LKA)",
      "Câmera de ré",
      "Faróis LED full com DRL",
      "Atualização OTA"
    ]
  },
  {
    model: "500e Icon", brand: "Fiat", price: 214990, range: 227, cat: "Compacto",
    img: "/car-images/500e.webp",
    power: 118, torque: 22.4, traction: 'FWD', battery: 42,
    features: [
      "Bateria NMC 42 kWh",
      "Carregamento AC 11 kW / DC 85 kW",
      "Tela central 10,25\" com CarPlay e Android Auto",
      "7 airbags",
      "ADAS Nível 2: ACC + manutenção de faixa (LKA) + AEB",
      "Câmera 360° surround view",
      "Design icônico italiano (Fiat 500 clássico releitura EV)",
      "Teto de lona disponível (Cabrio)"
    ]
  },
  {
    model: "e-208 GT", brand: "Peugeot", price: 225990, range: 220, cat: "Compacto",
    img: "/car-images/e-208.jpg",
    power: 136, torque: 26.5, traction: 'FWD', battery: 50,
    features: [
      "Bateria NMC 50 kWh",
      "Carregamento AC 11 kW / DC 100 kW",
      "Cockpit i-Cockpit 3D: tela 10\" + painel digital tridimensional",
      "6 airbags",
      "ADAS: ACC + manutenção de faixa (LKA) + AEB + alerta de ponto cego (BSM)",
      "Câmera de ré 180°",
      "Bancos esportivos GT com revestimento em Alcantara",
      "Faróis de matriz LED (Full LED)"
    ]
  },
  {
    model: "Cooper E", brand: "Mini", price: 260990, range: 246, cat: "Compacto",
    img: "/car-images/cooper e.avif",
    power: 184, torque: 29.6, traction: 'FWD', battery: 40.7,
    features: [
      "Bateria NMC 40,7 kWh",
      "Carregamento AC 11 kW / DC 75 kW",
      "Tela OLED circular 9,4\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: ACC + AEB + alerta de saída de faixa + câmera traseira",
      "Modos de condução Go Kart (experiência esportiva)",
      "Experiência sonora imersiva (motor e aceleração simulados)",
      "Design icônico Mini premium com acabamentos exclusivos"
    ]
  },
  {
    model: "Dolphin Plus", brand: "BYD", price: 184000, range: 330, cat: "Compacto",
    img: "/car-images/dolphin-plus.jpg",
    power: 204, torque: 31.6, traction: 'FWD', battery: 60.4,
    features: [
      "Bateria LFP Blade 60,4 kWh",
      "Carregamento AC 11 kW / DC 88 kW",
      "Tela 12,8\" rotativa com BYD DiLink 4.0 (CarPlay e Android Auto)",
      "6 airbags",
      "DiPilot Nível 2: ACC + LCC + AEB + LKA + alerta de ponto cego (BSM)",
      "Câmera 360° surround view",
      "V2L – Vehicle-to-Load (carrega dispositivos externos)",
      "Bancos aquecidos + Atualização OTA"
    ]
  },

  // 2. SUVS & SEDANS MÉDIOS
  {
    model: "Aion ES", brand: "GAC", price: 170990, range: 314, cat: "Sedan",
    img: "/car-images/aion-es.jpg",
    power: 136, torque: 23, traction: 'FWD', battery: 55,
    features: [
      "Bateria NMC 55 kWh",
      "Carregamento AC 6,6 kW / DC 70 kW",
      "Tela central flutuante 14,6\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: ACC + AEB + manutenção de faixa (LKA) + câmera 360°",
      "Painel digital 8,8\" + head-up display",
      "Ar-condicionado dual zone automático",
      "Chave virtual NFC"
    ]
  },
  {
    model: "Yuan Pro", brand: "BYD", price: 182900, range: 250, cat: "SUV",
    img: "/car-images/yuan-pro.jpg",
    power: 177, torque: 29.5, traction: 'FWD', battery: 45,
    features: [
      "Bateria LFP Blade 45 kWh",
      "Carregamento AC 7 kW / DC 80 kW",
      "Tela 12,8\" rotativa com BYD DiLink (CarPlay e Android Auto)",
      "6 airbags",
      "DiPilot: ACC + AEB + manutenção de faixa (LKA)",
      "Câmera de ré",
      "Sensores de estacionamento dianteiros e traseiros",
      "Atualização OTA"
    ]
  },
  {
    model: "Aion Y Elite", brand: "GAC", price: 184900, range: 318, cat: "SUV",
    img: "/car-images/aion-y.jpg",
    power: 136, torque: 23, traction: 'FWD', battery: 63.2,
    features: [
      "Bateria NMC 63,2 kWh",
      "Carregamento AC 6,6 kW / DC 70 kW",
      "Tela central 14,6\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2: ACC + LCC + AEB + LKA",
      "Câmera 360° com radar de proximidade",
      "Teto solar panorâmico",
      "Chave virtual NFC + atualização OTA"
    ]
  },
  {
    model: "Aion V Elite", brand: "GAC", price: 219000, range: 389, cat: "SUV",
    img: "/car-images/aion-v.jpg",
    power: 204, torque: 24.5, traction: 'FWD', battery: 80,
    features: [
      "Bateria NMC 80 kWh",
      "Carregamento AC 11 kW / DC 120 kW",
      "Tela central 14,6\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2+: ACC + LCC + AEB + alerta de ponto cego (BSM) + câmera 360°",
      "7 lugares com 3ª fileira retrátil",
      "Teto solar panorâmico elétrico",
      "Bancos elétricos com ajuste lombar"
    ]
  },
  {
    model: "B10 BEV", brand: "Leapmotor", price: 173000, range: 288, cat: "SUV",
    img: "/car-images/leapmotor-b10.jpg",
    power: 218, torque: 24.5, traction: 'RWD', battery: 69,
    features: [
      "Bateria LFP 69 kWh",
      "Carregamento AC 7 kW / DC 60 kW",
      "Tela central 10,1\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: ACC + AEB + manutenção de faixa (LKA)",
      "Câmera de ré",
      "Plataforma proprietária Leapmotor (LEAP 3.0)",
      "Motor traseiro RWD de alto torque"
    ]
  },
  {
    model: "C10 BEV", brand: "Leapmotor", price: 189990, range: 338, cat: "SUV",
    img: "/car-images/leapmotor-c10.jpg",
    power: 218, torque: 32.6, traction: 'RWD', battery: 69.9,
    features: [
      "Bateria NMC 69,9 kWh",
      "Carregamento AC 11 kW / DC 100 kW",
      "Tela central 14,6\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2: ACC + LCC + AEB + LKA + alerta de ponto cego (BSM)",
      "Câmera 360° surround view",
      "Teto solar panorâmico elétrico",
      "Atualização OTA"
    ]
  },
  {
    model: "Captiva EV", brand: "Chevrolet", price: 199990, range: 304, cat: "SUV",
    img: "/car-images/captiva-ev.jpg",
    power: 201, torque: 31.6, traction: 'FWD', battery: 60,
    features: [
      "Bateria 60 kWh",
      "Carregamento AC 7 kW / DC 80 kW",
      "Tela MyLink 12,3\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: ACC + AEB + alerta de colisão frontal + alerta de saída de faixa",
      "Câmera de ré + sensores de estacionamento",
      "Espaço interno generoso para família (5 lugares confortáveis)",
      "OnStar conectado (assistência remota)"
    ]
  },
  {
    model: "Omoda 5 EV", brand: "Omoda", price: 209990, range: 345, cat: "SUV",
    img: "/car-images/omoda-5.jpg",
    power: 204, torque: 34.7, traction: 'FWD', battery: 61,
    features: [
      "Bateria NMC 61 kWh",
      "Carregamento AC 11 kW / DC 80 kW",
      "Tela central 15,6\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2: ACC + LCC + AEB + LKA + alerta de ponto cego (BSM)",
      "Câmera 360° surround view",
      "Teto solar panorâmico elétrico",
      "Design esportivo coupe-SUV com faróis divididos"
    ]
  },
  {
    model: "EX5 Max", brand: "Geely", price: 215800, range: 349, cat: "SUV",
    img: "/car-images/ex5-max.jpg",
    power: 218, torque: 32.6, traction: 'FWD', battery: 60.1,
    features: [
      "Bateria NMC 60,1 kWh",
      "Carregamento AC 11 kW / DC 80 kW",
      "Tela dupla 12,3\" (painel + central) com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: ACC + LCC + AEB + LKA + alerta de ponto cego (BSM)",
      "Câmera 360°",
      "Head-up display (HUD)",
      "Bancos aquecidos e ventilados + teto solar"
    ]
  },
  {
    model: "Kona EV", brand: "Hyundai", price: 219990, range: 252, cat: "SUV",
    img: "/car-images/kona-ev.jpg",
    power: 136, torque: 40.3, traction: 'FWD', battery: 39.2,
    features: [
      "Bateria NMC 39,2 kWh",
      "Carregamento AC 11 kW / DC 100 kW",
      "Tela dupla 10,25\" (painel digital + central) com CarPlay e Android Auto",
      "7 airbags",
      "Hyundai SmartSense: ACC + LCC + AEB + BSM + Safe Exit Warning",
      "V2L – Vehicle-to-Load (carrega dispositivos externos até 3,6 kW)",
      "Câmera de ré",
      "Faróis LED parametrizáveis"
    ]
  },
  {
    model: "Yuan Plus", brand: "BYD", price: 229800, range: 294, cat: "SUV",
    img: "/car-images/yuan-plus.jpg",
    power: 204, torque: 31.6, traction: 'FWD', battery: 60.5,
    features: [
      "Bateria LFP Blade 60,5 kWh",
      "Carregamento AC 7 kW / DC 80 kW",
      "Tela 12,8\" rotativa com BYD DiLink 4.0 (CarPlay e Android Auto)",
      "6 airbags",
      "DiPilot: ACC + LCC + AEB + LKA + alerta de ponto cego (BSM)",
      "Câmera 360° surround view",
      "Bancos aquecidos",
      "Atualização OTA"
    ]
  },
  {
    model: "EX30", brand: "Volvo", price: 229950, range: 250, cat: "SUV",
    img: "/car-images/ex30.jpg",
    power: 272, torque: 35, traction: 'RWD', battery: 51,
    features: [
      "Bateria NMC 51 kWh",
      "Carregamento AC 11 kW / DC 153 kW",
      "Tela central 12,3\" com Google integrado nativo (Maps, Assistant, Play Store)",
      "6 airbags",
      "Pilot Assist: ACC + manutenção de faixa com apoio de direção",
      "ADAS: AEB + alerta de colisão + câmera de ré",
      "Interior em materiais reciclados e sustentáveis",
      "Atualização OTA"
    ]
  },
  {
    model: "e-2008", brand: "Peugeot", price: 269990, range: 261, cat: "SUV",
    img: "/car-images/e-2008.jpg",
    power: 136, torque: 26.5, traction: 'FWD', battery: 50,
    features: [
      "Bateria NMC 50 kWh",
      "Carregamento AC 11 kW / DC 100 kW",
      "Cockpit i-Cockpit: tela 10\" + painel digital 3D",
      "6 airbags",
      "ADAS: ACC + manutenção de faixa (LKA) + AEB + alerta de ponto cego (BSM)",
      "Câmera de ré 180° + sensores de estacionamento",
      "Teto panorâmico com cortina elétrica",
      "Faróis Full LED com assinatura luminosa Peugeot"
    ]
  },
  {
    model: "Megane E-Tech", brand: "Renault", price: 279900, range: 337, cat: "SUV",
    img: "/car-images/megane-etech.jpg",
    power: 220, torque: 30.6, traction: 'FWD', battery: 60,
    features: [
      "Bateria NMC 60 kWh",
      "Carregamento AC 22 kW (trifásico) / DC 130 kW",
      "OpenR Link com Google nativo: tela 12\" + tela de clima 9,3\"",
      "6 airbags",
      "ADAS Nível 2: ACC + LCC + AEB + BSM + estacionamento assistido automático",
      "Câmera de ré + sensores de estacionamento",
      "Bancos aquecidos e ventilados",
      "Atualização OTA"
    ]
  },
  {
    model: "Countryman SE", brand: "Mini", price: 340990, range: 320, cat: "SUV",
    img: "/car-images/countryman-se.jpg",
    power: 306, torque: 50.3, traction: 'AWD', battery: 64.6,
    features: [
      "Bateria NMC 64,6 kWh",
      "Carregamento AC 11 kW / DC 130 kW",
      "Tela OLED circular 9,4\" com CarPlay e Android Auto",
      "8 airbags",
      "ADAS Nível 2: ACC + LCC + AEB + BSM + câmera 360°",
      "Modo Go Kart com torque vetorial AWD",
      "Teto panorâmico elétrico",
      "Bancos aquecidos e ventilados"
    ]
  },
  {
    model: "Equinox EV", brand: "Chevrolet", price: 349990, range: 443, cat: "SUV",
    img: "/car-images/equinox-ev.jpg",
    power: 292, torque: 46, traction: 'AWD', battery: 85,
    features: [
      "Bateria 85 kWh",
      "Carregamento AC 11,5 kW / DC 150 kW",
      "Tela Infotainment 17,7\" com CarPlay sem fio e Android Auto",
      "6 airbags",
      "Super Cruise: piloto automático mãos livres em rodovias mapeadas",
      "ADAS: ACC + LCC + AEB + BSM + câmera de ré HD",
      "OnStar conectado (telemetria, assistência remota, Wi-Fi)",
      "Atualização OTA"
    ]
  },
  {
    model: "ID.4", brand: "Volkswagen", price: 320000, range: 370, cat: "SUV",
    img: "/car-images/id4.jpg",
    power: 204, torque: 31.6, traction: 'RWD', battery: 77,
    features: [
      "Bateria NMC 77 kWh",
      "Carregamento AC 11 kW / DC 135 kW",
      "Tela central 12\" com CarPlay e Android Auto",
      "7 airbags",
      "IDA (Intelligent Driver Assistance): ACC + LCC + AEB + BSM",
      "Head-up display (HUD) com realidade aumentada",
      "Câmera de ré",
      "Atualização OTA"
    ]
  },
  {
    model: "EX40 (XC40)", brand: "Volvo", price: 342950, range: 385, cat: "SUV",
    img: "/car-images/ex40.jpg",
    power: 238, torque: 42.8, traction: 'RWD', battery: 69,
    features: [
      "Bateria NMC 69 kWh",
      "Carregamento AC 11 kW / DC 150 kW",
      "Tela Google nativa 9\" + painel digital 12\" (Google Maps, Assistant, Play Store)",
      "6 airbags",
      "Pilot Assist Nível 2: ACC + LCC + AEB + BSM + estacionamento assistido",
      "Câmera 360° surround view",
      "Bancos aquecidos e ventilados + teto solar panorâmico",
      "Atualização OTA"
    ]
  },
  {
    model: "EC40 (C40)", brand: "Volvo", price: 359950, range: 385, cat: "SUV",
    img: "/car-images/ec40.jpg",
    power: 238, torque: 42.8, traction: 'RWD', battery: 69,
    features: [
      "Bateria NMC 69 kWh",
      "Carregamento AC 11 kW / DC 150 kW",
      "Tela Google nativa 9\" + painel digital 12\"",
      "6 airbags",
      "Pilot Assist Nível 2: ACC + LCC + AEB + BSM + estacionamento assistido",
      "Câmera 360° surround view",
      "Design fastback coupé (teto fixo de vidro, sem abertura)",
      "Bancos aquecidos + acabamento sem couro (interior vegan)"
    ]
  },
  {
    model: "iX1 eDrive20", brand: "BMW", price: 359950, range: 332, cat: "SUV",
    img: "/car-images/ix1.jpg",
    power: 204, torque: 25.5, traction: 'FWD', battery: 64.7,
    features: [
      "Bateria NMC 64,7 kWh",
      "Carregamento AC 11 kW / DC 130 kW",
      "BMW Curved Display: tela 10,7\" + painel 10,25\" com iDrive 9",
      "6 airbags",
      "BMW Driving Assistant Plus: ACC + LCC + AEB + BSM + estacionamento remoto",
      "Câmera de ré",
      "Bancos aquecidos",
      "Som Harman Kardon (opcional)"
    ]
  },
  {
    model: "EV5 Land", brand: "Kia", price: 389990, range: 402, cat: "SUV",
    img: "/car-images/ev5.jpg",
    power: 217, torque: 31.6, traction: 'FWD', battery: 88,
    features: [
      "Bateria NMC 88 kWh",
      "Carregamento AC 11 kW / DC 135 kW",
      "Tela panorâmica Kia 27\" (painel 12\" + central 12\" integrados)",
      "6 airbags",
      "DriveWise: ACC + LCC + AEB + BSM + Remote Smart Parking Assist",
      "V2L – Vehicle-to-Load (até 3,6 kW externos)",
      "Câmera 360°",
      "Bancos aquecidos e ventilados + teto solar panorâmico"
    ]
  },
  {
    model: "Ioniq 5", brand: "Hyundai", price: 394990, range: 374, cat: "SUV",
    img: "/car-images/ioniq-5.jpg",
    power: 325, torque: 61.6, traction: 'RWD', battery: 72.6,
    features: [
      "Bateria NMC 72,6 kWh – Plataforma E-GMP 800V (carregamento ultrarrápido)",
      "Carregamento AC 11 kW / DC 220 kW",
      "Tela dual 12\" integrada (painel digital + central) com CarPlay e Android Auto",
      "6 airbags",
      "Highway Driving Assist 2 (HDA2): ACC + LCC + AEB + BSM + estacionamento remoto",
      "V2L – Vehicle-to-Load 6,6 kW (pode carregar outro carro ou alimentar casa)",
      "Câmera 360° surround view + câmera de estacionamento HD",
      "Bancos aquecidos, ventilados e com suporte lombar elétrico"
    ]
  },
  {
    model: "EQA 250", brand: "Mercedes-Benz", price: 399900, range: 370, cat: "Luxo",
    img: "/car-images/eqa-250.jpg",
    power: 190, torque: 38.2, traction: 'FWD', battery: 66.5,
    features: [
      "Bateria NMC 66,5 kWh",
      "Carregamento AC 11 kW / DC 100 kW",
      "MBUX: tela 10,25\" + painel digital 10,25\" com realidade aumentada",
      "7 airbags",
      "DISTRONIC Plus: ACC + LCC + AEB + BSM + Active Lane Change Assist",
      "Câmera 360° surround view",
      "Bancos aquecidos e ventilados com ajuste elétrico",
      "Hey Mercedes (assistente de voz premium)"
    ]
  },
  {
    model: "EQB 250", brand: "Mercedes-Benz", price: 405900, range: 290, cat: "Luxo",
    img: "/car-images/eqb-250.jpg",
    power: 190, torque: 38.2, traction: 'FWD', battery: 66.5,
    features: [
      "Bateria NMC 66,5 kWh",
      "Carregamento AC 11 kW / DC 100 kW",
      "MBUX: tela 10,25\" + painel digital 10,25\"",
      "7 airbags",
      "DISTRONIC Plus: ACC + LCC + AEB + BSM",
      "Câmera 360°",
      "7 lugares (3ª fileira rebatível)",
      "Bancos aquecidos + Hey Mercedes"
    ]
  },
  {
    model: "Neta X 500", brand: "Neta", price: 214900, range: 317, cat: "SUV",
    img: "/car-images/neta-x.jpg",
    power: 163, torque: 21.4, traction: 'FWD', battery: 52,
    features: [
      "Bateria NMC 52 kWh",
      "Carregamento AC 6,6 kW / DC 80 kW",
      "Tela central 14,6\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2: ACC + LCC + AEB + LKA + alerta de ponto cego (BSM)",
      "Câmera 360° surround view",
      "Teto solar panorâmico elétrico",
      "Porta-malas elétrico + atualização OTA"
    ]
  },
  {
    model: "E-JS4", brand: "JAC", price: 254900, range: 307, cat: "SUV",
    img: "/car-images/e-js4.png",
    power: 150, torque: 34.7, traction: 'FWD', battery: 55,
    features: [
      "Bateria NMC 55 kWh",
      "Carregamento AC 7 kW / DC 80 kW",
      "Tela central 12,3\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: ACC + AEB + LKA + alerta de ponto cego (BSM)",
      "Câmera 360° surround view",
      "Bancos de couro aquecidos",
      "Teto solar + porta-malas elétrico"
    ]
  },
  {
    model: "Ariya", brand: "Nissan", price: 350000, range: 400, cat: "SUV",
    img: "/car-images/ariya.jpg",
    power: 242, torque: 30.6, traction: 'AWD', battery: 87,
    features: [
      "Bateria NMC 87 kWh",
      "Carregamento AC 7,4 kW / DC 130 kW",
      "Tela dupla 12,3\" com Nissan Connect (CarPlay e Android Auto)",
      "8 airbags",
      "ProPILOT 2.0: ACC mãos livres + LCC + AEB + Pilot Park (estacionamento autônomo)",
      "Câmera 360° surround view",
      "Bancos aquecidos e ventilados (Zero-Gravity seats)",
      "Teto solar panorâmico"
    ]
  },
  {
    model: "Zeekr X", brand: "Zeekr", price: 272000, range: 332, cat: "SUV",
    img: "/car-images/zeekr-x.webp",
    power: 272, torque: 39, traction: 'AWD', battery: 66,
    features: [
      "Bateria NMC 66 kWh – Plataforma SEA (Sustainable Experience Architecture) Geely",
      "Carregamento AC 11 kW / DC 150 kW",
      "Tela central 14,6\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2+: ACC + LCC + AEB + BSM + câmera 360°",
      "Tração AWD dual motor 272 cv de alto desempenho",
      "Bancos aquecidos e ventilados + teto solar panorâmico",
      "Atualização OTA"
    ]
  },
  {
    model: "iX3", brand: "BMW", price: 500950, range: 381, cat: "Luxo",
    img: "/car-images/ix3.jpg",
    power: 286, torque: 40.8, traction: 'RWD', battery: 74,
    features: [
      "Bateria NMC 74 kWh",
      "Carregamento AC 11 kW / DC 150 kW",
      "BMW Curved Display: tela 12,3\" + 14,9\" com iDrive 8",
      "6 airbags",
      "BMW Driving Assistant Professional: ACC + LCC + AEB + BSM + Park Assist remoto",
      "Câmera 360°",
      "Bancos aquecidos e ventilados + teto panorâmico",
      "Som Harman Kardon premium + head-up display"
    ]
  },

  // 3. LUXO & PERFORMANCE
  {
    model: "Seal AWD", brand: "BYD", price: 249990, range: 372, cat: "Sedan",
    img: "/car-images/seal.jpg",
    power: 531, torque: 60.2, traction: 'AWD', battery: 82.5,
    features: [
      "Bateria LFP Blade 82,5 kWh – Plataforma e-Platform 3.0",
      "Carregamento AC 11 kW / DC 150 kW",
      "Tela 15,6\" rotativa com BYD DiLink 4.0 (CarPlay e Android Auto)",
      "6 airbags",
      "DiPilot Nível 2: ACC + LCC + AEB + LKA + BSM + câmera 360°",
      "e-4WD com torque vetorial AWD (dual motor 531 cv, 0-100 em ~3,8 s)",
      "V2L – Vehicle-to-Load",
      "Bancos aquecidos e ventilados + som Dynaudio + atualização OTA"
    ]
  },
  {
    model: "001 Premium", brand: "Zeekr", price: 428000, range: 426, cat: "Luxo",
    img: "/car-images/zeekr-001.webp",
    power: 544, torque: 70, traction: 'AWD', battery: 100,
    features: [
      "Bateria NMC 100 kWh – Plataforma SEA 800V Geely",
      "Carregamento AC 11 kW / DC 200 kW (ultrarrápido 800V)",
      "Tela 15,4\" + painel digital com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2+: ACC + LCC + AEB + BSM + câmera 360° + Lidar",
      "AWD dual motor 544 cv (0-100 km/h em ~3,8 s)",
      "Bancos aquecidos, ventilados e com massagem",
      "Teto panorâmico elétrico + som premium Yamaha + atualização OTA"
    ]
  },
  {
    model: "i4 eDrive35", brand: "BMW", price: 449950, range: 422, cat: "Luxo",
    img: "/car-images/i4.jpg",
    power: 286, torque: 40.8, traction: 'RWD', battery: 70,
    features: [
      "Bateria NMC 70 kWh",
      "Carregamento AC 11 kW / DC 200 kW",
      "BMW Curved Display: tela 12,3\" + 14,9\" com iDrive 8.5",
      "6 airbags",
      "BMW Driving Assistant Professional: ACC + LCC + AEB + BSM + Park Assist remoto",
      "Câmera 360°",
      "Bancos aquecidos e ventilados + head-up display",
      "Som Harman Kardon + design Gran Coupé aerodinâmico"
    ]
  },
  {
    model: "Mustang Mach-E", brand: "Ford", price: 486000, range: 379, cat: "Luxo",
    img: "/car-images/mach-e.jpg",
    power: 487, torque: 87.7, traction: 'AWD', battery: 91,
    features: [
      "Bateria NMC 91 kWh",
      "Carregamento AC 11 kW / DC 150 kW",
      "Tela SYNC 4 15,5\" vertical com CarPlay sem fio e Android Auto",
      "7 airbags",
      "Ford BlueCruise: piloto automático mãos livres em rodovias mapeadas",
      "ADAS: ACC + LCC + AEB + alerta de ponto cego (BSM)",
      "Bancos aquecidos e ventilados",
      "AWD dual motor 487 cv (0-100 km/h em ~3,7 s) + atualização OTA"
    ]
  },
  {
    model: "Blazer EV RS", brand: "Chevrolet", price: 489000, range: 483, cat: "Luxo",
    img: "/car-images/blazer-ev.jpg",
    power: 347, torque: 44.9, traction: 'RWD', battery: 85,
    features: [
      "Bateria 85 kWh",
      "Carregamento AC 11,5 kW / DC 150 kW",
      "Tela Infotainment 17,7\" com CarPlay sem fio + tela de clima 11\"",
      "6 airbags",
      "Super Cruise: piloto automático mãos livres em rodovias mapeadas",
      "ADAS: ACC + LCC + AEB + BSM + câmera 360°",
      "Bancos RS aquecidos e ventilados + head-up display",
      "Modo RS esportivo + OnStar + atualização OTA"
    ]
  },
  {
    model: "Tan EV", brand: "BYD", price: 529800, range: 309, cat: "Luxo",
    img: "/car-images/tan-ev.jpg",
    power: 517, torque: 69.3, traction: 'AWD', battery: 108.8,
    features: [
      "Bateria LFP Blade 108,8 kWh (maior da linha BYD)",
      "Carregamento AC 11 kW / DC 110 kW",
      "Tela 15,6\" rotativa com BYD DiLink 4.0 (CarPlay e Android Auto)",
      "6 airbags",
      "DiPilot: ACC + LCC + AEB + BSM + câmera 360°",
      "6 lugares com bancos em couro com aquecimento e massagem",
      "Teto solar panorâmico elétrico + som Dynaudio premium",
      "AWD e-4WD dual motor + V2L + atualização OTA"
    ]
  },
  {
    model: "Han EV", brand: "BYD", price: 539800, range: 349, cat: "Luxo",
    img: "/car-images/han-ev.jpg",
    power: 517, torque: 71.4, traction: 'AWD', battery: 85.4,
    features: [
      "Bateria LFP Blade 85,4 kWh",
      "Carregamento AC 11 kW / DC 120 kW",
      "Tela 15,6\" rotativa com BYD DiLink 4.0 (CarPlay e Android Auto)",
      "6 airbags",
      "DiPilot Nível 2+: ACC + LCC + AEB + BSM + câmera 360°",
      "Bancos elétricos com aquecimento, ventilação e massagem",
      "Teto solar panorâmico + som Dynaudio premium",
      "Chave NFC + AWD dual motor (0-100 km/h em ~3,9 s)"
    ]
  },
  {
    model: "Macan EV", brand: "Porsche", price: 560000, range: 443, cat: "Luxo",
    img: "/car-images/macan-ev.jpg",
    power: 408, torque: 66.3, traction: 'AWD', battery: 100,
    features: [
      "Bateria NMC 100 kWh – Plataforma PPE 800V (Porsche/Audi)",
      "Carregamento AC 11 kW / DC 270 kW (carregamento ultrarrápido 800V)",
      "Cockpit Porsche Advanced: tela 12,9\" + tela do passageiro 10,9\"",
      "8 airbags",
      "Porsche InnoDrive: ACC + LCC + AEB + BSM + estacionamento autônomo",
      "Câmera 360° Surround View + Night Vision",
      "Bancos esportivos com ajuste pneumático, aquecimento e ventilação",
      "Suspensão pneumática Porsche Active Ride + som BOSE/Burmester opcional"
    ]
  },
  {
    model: "Q8 e-tron", brand: "Audi", price: 699000, range: 332, cat: "Luxo",
    img: "/car-images/q8-etron.jpg",
    power: 408, torque: 67.7, traction: 'AWD', battery: 106,
    features: [
      "Bateria NMC 106 kWh",
      "Carregamento AC 22 kW (trifásico) / DC 170 kW",
      "Tela tripla MMI: 10,1\" (central) + 8,6\" (clima) + painel virtual 12,3\"",
      "8 airbags",
      "Audi Pre Sense: ACC + LCC + AEB + BSM + estacionamento automático",
      "Virtual Mirrors (câmeras substituindo espelhos retrovisores externos, opcional)",
      "Bancos Contour com ventilação e massagem + som Bang & Olufsen 3D",
      "Suspensão pneumática adaptativa + faróis Matrix LED + atualização OTA"
    ]
  },
  {
    model: "iX xDrive40", brand: "BMW", price: 699950, range: 329, cat: "Luxo",
    img: "/car-images/ix.jpg",
    power: 326, torque: 64.2, traction: 'AWD', battery: 71,
    features: [
      "Bateria NMC 71 kWh",
      "Carregamento AC 11 kW / DC 200 kW",
      "BMW Curved Display: tela 12,3\" + 14,9\" com iDrive 8",
      "6 airbags",
      "BMW Driving Assistant Professional: ACC + LCC + AEB + BSM + Park Assist remoto",
      "Câmera 360° + câmera panorâmica traseira",
      "Bancos aquecidos, ventilados e com massagem",
      "Som Bowers & Wilkins Diamond (31 alto-falantes) + teto panorâmico cristal"
    ]
  },
  {
    model: "Taycan 4S", brand: "Porsche", price: 745000, range: 340, cat: "Luxo",
    img: "/car-images/taycan.jpg",
    power: 530, torque: 65.3, traction: 'AWD', battery: 93.4,
    features: [
      "Bateria NMC 93,4 kWh (Performance Battery Plus) – Plataforma 800V Porsche",
      "Carregamento AC 11 kW / DC 270 kW (ultrarrápido 800V, 5 min = 100 km)",
      "Cockpit Porsche Advanced: tela 16,8\" + painel 12,6\" + tela do passageiro 10,9\"",
      "8 airbags",
      "Porsche InnoDrive avançado: ACC + LCC + AEB + BSM + Night Vision",
      "Câmera Surround 360°",
      "Bancos esportivos GT com ventilação e massagem + som BOSE/Burmester Diamond 3D",
      "Suspensão pneumática com controle ativo + 0-100 km/h em 4,0 s"
    ]
  },
  {
    model: "EV9 GT-Line", brand: "Kia", price: 749990, range: 434, cat: "Luxo",
    img: "/car-images/ev9.jpg",
    power: 384, torque: 71.4, traction: 'AWD', battery: 99.8,
    features: [
      "Bateria NMC 99,8 kWh – Plataforma E-GMP 800V",
      "Carregamento AC 11 kW / DC 240 kW (ultrarrápido 800V)",
      "Tela panorâmica Kia 27\" (painel 12\" + central 12\" integrados)",
      "7 airbags",
      "DriveWise ADAS Nível 3: ACC + LCC + AEB + BSM + câmera 360° + Highway Driving Pilot",
      "V2G/V2L – 6,6 kW (pode alimentar residência ou outro veículo)",
      "7 lugares com bancos elétricos aquecidos e ventilados",
      "Som Meridian premium + atualização OTA"
    ]
  },
  {
    model: "Hyptec HT", brand: "GAC", price: 359990, range: 362, cat: "Luxo",
    img: "/car-images/hyptec-ht.jpg",
    power: 340, torque: 43.8, traction: 'RWD', battery: 80,
    features: [
      "Bateria NMC 80 kWh",
      "Carregamento AC 11 kW / DC 150 kW",
      "Tela central 15,6\" com Hyptec OS integrado e CarPlay",
      "8 airbags",
      "ADAS Nível 2+: ACC + LCC + AEB + BSM + câmera 360°",
      "Interior premium com iluminação ambiente 64 cores",
      "Bancos elétricos aquecidos e ventilados",
      "Som imersivo 12 alto-falantes + teto panorâmico elétrico + atualização OTA"
    ]
  },
  {
    model: "EQS 450+", brand: "Mercedes-Benz", price: 999900, range: 516, cat: "Luxo",
    img: "/car-images/eqs.jpg",
    power: 333, torque: 57.9, traction: 'RWD', battery: 107.8,
    features: [
      "Bateria NMC 107,8 kWh",
      "Carregamento AC 22 kW (trifásico) / DC 200 kW",
      "MBUX Hyperscreen 56\" curva (painel + central + tela do passageiro integrados)",
      "8 airbags",
      "DRIVE PILOT (Nível 3 certificado – piloto autônomo em rodovias na Alemanha/EUA)",
      "DISTRONIC Plus: ACC + LCC + AEB + BSM + Park Pilot remoto + Night View",
      "Bancos de massagem execution + som Burmester 4D (31 alto-falantes)",
      "Suspensão AIRMATIC ativa + chave NFC + interior em Nappa completo"
    ]
  },
  {
    model: "e-tron GT", brand: "Audi", price: 769990, range: 318, cat: "Luxo",
    img: "/car-images/etron-gt.jpg",
    power: 530, torque: 65.3, traction: 'AWD', battery: 93.4,
    features: [
      "Bateria NMC 93,4 kWh – Plataforma J1 800V Porsche/Audi",
      "Carregamento AC 11 kW / DC 270 kW (ultrarrápido 800V)",
      "Tela MMI 10,1\" + painel virtual 12,3\" + head-up display com AR",
      "8 airbags",
      "Audi Pre Sense: ACC + LCC + AEB + BSM + câmera 360°",
      "AWD com torque vetorial (0-100 km/h em 3,3 s no RS e-tron GT)",
      "Bancos esportivos com ventilação e massagem + som Bang & Olufsen 3D",
      "Suspensão pneumática ativa + atualização OTA"
    ]
  },
  {
    model: "i7 xDrive60", brand: "BMW", price: 1321950, range: 479, cat: "Luxo",
    img: "/car-images/i7.jpg",
    power: 544, torque: 76, traction: 'AWD', battery: 101.7,
    features: [
      "Bateria NMC 101,7 kWh",
      "Carregamento AC 11 kW / DC 195 kW",
      "BMW Curved Display 12,3\" + 14,9\" + Tela traseira Theatre Screen 31,3\" (opcional)",
      "10 airbags",
      "BMW Driving Assistant Professional + DRIVING WIZARD Nível 3",
      "Bancos executive traseiros: massagem, ventilação, reclinação total e otomana elétrica",
      "Som Bowers & Wilkins Diamond Surround (36 alto-falantes)",
      "Teto Sky Lounge LED panorâmico + chave de cristal iluminado + atualização OTA"
    ]
  },
  {
    model: "EQE 300 SUV", brand: "Mercedes-Benz", price: 698900, range: 367, cat: "Luxo",
    img: "/car-images/eqe-suv.jpg",
    power: 245, torque: 56.1, traction: 'RWD', battery: 90,
    features: [
      "Bateria NMC 90 kWh",
      "Carregamento AC 11 kW / DC 170 kW",
      "MBUX: tela 12,8\" + painel 12,3\" (MBUX Hyperscreen 56\" opcional)",
      "7 airbags",
      "DISTRONIC Plus: ACC + LCC + AEB + BSM + Active Lane Change Assist + Park Pilot remoto",
      "Câmera 360°",
      "Bancos multicontour com aquecimento e ventilação + som Burmester Premium",
      "Teto panorâmico + Hey Mercedes + atualização OTA"
    ]
  },

  // 4. COMERCIAIS & VANS
  {
    model: "e-Transit", brand: "Ford", price: 542000, range: 260, cat: "Comercial",
    img: "/car-images/etransit.jpg",
    power: 198, torque: 43.8, traction: 'RWD', battery: 68,
    features: [
      "Bateria NMC 68 kWh",
      "Carregamento AC 11,3 kW / DC 115 kW",
      "Tela SYNC 4 12\" com CarPlay e Android Auto",
      "2 airbags",
      "ADAS: AEB + alerta de saída de faixa + câmera de ré",
      "Pro Power Onboard: 2,4 kW para ferramentas elétricas",
      "FordPass Pro: gestão de frota conectada",
      "Capacidade de carga 758-1.032 kg (furgão, chassi ou plataforma)"
    ]
  },
  {
    model: "Kangoo E-Tech", brand: "Renault", price: 259000, range: 210, cat: "Comercial",
    img: "/car-images/kangoo-etech.jpg",
    power: 120, torque: 25, traction: 'FWD', battery: 45,
    features: [
      "Bateria NMC 45 kWh",
      "Carregamento AC 11 kW / DC 80 kW",
      "Tela EasyLink 8\" com CarPlay e Android Auto",
      "2 airbags",
      "ADAS: AEB + alerta de fadiga do motorista",
      "Câmera de ré",
      "Open Sesame: porta traseira swing de 180°",
      "Capacidade de carga até 775 kg + porta lateral deslizante dupla"
    ]
  },
  {
    model: "ID.Buzz", brand: "Volkswagen", price: 340000, range: 341, cat: "Comercial",
    img: "/car-images/idbuzz.jpg",
    power: 204, torque: 31.6, traction: 'RWD', battery: 77,
    features: [
      "Bateria NMC 77 kWh",
      "Carregamento AC 11 kW / DC 135 kW",
      "Tela central 12\" com CarPlay e Android Auto",
      "9 airbags",
      "IDA: ACC + LCC + AEB + BSM + Travel Assist",
      "Câmera 360°",
      "Design icônico Kombi elétrica + 7 lugares",
      "Teto solar panorâmico + bancos aquecidos + atualização OTA"
    ]
  },
  {
    model: "eT3", brand: "BYD", price: 229990, range: 180, cat: "Comercial",
    img: "/car-images/et3.jpg",
    power: 136, torque: 21.4, traction: 'FWD', battery: 50.3,
    features: [
      "Bateria LFP Blade 50,3 kWh",
      "Carregamento AC 7 kW / DC 80 kW",
      "Tela 12,8\" com BYD DiLink (CarPlay e Android Auto)",
      "2 airbags",
      "ADAS básico: AEB + câmera de ré",
      "Capacidade de carga 800 kg (furgão compacto urbano)",
      "Refrigeração da cabine para motoristas",
      "Atualização OTA – ideal para logística urbana de última milha"
    ]
  },
  {
    model: "e-Expert", brand: "Peugeot", price: 329990, range: 289, cat: "Comercial",
    img: "/car-images/e-expert.jpg",
    power: 136, torque: 26.5, traction: 'FWD', battery: 75,
    features: [
      "Bateria NMC 75 kWh",
      "Carregamento AC 11 kW / DC 100 kW",
      "Tela i-Connect 10\" com CarPlay e Android Auto",
      "2 airbags",
      "ADAS: AEB + alerta de saída de faixa (LDW) + alerta de fadiga",
      "Drive Assist Plus: ACC + alerta de mudança de faixa (LCA)",
      "Capacidade de carga 1.000 kg + porta traseira dupla",
      "Conectividade de frota PSA Fleet"
    ]
  },
  {
    model: "e-Scudo", brand: "Fiat", price: 329990, range: 289, cat: "Comercial",
    img: "/car-images/e-scudo.jpg",
    power: 136, torque: 26.5, traction: 'FWD', battery: 75,
    features: [
      "Bateria NMC 75 kWh",
      "Carregamento AC 11 kW / DC 100 kW",
      "Tela 10\" com CarPlay e Android Auto",
      "2 airbags",
      "ADAS: AEB + alerta de saída de faixa (LDW) + câmera de ré",
      "Drive Assist: ACC + alerta de mudança de faixa (LCA)",
      "Capacidade de carga 1.000 kg",
      "Plataforma compartilhada Stellantis (e-Expert / e-Jumpy / e-Scudo)"
    ]
  },
  {
    model: "e-Jumpy", brand: "Citroen", price: 329990, range: 289, cat: "Comercial",
    img: "/car-images/e-jumpy.jpg",
    power: 136, torque: 26.5, traction: 'FWD', battery: 75,
    features: [
      "Bateria NMC 75 kWh",
      "Carregamento AC 11 kW / DC 100 kW",
      "Tela 10\" com CarPlay e Android Auto",
      "2 airbags",
      "ADAS: AEB + alerta de saída de faixa + alerta de fadiga",
      "Drive Assist: ACC + alerta de mudança de faixa (LCA)",
      "Capacidade de carga 1.000 kg + porta lateral deslizante elétrica",
      "Plataforma compartilhada Stellantis (e-Expert / e-Jumpy / e-Scudo)"
    ]
  },

  // 5. MG MOTOR
  {
    model: "MG4 Comfort", brand: "MG Motor", price: 169600, range: 364, cat: "Compacto",
    img: "/car-images/mg4-comfort.jpg",
    power: 204, torque: 25.5, traction: 'RWD', battery: 51,
    features: [
      "Bateria NMC 51 kWh – Plataforma MSP (Motor Skateboard Platform)",
      "Carregamento AC 6,6 kW / DC 87 kW",
      "Tela central 10,25\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 1: AEB + alerta de saída de faixa (LDW) + ACC básico",
      "Câmera de ré",
      "Motor traseiro RWD de alto desempenho",
      "Design esportivo hatch"
    ]
  },
  {
    model: "MG4 Luxury", brand: "MG Motor", price: 189800, range: 364, cat: "Compacto",
    img: "/car-images/mg4-luxury.jpg",
    power: 204, torque: 25.5, traction: 'RWD', battery: 64,
    features: [
      "Bateria NMC 64 kWh (maior autonomia da linha MG4)",
      "Carregamento AC 6,6 kW / DC 140 kW",
      "Tela central 10,25\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2: ACC + LCC + AEB + alerta de ponto cego (BSM) + RCTA",
      "Câmera 360° surround view",
      "Teto solar panorâmico + bancos aquecidos",
      "Plataforma MSP (Motor Skateboard Platform)"
    ]
  },
  {
    model: "MG4 XPower", brand: "MG Motor", price: 229800, range: 279, cat: "Compacto",
    img: "/car-images/mg4-xpower.jpg",
    power: 435, torque: 60, traction: 'AWD', battery: 64,
    features: [
      "Bateria NMC 64 kWh",
      "Carregamento AC 6,6 kW / DC 140 kW",
      "Tela central 10,25\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2: ACC + LCC + AEB + alerta de ponto cego (BSM)",
      "AWD dual motor 435 cv (0-100 km/h em 3,8 s)",
      "Freios Brembo + modo Trophy (pista) + câmera 360°",
      "Atualização OTA"
    ]
  },
  {
    model: "MGS5 Comfort", brand: "MG Motor", price: 195800, range: 351, cat: "SUV",
    img: "/car-images/mgs5-comfort.jpg",
    power: 205, torque: 35.7, traction: 'FWD', battery: 61.1,
    features: [
      "Bateria NMC 61,1 kWh",
      "Carregamento AC 6,6 kW / DC 100 kW",
      "Tela central 12,3\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS: AEB + alerta de saída de faixa (LDW) + ACC + câmera de ré",
      "Sensores de estacionamento dianteiros e traseiros",
      "Design SUV robusto com visual agressivo",
      "Faróis LED full"
    ]
  },
  {
    model: "MGS5 Luxury", brand: "MG Motor", price: 219800, range: 351, cat: "SUV",
    img: "/car-images/mgs5.jpg",
    power: 205, torque: 35.7, traction: 'FWD', battery: 61.1,
    features: [
      "Bateria NMC 61,1 kWh",
      "Carregamento AC 6,6 kW / DC 100 kW",
      "Tela central 12,3\" com CarPlay e Android Auto",
      "6 airbags",
      "ADAS Nível 2: ACC + LCC + AEB + alerta de ponto cego (BSM) + câmera 360°",
      "Teto solar panorâmico",
      "Bancos aquecidos e ventilados",
      "Interior premium com iluminação ambiente"
    ]
  },
  {
    model: "Cyberster", brand: "MG Motor", price: 499800, range: 342, cat: "Luxo",
    img: "/car-images/cyberster.jpg",
    power: 510, torque: 74, traction: 'AWD', battery: 77,
    features: [
      "Bateria NMC 77 kWh",
      "Carregamento AC 6,6 kW / DC 140 kW",
      "Tela dupla 27\" (painel + central) + HUD projetado no para-brisa",
      "6 airbags",
      "ADAS: ACC + AEB + LKA + câmera de ré",
      "Capota retrátil elétrica em 9 segundos (roadster 2 lugares)",
      "AWD dual motor 510 cv (0-100 km/h em 3,2 s)",
      "Bancos Alcantara com aquecimento + design roadster esportivo clássico"
    ]
  }
];
