
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
  features?: string[]; // feature keys — translated via t(`featureLabels.${key}`)
}

export interface FilterState {
  maxPrice: number;
  minRange: number;
  categories: string[];
  brands: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string }[];
}
