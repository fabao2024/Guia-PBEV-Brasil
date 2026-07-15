
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

export type LeadInterest = '' | 'wallbox' | 'energia_solar_recarga';

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
  qualificationData: Record<string, string>;
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
}
