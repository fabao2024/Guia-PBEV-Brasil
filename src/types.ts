
export interface Car {
  model: string;
  brand: string;
  price: number;
  range: number;
  cat: string;
  img: string;
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
