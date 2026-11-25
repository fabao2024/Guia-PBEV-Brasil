import { useTranslation } from 'react-i18next';
import type { Car } from '../types';
import { hasPowerBreakdown } from '../utils/power';

export default function MotorPowerDetails({ car }: { car: Car }) {
  const { t } = useTranslation();
  if (!hasPowerBreakdown(car)) return null;

  const rows = [
    { key: 'electricPower', value: car.electricMotorPowerCv },
    { key: 'combustionPower', value: car.combustionPowerCv },
    { key: 'combinedPower', value: car.combinedPowerCv },
  ];
  return (
    <section aria-label={t('details.powerBreakdown')} className="mb-5 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
      <dl className="divide-y divide-white/5">
        {rows.map(({ key, value }) => (
          <div key={key} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 py-2 text-xs">
            <dt className="text-white/65">{t(`details.${key}`)}</dt>
            <dd className={value != null ? 'font-bold tabular-nums text-white' : 'text-amber-200/85'}>
              {value != null ? `${value} cv` : t('details.powerUnconfirmed')}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-white/60">{t('details.powerBreakdownNote')}</p>
    </section>
  );
}
