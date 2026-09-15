
export type PowertrainType = 'BEV' | 'PHEV' | 'HEV' | 'REEV';

/** Todas as propulsões — seleção padrão do filtro (descoberta total, ranking segue por preço/autonomia). */
export const ALL_POWERTRAINS: PowertrainType[] = ['BEV', 'PHEV', 'HEV', 'REEV'];

/** Piso do slider de autonomia (km) — abaixo da menor elétrica PHEV do catálogo. */
export const MIN_RANGE_FLOOR = 30;

/** Autonomia mínima padrão (km) — abaixo do menor BEV (185 km), inclui PHEV 35+ km. */
export const DEFAULT_MIN_RANGE = 30;

export interface Car {
  model: string;
  brand: string;
  price: number;
  range: number;
  cat: string;
  img: string;
  /** Tipo de propulsão. Ausente = 'BEV' (catálogo legado 100% elétrico). */
  powertrain?: PowertrainType;
  /** km — autonomia só-elétrica PBEV (PHEV/REEV). Para BEV, equivale a `range`. */
  electricRangeKm?: number;
  /** km/L — consumo em modo sustentação de carga, gasolina (HEV; PHEV/REEV). */
  fuelConsumptionKml?: number;
  /** Combustível do motor a combustão (híbridos). */
  fuelType2?: 'gasolina' | 'etanol' | 'flex' | 'diesel';
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
  lengthMm?: number;             // mm — comprimento
  widthMm?: number;              // mm — largura (sem espelhos)
  heightMm?: number;             // mm — altura
  wheelbaseMm?: number;          // mm — entre-eixos
  groundClearanceMm?: number;    // mm — altura do solo (desalicerado)
  weightKg?: number;             // kg — peso em ordem de marcha
  trunkLiters?: number;          // L — porta-malas (VDA)
}

export interface FilterState {
  maxPrice: number;
  minRange: number;
  categories: string[];
  brands: string[];
  showNew: boolean;
  fastChargeOnly: boolean;
  /** Powertrains visíveis. [] = todos; default ['BEV'] (BEV-first). */
  powertrains: PowertrainType[];
}

/** Resolve o powertrain efetivo (legado sem campo = BEV). */
export const powertrainOf = (car: Car): PowertrainType => car.powertrain ?? 'BEV';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string }[];
}

export type LeadInterest = '' | 'wallbox' | 'energia_solar_recarga' | 'limpeza_sistema_solar';

export interface LeadQualificationData {
  qualification_version: 'pilot-q2-2026-08-14';
  property_situation: string;
  timeline: string;
  service_detail: string;
  preferred_contact: string;
}

export interface LeadFormData {
  name: string;
  whatsapp: string;
  city: string;
  state: 'SP';
  customerType: 'pf' | 'pj';
  budget: string;
  interest: LeadInterest;
  vehicleModel?: string;
  vehicleBrand?: string;
  qualificationData: LeadQualificationData;
  consentAccepted: boolean;
  consentTextVersion: 'pilot-v3-2026-07-15';
  message: string;
}

export interface PartnerApplicationFormData {
  companyName: string;
  cnpj: string;
  website: string;
  contactName: string;
  contactRole: string;
  email: string;
  whatsapp: string;
  city: string;
  state: string;
  serviceCategories: string[];
  coverageStates: string[];
  coverageCities: string;
  servesPf: boolean;
  servesPj: boolean;
  servesRemote: boolean;
  evExperience: string;
  brandsSupported: string;
  monthlyCapacity: string;
  slaHours: string;
  crmTool: string;
  preferredDeliveryChannel: string;
  commercialModelInterest: string;
  acceptablePriceRange: string;
  leadPriceByModality: Record<string, string>;
  matchCodes: string[];
  notes: string;
  lgpdAcceptance: boolean;
  termsVersion: string;
  freePilotLeadLimit: number;
}
