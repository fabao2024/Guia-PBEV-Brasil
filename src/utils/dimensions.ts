import { Car } from '../types';

export const hasDimensions = (car: Car): boolean =>
  car.lengthMm !== undefined ||
  car.widthMm !== undefined ||
  car.heightMm !== undefined ||
  car.wheelbaseMm !== undefined ||
  car.groundClearanceMm !== undefined ||
  car.weightKg !== undefined ||
  car.trunkLiters !== undefined;

export const fmtNum = (n: number): string => n.toLocaleString('pt-BR');

export interface DimensionProperty {
  '@type': 'PropertyValue';
  name: string;
  value: string;
}

// JSON-LD Product.additionalProperty — espelha a ficha técnica da UI.
export function dimensionProperties(car: Car): DimensionProperty[] {
  const props: Array<{ name: string; value: string }> = [];
  if (car.lengthMm !== undefined) props.push({ name: 'Comprimento', value: `${car.lengthMm} mm` });
  if (car.widthMm !== undefined) props.push({ name: 'Largura (sem espelhos)', value: `${car.widthMm} mm` });
  if (car.heightMm !== undefined) props.push({ name: 'Altura', value: `${car.heightMm} mm` });
  if (car.wheelbaseMm !== undefined) props.push({ name: 'Entre-eixos', value: `${car.wheelbaseMm} mm` });
  if (car.groundClearanceMm !== undefined) props.push({ name: 'Altura do solo (desalicerada)', value: `${car.groundClearanceMm} mm` });
  if (car.weightKg !== undefined) props.push({ name: 'Peso (ordem de marcha)', value: `${car.weightKg} kg` });
  if (car.trunkLiters !== undefined) props.push({ name: 'Porta-malas (VDA)', value: `${car.trunkLiters} L` });
  return props.map(p => ({ '@type': 'PropertyValue' as const, ...p }));
}
