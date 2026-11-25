import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import type { AnnouncedCar } from '../types';
import { toSlug } from '../utils/slug';
import { announcedDateLabel } from '../utils/announcedVehicles';
import { getCarImageDimensions, resolveCarImageSrcSet, resolveCarImageUrl } from '../utils/imageUrl';

export default function AnnouncedCarCard({ car }: { car: AnnouncedCar }) {
  const { t, i18n } = useTranslation();
  const dimensions = getCarImageDimensions(car.img);
  return (
    <article className="overflow-hidden rounded-2xl border border-[#ff8c52]/25 bg-[#0a0b12]">
      <div className="flex flex-col sm:flex-row">
        <Link to={`/carro/${toSlug(car.brand, car.model)}`}
          aria-label={t('card.viewDetails', { brand: car.brand, model: car.model })}
          className="block sm:w-2/5 shrink-0 bg-[#111217] focus-visible:outline-2 focus-visible:outline-[#ff8c52]">
          <img src={resolveCarImageUrl(car.img, 800)} srcSet={resolveCarImageSrcSet(car.img)}
            sizes="(min-width: 640px) 400px, 90vw" alt={`${car.brand} ${car.model}`}
            width={dimensions?.width} height={dimensions?.height} loading="lazy" decoding="async"
            className="h-full max-h-64 w-full object-contain" />
        </Link>
        <div className="flex flex-1 flex-col items-start gap-3 p-4 sm:p-6">
          <span className="rounded-full border border-[#ff8c52]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#ff8c52]">
            {t('announced.badge')}
          </span>
          <h3 className="font-display text-xl font-bold text-white">{car.brand} {car.model}</h3>
          <p className="text-sm text-white/65">
            {t('announced.presaleDate', { date: announcedDateLabel(car.presaleStartsOn, i18n.language) })}
          </p>
          <p className="font-display text-lg font-bold text-[#ff8c52]">{t('announced.price')}</p>
          <p className="text-xs leading-relaxed text-white/55">{t('announced.cardNote')}</p>
          <Link to={`/carro/${toSlug(car.brand, car.model)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5">
            {t('announced.viewDetails')} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
