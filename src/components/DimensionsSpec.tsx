import { useTranslation } from 'react-i18next';
import { Ruler } from 'lucide-react';
import { Car } from '../types';
import { fmtNum, hasDimensions } from '../utils/dimensions';

interface DimensionsSpecProps {
  car: Car;
  accent: string;
  headingLevel?: 2 | 3;
  className?: string;
}

export default function DimensionsSpec({ car, accent, headingLevel = 3, className = '' }: DimensionsSpecProps) {
  const { t } = useTranslation();

  if (!hasDimensions(car)) return null;

  const items = [
    car.lengthMm !== undefined && { key: 'length', value: fmtNum(car.lengthMm), unit: 'mm' },
    car.widthMm !== undefined && { key: 'width', value: fmtNum(car.widthMm), unit: 'mm' },
    car.heightMm !== undefined && { key: 'height', value: fmtNum(car.heightMm), unit: 'mm' },
    car.wheelbaseMm !== undefined && { key: 'wheelbase', value: fmtNum(car.wheelbaseMm), unit: 'mm' },
    car.groundClearanceMm !== undefined && { key: 'groundClearance', value: fmtNum(car.groundClearanceMm), unit: 'mm' },
    car.weightKg !== undefined && { key: 'weight', value: fmtNum(car.weightKg), unit: 'kg' },
    car.trunkLiters !== undefined && { key: 'trunk', value: fmtNum(car.trunkLiters), unit: 'L' },
  ].filter(Boolean) as Array<{ key: string; value: string; unit: string }>;

  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <section className={className}>
      <Heading
        className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
        style={{ color: accent }}
      >
        <Ruler className="w-3.5 h-3.5" aria-hidden="true" />
        {t('details.dimensions', 'Dimensões')}
      </Heading>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map(item => (
          <div
            key={item.key}
            className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {t(`details.${item.key}`, '')}
            </div>
            <div className="text-xl font-black text-white leading-none">
              {item.value}
              <span className="text-sm font-normal ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[9px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
        {t('details.dimensionsNote', 'Largura sem espelhos · peso em ordem de marcha · porta-malas VDA · altura do solo desalicerada')}
      </p>
    </section>
  );
}
