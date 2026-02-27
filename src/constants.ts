
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
  { model: "Kwid E-Tech", brand: "Renault", price: 99990, range: 185, cat: "Compacto", img: "/car-images/renault-kwid-e-tech-2026-diagonal-dianteira.avif", power: 65, torque: 11.5, traction: 'FWD' },
  { model: "iCar EQ", brand: "CAOA Chery", price: 119990, range: 197, cat: "Compacto", img: "/car-images/chery-icar.webp", power: 61, torque: 15.3, traction: 'RWD' },
  { model: "E-JS1", brand: "JAC", price: 119900, range: 181, cat: "Compacto", img: "/car-images/e-js1.png", power: 62, torque: 15.3, traction: 'FWD' },
  { model: "Dolphin Mini", brand: "BYD", price: 119990, range: 280, cat: "Compacto", img: "/car-images/Dolphin-mini.png", power: 75, torque: 13.8, traction: 'FWD' },
  { model: "EX2 Max", brand: "Geely", price: 135100, range: 289, cat: "Compacto", img: "/car-images/geely-ex2-max.jpg", power: 116, torque: 15.3, traction: 'FWD' },
  { model: "Aya Luxury", brand: "Neta", price: 149900, range: 263, cat: "Compacto", img: "/car-images/neta-aya.avif", power: 95, torque: 15.3, traction: 'FWD' },
  { model: "Ora 03 Skin BEV48", brand: "GWM", price: 154000, range: 232, cat: "Compacto", img: "/car-images/ora 03 skin bev48.webp", power: 171, torque: 25.5, traction: 'FWD' },
  { model: "Ora 03 Skin BEV58", brand: "GWM", price: 169000, range: 315, cat: "Compacto", img: "/car-images/ora 03 skin bev58.webp", power: 171, torque: 25.5, traction: 'FWD' },
  { model: "Ora 03 GT BEV63", brand: "GWM", price: 189000, range: 295, cat: "Compacto", img: "/car-images/ora 03 GT BEV63.webp", power: 171, torque: 25.5, traction: 'FWD' },
  { model: "Spark EUV", brand: "Chevrolet", price: 159990, range: 258, cat: "Compacto", img: "/car-images/Spark EUV.avif", power: 102, torque: 18.4, traction: 'FWD' },
  { model: "Dolphin GS", brand: "BYD", price: 149990, range: 291, cat: "Compacto", img: "/car-images/dolphin-gs.jpg", power: 95, torque: 18.3, traction: 'FWD' },
  { model: "500e Icon", brand: "Fiat", price: 214990, range: 227, cat: "Compacto", img: "/car-images/500e.webp", power: 118, torque: 22.4, traction: 'FWD' },
  { model: "e-208 GT", brand: "Peugeot", price: 225990, range: 220, cat: "Compacto", img: "/car-images/e-208.jpg", power: 136, torque: 26.5, traction: 'FWD' },
  { model: "Cooper E", brand: "Mini", price: 260990, range: 246, cat: "Compacto", img: "/car-images/cooper e.avif", power: 184, torque: 29.6, traction: 'FWD' },
  { model: "Dolphin Plus", brand: "BYD", price: 184000, range: 330, cat: "Compacto", img: "/car-images/dolphin-plus.jpg", power: 204, torque: 31.6, traction: 'FWD' },


  // 2. SUVS & SEDANS MÉDIOS
  { model: "Aion ES", brand: "GAC", price: 170990, range: 314, cat: "Sedan", img: "/car-images/aion-es.jpg", power: 136, torque: 23, traction: 'FWD' },
  { model: "Yuan Pro", brand: "BYD", price: 182900, range: 250, cat: "SUV", img: "/car-images/yuan-pro.jpg", power: 177, torque: 29.5, traction: 'FWD' },
  { model: "Aion Y Elite", brand: "GAC", price: 184900, range: 318, cat: "SUV", img: "/car-images/aion-y.jpg", power: 136, torque: 23, traction: 'FWD' },
  { model: "Aion V Elite", brand: "GAC", price: 219000, range: 389, cat: "SUV", img: "/car-images/aion-v.jpg", power: 204, torque: 24.5, traction: 'FWD' },
  { model: "B10 BEV", brand: "Leapmotor", price: 173000, range: 288, cat: "SUV", img: "/car-images/leapmotor-b10.jpg", power: 218, torque: 24.5, traction: 'RWD' },
  { model: "C10 BEV", brand: "Leapmotor", price: 189990, range: 338, cat: "SUV", img: "/car-images/leapmotor-c10.jpg", power: 218, torque: 32.6, traction: 'RWD' },
  { model: "Captiva EV", brand: "Chevrolet", price: 199990, range: 304, cat: "SUV", img: "/car-images/captiva-ev.jpg", power: 201, torque: 31.6, traction: 'FWD' },
  { model: "Omoda 5 EV", brand: "Omoda", price: 209990, range: 345, cat: "SUV", img: "/car-images/omoda-5.jpg", power: 204, torque: 34.7, traction: 'FWD' },
  { model: "EX5 Max", brand: "Geely", price: 215800, range: 349, cat: "SUV", img: "/car-images/ex5-max.jpg", power: 218, torque: 32.6, traction: 'FWD' },
  { model: "Kona EV", brand: "Hyundai", price: 219990, range: 252, cat: "SUV", img: "/car-images/kona-ev.jpg", power: 136, torque: 40.3, traction: 'FWD' },
  { model: "Yuan Plus", brand: "BYD", price: 229800, range: 294, cat: "SUV", img: "/car-images/yuan-plus.jpg", power: 204, torque: 31.6, traction: 'FWD' },
  { model: "EX30", brand: "Volvo", price: 229950, range: 250, cat: "SUV", img: "/car-images/ex30.jpg", power: 272, torque: 35, traction: 'RWD' },
  { model: "e-2008", brand: "Peugeot", price: 269990, range: 261, cat: "SUV", img: "/car-images/e-2008.jpg", power: 136, torque: 26.5, traction: 'FWD' },
  { model: "Megane E-Tech", brand: "Renault", price: 279900, range: 337, cat: "SUV", img: "/car-images/megane-etech.jpg", power: 220, torque: 30.6, traction: 'FWD' },
  { model: "Countryman SE", brand: "Mini", price: 340990, range: 320, cat: "SUV", img: "/car-images/countryman-se.jpg", power: 306, torque: 50.3, traction: 'AWD' },
  { model: "Equinox EV", brand: "Chevrolet", price: 349990, range: 443, cat: "SUV", img: "/car-images/equinox-ev.jpg", power: 292, torque: 46, traction: 'AWD' },
  { model: "ID.4", brand: "Volkswagen", price: 320000, range: 370, cat: "SUV", img: "/car-images/id4.jpg", power: 204, torque: 31.6, traction: 'RWD' },
  { model: "EX40 (XC40)", brand: "Volvo", price: 342950, range: 385, cat: "SUV", img: "/car-images/ex40.jpg", power: 238, torque: 42.8, traction: 'RWD' },
  { model: "EC40 (C40)", brand: "Volvo", price: 359950, range: 385, cat: "SUV", img: "/car-images/ec40.jpg", power: 238, torque: 42.8, traction: 'RWD' },
  { model: "iX1 eDrive20", brand: "BMW", price: 359950, range: 332, cat: "SUV", img: "/car-images/ix1.jpg", power: 204, torque: 25.5, traction: 'FWD' },
  { model: "EV5 Land", brand: "Kia", price: 389990, range: 402, cat: "SUV", img: "/car-images/ev5.jpg", power: 217, torque: 31.6, traction: 'FWD' },
  { model: "Ioniq 5", brand: "Hyundai", price: 394990, range: 374, cat: "SUV", img: "/car-images/ioniq-5.jpg", power: 325, torque: 61.6, traction: 'RWD' },
  { model: "EQA 250", brand: "Mercedes-Benz", price: 399900, range: 370, cat: "Luxo", img: "/car-images/eqa-250.jpg", power: 190, torque: 38.2, traction: 'FWD' },
  { model: "EQB 250", brand: "Mercedes-Benz", price: 405900, range: 290, cat: "Luxo", img: "/car-images/eqb-250.jpg", power: 190, torque: 38.2, traction: 'FWD' },
  { model: "Neta X 500", brand: "Neta", price: 214900, range: 317, cat: "SUV", img: "/car-images/neta-x.jpg", power: 163, torque: 21.4, traction: 'FWD' },
  { model: "E-JS4", brand: "JAC", price: 254900, range: 307, cat: "SUV", img: "/car-images/e-js4.png", power: 150, torque: 34.7, traction: 'FWD' },
  { model: "Ariya", brand: "Nissan", price: 350000, range: 400, cat: "SUV", img: "/car-images/ariya.jpg", power: 242, torque: 30.6, traction: 'AWD' },
  { model: "Zeekr X", brand: "Zeekr", price: 272000, range: 332, cat: "SUV", img: "/car-images/zeekr-x.webp", power: 272, torque: 39, traction: 'AWD' },
  { model: "iX3", brand: "BMW", price: 500950, range: 381, cat: "Luxo", img: "/car-images/ix3.jpg", power: 286, torque: 40.8, traction: 'RWD' },

  // 3. LUXO & PERFORMANCE
  { model: "Seal AWD", brand: "BYD", price: 249990, range: 372, cat: "Sedan", img: "/car-images/seal.jpg", power: 531, torque: 60.2, traction: 'AWD' },
  { model: "001 Premium", brand: "Zeekr", price: 428000, range: 426, cat: "Luxo", img: "/car-images/zeekr-001.webp", power: 544, torque: 70, traction: 'AWD' },
  { model: "i4 eDrive35", brand: "BMW", price: 449950, range: 422, cat: "Luxo", img: "/car-images/i4.jpg", power: 286, torque: 40.8, traction: 'RWD' },
  { model: "Mustang Mach-E", brand: "Ford", price: 486000, range: 379, cat: "Luxo", img: "/car-images/mach-e.jpg", power: 487, torque: 87.7, traction: 'AWD' },
  { model: "Blazer EV RS", brand: "Chevrolet", price: 489000, range: 483, cat: "Luxo", img: "/car-images/blazer-ev.jpg", power: 347, torque: 44.9, traction: 'RWD' },
  { model: "Tan EV", brand: "BYD", price: 529800, range: 309, cat: "Luxo", img: "/car-images/tan-ev.jpg", power: 517, torque: 69.3, traction: 'AWD' },
  { model: "Han EV", brand: "BYD", price: 539800, range: 349, cat: "Luxo", img: "/car-images/han-ev.jpg", power: 517, torque: 71.4, traction: 'AWD' },
  { model: "Macan EV", brand: "Porsche", price: 560000, range: 443, cat: "Luxo", img: "/car-images/macan-ev.jpg", power: 408, torque: 66.3, traction: 'AWD' },
  { model: "Q8 e-tron", brand: "Audi", price: 699000, range: 332, cat: "Luxo", img: "/car-images/q8-etron.jpg", power: 408, torque: 67.7, traction: 'AWD' },
  { model: "iX xDrive40", brand: "BMW", price: 699950, range: 329, cat: "Luxo", img: "/car-images/ix.jpg", power: 326, torque: 64.2, traction: 'AWD' },
  { model: "Taycan 4S", brand: "Porsche", price: 745000, range: 340, cat: "Luxo", img: "/car-images/taycan.jpg", power: 530, torque: 65.3, traction: 'AWD' },
  { model: "EV9 GT-Line", brand: "Kia", price: 749990, range: 434, cat: "Luxo", img: "/car-images/ev9.jpg", power: 384, torque: 71.4, traction: 'AWD' },
  { model: "Hyptec HT", brand: "GAC", price: 359990, range: 362, cat: "Luxo", img: "/car-images/hyptec-ht.jpg", power: 340, torque: 43.8, traction: 'RWD' },
  { model: "EQS 450+", brand: "Mercedes-Benz", price: 999900, range: 516, cat: "Luxo", img: "/car-images/eqs.jpg", power: 333, torque: 57.9, traction: 'RWD' },
  { model: "e-tron GT", brand: "Audi", price: 769990, range: 318, cat: "Luxo", img: "/car-images/etron-gt.jpg", power: 530, torque: 65.3, traction: 'AWD' },
  { model: "i7 xDrive60", brand: "BMW", price: 1321950, range: 479, cat: "Luxo", img: "/car-images/i7.jpg", power: 544, torque: 76, traction: 'AWD' },
  { model: "EQE 300 SUV", brand: "Mercedes-Benz", price: 698900, range: 367, cat: "Luxo", img: "/car-images/eqe-suv.jpg", power: 245, torque: 56.1, traction: 'RWD' },

  // 4. COMERCIAIS & VANS
  { model: "e-Transit", brand: "Ford", price: 542000, range: 260, cat: "Comercial", img: "/car-images/etransit.jpg", power: 198, torque: 43.8, traction: 'RWD' },
  { model: "Kangoo E-Tech", brand: "Renault", price: 259000, range: 210, cat: "Comercial", img: "/car-images/kangoo-etech.jpg", power: 120, torque: 25, traction: 'FWD' },
  { model: "ID.Buzz", brand: "Volkswagen", price: 340000, range: 341, cat: "Comercial", img: "/car-images/idbuzz.jpg", power: 204, torque: 31.6, traction: 'RWD' },
  { model: "eT3", brand: "BYD", price: 229990, range: 180, cat: "Comercial", img: "/car-images/et3.jpg", power: 136, torque: 21.4, traction: 'FWD' },
  { model: "e-Expert", brand: "Peugeot", price: 329990, range: 289, cat: "Comercial", img: "/car-images/e-expert.jpg", power: 136, torque: 26.5, traction: 'FWD' },
  { model: "e-Scudo", brand: "Fiat", price: 329990, range: 289, cat: "Comercial", img: "/car-images/e-scudo.jpg", power: 136, torque: 26.5, traction: 'FWD' },
  { model: "e-Jumpy", brand: "Citroen", price: 329990, range: 289, cat: "Comercial", img: "/car-images/e-jumpy.jpg", power: 136, torque: 26.5, traction: 'FWD' },

  // 5. MG MOTOR
  { model: "MG4 Comfort", brand: "MG Motor", price: 169600, range: 364, cat: "Compacto", img: "/car-images/mg4-comfort.jpg", power: 204, torque: 25.5, traction: 'RWD' },
  { model: "MG4 Luxury", brand: "MG Motor", price: 189800, range: 364, cat: "Compacto", img: "/car-images/mg4-luxury.jpg", power: 204, torque: 25.5, traction: 'RWD' },
  { model: "MG4 XPower", brand: "MG Motor", price: 229800, range: 279, cat: "Compacto", img: "/car-images/mg4-xpower.jpg", power: 435, torque: 60, traction: 'AWD' },
  { model: "MGS5 Comfort", brand: "MG Motor", price: 195800, range: 351, cat: "SUV", img: "/car-images/mgs5-comfort.jpg", power: 205, torque: 35.7, traction: 'FWD' },
  { model: "MGS5 Luxury", brand: "MG Motor", price: 219800, range: 351, cat: "SUV", img: "/car-images/mgs5.jpg", power: 205, torque: 35.7, traction: 'FWD' },
  { model: "Cyberster", brand: "MG Motor", price: 499800, range: 342, cat: "Luxo", img: "/car-images/cyberster.jpg", power: 510, torque: 74, traction: 'AWD' }
];
