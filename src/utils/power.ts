import type { Car } from '../types';

export const powerLabelKey = (car: Car): string => (
  car.powerBasis === 'electric_motor' ? 'details.electricPower'
    : car.powerBasis === 'combined' ? 'details.combinedPower' : 'details.power'
);

export const hasPowerBreakdown = (car: Car): boolean => (
  car.combustionPowerCv !== undefined || car.electricMotorPowerCv !== undefined
    || car.combinedPowerCv !== undefined
);

export const motorPowerSummary = (car: Car): string => [
  ...(car.electricMotorPowerCv != null ? [`motor elétrico de tração: ${car.electricMotorPowerCv} cv`] : []),
  ...(car.combustionPowerCv != null ? [`motor a combustão: ${car.combustionPowerCv} cv`] : []),
  ...(car.combinedPowerCv != null ? [`potência combinada: ${car.combinedPowerCv} cv`]
    : car.combinedPowerCv === null ? ['potência combinada não confirmada'] : []),
].join(', ');

/** Não publicar potência combinada pendente como zero, soma ou potência elétrica. */
export const powerProperties = (car: Car) => {
  const property = (name: string, value: number) => ({
    '@type': 'PropertyValue', name, value: `${value} cv`,
  });
  if (hasPowerBreakdown(car)) {
    return [
      ...(car.electricMotorPowerCv != null ? [property('Potência do motor elétrico de tração', car.electricMotorPowerCv)] : []),
      ...(car.combustionPowerCv != null ? [property('Potência do motor a combustão', car.combustionPowerCv)] : []),
      ...(car.combinedPowerCv != null ? [property('Potência combinada', car.combinedPowerCv)] : []),
    ];
  }
  return car.power ? [{
    ...property(
      car.powerBasis === 'electric_motor' ? 'Potência do motor elétrico de tração'
        : car.powerBasis === 'combined' ? 'Potência combinada' : 'Potência',
      car.power,
    ),
    // Contrato legado preservado fora dos modelos revisados.
    unitCode: 'HWP',
  }] : [];
};
