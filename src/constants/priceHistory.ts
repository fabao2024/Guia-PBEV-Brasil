// Price history — one entry per snapshot month.
// To record a new snapshot: append { date: 'YYYY-MM', price: NNN } to each changed car's array.
// Cars with no price change in a given month do NOT need a new entry.
// Badge logic: compares car.price (current) with the last entry in the array.

export interface PriceSnapshot {
  date: string;  // 'YYYY-MM'
  price: number; // BRL
}

/** Record<model, snapshots[]> — model key matches Car.model in constants.ts */
export const PRICE_HISTORY: Record<string, PriceSnapshot[]> = {
  "Kwid E-Tech": [{ date: '2026-03', price: 99990 }],
  "iCar EQ": [{ date: '2026-03', price: 119990 }],
  "E-JS1": [{ date: '2026-03', price: 119900 }],
  "Dolphin Mini GS": [{ date: '2026-03', price: 119990 }],
  "Dolphin Mini GL": [{ date: '2026-03', price: 118990 }],
  "EX2 Max": [{ date: '2026-03', price: 135100 }],
  "Aya Luxury": [{ date: '2026-03', price: 149900 }],
  "Ora 03 Skin BEV48": [{ date: '2026-03', price: 154000 }],
  "Ora 03 Skin BEV58": [{ date: '2026-03', price: 169000 }],
  "Ora 03 GT BEV63": [{ date: '2026-03', price: 189000 }],
  "Spark EUV": [{ date: '2026-03', price: 159990 }, { date: '2026-04', price: 144990 }],
  "Dolphin GS": [{ date: '2026-03', price: 149990 }],
  "Dolphin Special Edition": [{ date: '2026-04', price: 159990 }],
  "500e Icon": [{ date: '2026-03', price: 214990 }],
  "e-208 GT": [{ date: '2026-03', price: 225990 }],
  "Cooper E": [{ date: '2026-03', price: 260990 }],
  "JCW-E": [{ date: '2026-03', price: 330990 }],
  "Aceman SE": [{ date: '2026-03', price: 304990 }],
  "Dolphin Plus": [{ date: '2026-03', price: 184000 }],
  "Aion ES": [{ date: '2026-03', price: 170990 }],
  "Yuan Pro": [{ date: '2026-03', price: 182900 }],
  "Aion Y Elite": [{ date: '2026-03', price: 184900 }],
  "Aion V Elite": [{ date: '2026-03', price: 219000 }],
  "B10 BEV": [{ date: '2026-03', price: 173000 }, { date: '2026-04', price: 182990 }],
  "C10 BEV": [{ date: '2026-03', price: 189990 }, { date: '2026-04', price: 204990 }],
  "Captiva EV": [{ date: '2026-03', price: 199990 }],
  "Omoda 5 EV": [{ date: '2026-03', price: 209990 }],
  "EX5 Max": [{ date: '2026-03', price: 215800 }],
  "Kona EV": [{ date: '2026-03', price: 219990 }],
  "Yuan Plus": [{ date: '2026-03', price: 229800 }],
  "Yuan Plus AWD": [{ date: '2026-04', price: 269990 }],
  "EX30 Plus": [{ date: '2026-03', price: 229950 }, { date: '2026-04', price: 239950 }],
  "EX30 Ultra": [{ date: '2026-04', price: 309950 }],
  "e-2008": [{ date: '2026-03', price: 269990 }],
  "Megane E-Tech": [{ date: '2026-03', price: 279900 }],
  "Countryman SE": [{ date: '2026-03', price: 340990 }],
  "Equinox EV": [{ date: '2026-03', price: 349990 }],
  "ID.4": [{ date: '2026-03', price: 320000 }],
  "EX40 (XC40)": [{ date: '2026-03', price: 342950 }],
  "EC40 (C40)": [{ date: '2026-03', price: 359950 }],
  "EX90 Twin": [{ date: '2026-03', price: 849990 }],
  "iX2 xDrive30": [{ date: '2026-03', price: 495950 }],
  "iX1 eDrive20": [{ date: '2026-03', price: 359950 }],
  "EV5 Land": [{ date: '2026-03', price: 389990 }],
  "Ioniq 5": [{ date: '2026-03', price: 394990 }],
  "EQA 250": [{ date: '2026-03', price: 369900 }],
  "EQB 250": [{ date: '2026-03', price: 399900 }],
  "EQE 350": [{ date: '2026-03', price: 649900 }],
  "Neta X 500": [{ date: '2026-03', price: 214900 }],
  "E-JS4": [{ date: '2026-03', price: 254900 }],
  "E-J7": [{ date: '2026-03', price: 259900 }],
  "Ariya": [{ date: '2026-03', price: 350000 }],
  "Zeekr X": [{ date: '2026-03', price: 272000 }],
  "7X": [{ date: '2026-03', price: 448000 }],
  "iX3": [{ date: '2026-03', price: 500950 }],
  "Seal AWD": [{ date: '2026-03', price: 249990 }],
  "001 Premium": [{ date: '2026-03', price: 428000 }],
  "i4 eDrive35": [{ date: '2026-03', price: 449950 }],
  "Mustang Mach-E": [{ date: '2026-03', price: 486000 }],
  "Blazer EV RS": [{ date: '2026-03', price: 489000 }],
  "Tan EV": [{ date: '2026-03', price: 529800 }],
  "Han EV": [{ date: '2026-03', price: 539800 }],
  "Macan EV": [{ date: '2026-03', price: 560000 }],
  "Q8 e-tron": [{ date: '2026-03', price: 699000 }],
  "A6 Sportback e-tron": [{ date: '2026-03', price: 649990 }],
  "Q6 e-tron": [{ date: '2026-03', price: 529990 }],
  "Q6 Sportback e-tron": [{ date: '2026-03', price: 569990 }],
  "SQ6 Sportback e-tron": [{ date: '2026-03', price: 684990 }],
  "iX xDrive40": [{ date: '2026-03', price: 699950 }],
  "i5 M60": [{ date: '2026-03', price: 794950 }],
  "Taycan 4S": [{ date: '2026-03', price: 745000 }],
  "EV9 GT-Line": [{ date: '2026-03', price: 749990 }],
  "Hyptec HT": [{ date: '2026-03', price: 359990 }],
  "e-tron GT": [{ date: '2026-03', price: 769990 }],
  "i7 xDrive60": [{ date: '2026-03', price: 1321950 }],
  "EQE 300 SUV": [{ date: '2026-03', price: 698900 }],
  "Cayenne EV": [{ date: '2026-03', price: 900000 }],
  "e-Transit": [{ date: '2026-03', price: 542000 }],
  "Kangoo E-Tech": [{ date: '2026-03', price: 259000 }],
  "ID.Buzz": [{ date: '2026-03', price: 340000 }],
  "eT3": [{ date: '2026-03', price: 229990 }],
  "e-Expert": [{ date: '2026-03', price: 329990 }],
  "e-Scudo": [{ date: '2026-03', price: 329990 }],
  "e-Jumpy": [{ date: '2026-03', price: 329990 }],
  "MG4 Comfort": [{ date: '2026-03', price: 164600 }],
  "MG4 Luxury": [{ date: '2026-03', price: 189800 }],
  "MG4 XPower": [{ date: '2026-03', price: 229800 }],
  "MGS5 Comfort": [{ date: '2026-03', price: 195800 }],
  "MGS5 Luxury": [{ date: '2026-03', price: 219800 }],
  "Cyberster": [{ date: '2026-03', price: 499800 }],
  "e-Vitara": [{ date: '2026-03', price: 269990 }],
};

/** Returns the most recent snapshot for a given model, or null if no history. */
export function getLastSnapshot(model: string): PriceSnapshot | null {
  const history = PRICE_HISTORY[model];
  if (!history || history.length === 0) return null;
  return history[history.length - 1];
}

/** Returns price delta vs current price: negative = dropped, positive = rose, null = no history or unchanged. */
export function getPriceDelta(model: string, currentPrice: number): number | null {
  const last = getLastSnapshot(model);
  if (!last) return null;
  const delta = currentPrice - last.price;
  return delta !== 0 ? delta : null;
}

export const PRICE_HISTORY_UPDATED = 'março/2026';
