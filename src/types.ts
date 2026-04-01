
export interface Car {
  model: string;
  brand: string;
  price: number;
  range: number;
  cat: string;
  img: string;
  power?: number; // cv
  torque?: number; // kgfm
  traction?: 'FWD' | 'RWD' | 'AWD';
  battery?: number; // kWh
  url?: string;          // model-specific URL override (falls back to BRAND_URLS)
  discontinued?: boolean; // true = fora de linha no Brasil
  features?: string[];   // model-specific feature list
  pbeRating?: 'A' | 'B' | 'C' | 'D' | 'E';
  energyMJkm?: number;
  conpetSeal?: boolean;
  warrantyYears?: number;        // anos — garantia do veículo
  warrantyBatteryYears?: number; // anos — garantia da bateria/motor elétrico
  chargeAC?: number;             // kW — carregador AC onboard
  chargeDC?: number | null;      // kW — carga rápida DC máxima (null = não suporta)
}

export interface FilterState {
  maxPrice: number;
  minRange: number;
  categories: string[];
  brands: string[];
  showNew: boolean;
  fastChargeOnly: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string }[];
}
