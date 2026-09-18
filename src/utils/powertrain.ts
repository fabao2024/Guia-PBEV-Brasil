import { Car, PowertrainType, powertrainOf } from '../types';

export { powertrainOf };

export const POWERTRAIN_LABELS: Record<PowertrainType, string> = {
  BEV: '100% elétrico',
  PHEV: 'híbrido plug-in',
  HEV: 'híbrido sem tomada',
  REEV: 'elétrico com extensor de autonomia',
};

export const isPlugInPowertrain = (car: Car): boolean => {
  const powertrain = powertrainOf(car);
  return powertrain === 'BEV' || powertrain === 'PHEV' || powertrain === 'REEV';
};

export const powertrainLabel = (car: Car): string => POWERTRAIN_LABELS[powertrainOf(car)];

export const electricRangeOf = (car: Car): number | undefined => {
  if (car.electricRangeKm != null && car.electricRangeKm > 0) return car.electricRangeKm;
  return powertrainOf(car) === 'BEV' && car.range > 0 ? car.range : undefined;
};

export const combinedRangeOf = (car: Car): number | undefined => (
  car.combinedRangeKm != null && car.combinedRangeKm > 0 ? car.combinedRangeKm : undefined
);

export interface PrimaryCarMetric {
  label: string;
  value: number | string;
  unit: string;
  progressValue: number;
}

export const primaryCarMetric = (car: Car): PrimaryCarMetric => {
  const powertrain = powertrainOf(car);
  if (powertrain === 'HEV') {
    return {
      label: 'Consumo',
      value: car.fuelConsumptionKml ?? '—',
      unit: 'km/l',
      progressValue: Math.min(Math.round(((car.fuelConsumptionKml ?? 0) / 20) * 100), 100),
    };
  }

  const electricRange = electricRangeOf(car);
  return {
    label: powertrain === 'BEV' ? 'Autonomia PBEV' : 'Autonomia elétrica',
    value: electricRange ?? '—',
    unit: 'km',
    progressValue: Math.min(Math.round(((electricRange ?? 0) / 700) * 100), 100),
  };
};

export const carMetaDescription = (car: Car): string => {
  const powertrain = powertrainOf(car);
  const price = `R$ ${car.price.toLocaleString('pt-BR')}`;
  if (powertrain === 'HEV') {
    return `${powertrainLabel(car)} ${car.brand} ${car.model} — consumo Inmetro ${car.fuelConsumptionKml ?? '—'} km/l | Categoria: ${car.cat} | Preço estimado: ${price}`;
  }
  const electric = electricRangeOf(car);
  const combined = combinedRangeOf(car);
  const rangeText = powertrain === 'BEV'
    ? `autonomia PBEV ${electric ?? '—'} km`
    : `autonomia elétrica ${electric ?? '—'} km${combined ? ` e total combinada ${combined} km` : ''}`;
  return `${powertrainLabel(car)} ${car.brand} ${car.model} — ${rangeText} | Categoria: ${car.cat} | Preço estimado: ${price}`;
};
