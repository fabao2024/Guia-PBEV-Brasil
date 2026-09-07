import { ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Car } from '../types';
import { resolveCarImageUrl } from '../utils/imageUrl';

interface CompareBarProps {
  cars: Car[];
  onRemove: (car: Car) => void;
  onClear: () => void;
  onCompare: () => void;
}
export default function CompareBar({ cars, onRemove, onClear, onCompare }: CompareBarProps) {
  const { t } = useTranslation();
  return (
    <section aria-label={t('compareBar.selection')} className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0b12]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur-xl md:p-4">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <p className="hidden shrink-0 text-sm font-semibold text-white sm:block" aria-live="polite">{t('compareBar.selectedOf3', { count: cars.length })}</p>
          {cars.map(car => <button key={`${car.brand}-${car.model}`} type="button" onClick={() => onRemove(car)}
            aria-label={t('compareBar.removeVehicle', { brand: car.brand, model: car.model })}
            title={`${car.brand} ${car.model}`}
            className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-2 text-white hover:bg-red-500/20 focus-visible:outline-2 focus-visible:outline-[#00b4ff]">
            <img src={resolveCarImageUrl(car.img, 200)} alt="" width="40" height="32" className="h-8 w-10 object-contain" />
            <X className="h-4 w-4 text-red-300" aria-hidden="true" />
          </button>)}
        </div>
        <div className="flex min-w-0 items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
          <p className="sr-only sm:hidden" aria-live="polite">{t('compareBar.selectedOf3', { count: cars.length })}</p>
          <button type="button" onClick={onClear} className="min-h-11 shrink-0 rounded-lg px-2 text-xs font-semibold text-white/80 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-[#00b4ff]">{t('compareBar.clear')}</button>
          <button type="button" onClick={onCompare} className="flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl border border-[#00b4ff] px-3 text-xs font-bold text-[#00b4ff] hover:bg-[#00b4ff] hover:text-black focus-visible:outline-2 focus-visible:outline-white sm:text-sm">
            {t('compareBar.compareNow')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
