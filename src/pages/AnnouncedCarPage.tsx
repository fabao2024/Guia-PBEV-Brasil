import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { AnnouncedCar } from '../types';
import { useJsonLd } from '../hooks/useJsonLd';
import { toSlug } from '../utils/slug';
import { announcedDateLabel } from '../utils/announcedVehicles';
import { getCarImageDimensions, resolveCarImageSrcSet, resolveCarImageUrl } from '../utils/imageUrl';

export default function AnnouncedCarPage({ car }: { car: AnnouncedCar }) {
  const { t, i18n } = useTranslation();
  const date = announcedDateLabel(car.presaleStartsOn, i18n.language);
  const title = `${car.brand} ${car.model} — ${t('announced.price')} | Guia PBEV Brasil`;
  const description = `${car.brand} ${car.model}: ${t('announced.presaleDate', { date })}. ${t('announced.price')}.`;
  const canonical = `https://guiapbev.cloud/carro/${toSlug(car.brand, car.model)}`;
  const image = `https://guiapbev.cloud${car.img}`;
  const dimensions = getCarImageDimensions(car.img);
  const number = (value: number | undefined) => value?.toLocaleString(i18n.language) ?? '—';
  // Sem Offer/price/availability: anúncio e previsão não comprovam oferta em estoque.
  useJsonLd({
    '@context': 'https://schema.org', '@type': 'Car',
    name: `${car.brand} ${car.model}`, brand: { '@type': 'Brand', name: car.brand },
    description, image, url: canonical,
  });
  return (
    <main className="min-h-screen bg-black px-4 py-6 font-sans text-white selection:bg-[#ff8c52]/30 sm:py-10">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
      </Helmet>
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="inline-flex min-h-11 items-center text-sm text-white/65 hover:text-white">
          ← {t('announced.back')}
        </Link>
        <header className="mt-5 border-l-2 border-[#ff8c52] pl-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ff8c52]">{t('announced.badge')}</p>
          <h1 className="font-display text-3xl font-bold sm:text-5xl">{car.brand} {car.model}</h1>
          <p className="mt-3 text-white/65">{t('announced.presaleDate', { date })}</p>
          <p className="mt-3 font-display text-2xl font-bold text-[#ff8c52]">{t('announced.price')}</p>
        </header>
        <img src={resolveCarImageUrl(car.img, 1280)} srcSet={resolveCarImageSrcSet(car.img)}
          sizes="(min-width: 896px) 896px, 100vw" width={dimensions?.width} height={dimensions?.height}
          alt={`${car.brand} ${car.model}`} className="my-6 w-full rounded-2xl" decoding="async" />
        <p className="rounded-xl border border-[#ff8c52]/25 bg-[#ff8c52]/5 p-4 text-sm leading-relaxed text-white/75">
          {t('announced.noCalculations')}
        </p>
        <section aria-labelledby="announced-specs" className="my-8">
          <h2 id="announced-specs" className="font-display text-xl font-bold">{t('announced.specs')}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [t('announced.power'), `${number(car.power)} cv`],
              [t('announced.traction'), car.traction],
              [t('announced.battery'), `${number(car.battery)} kWh`],
              [t('announced.range'), `${number(car.range)} km`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-[#0a0b12] p-4">
                <dt className="text-xs leading-relaxed text-white/55">{label}</dt>
                <dd className="mt-2 font-display text-lg font-bold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-white/65">{t('announced.evidenceNote')}</p>
        </section>
        <section aria-labelledby="announced-equipment">
          <h2 id="announced-equipment" className="font-display text-xl font-bold">{t('announced.equipment')}</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-white/70">
            {car.features.map(feature => <li key={feature}>{feature}</li>)}
          </ul>
        </section>
        <section aria-labelledby="announced-sources" className="my-8 border-t border-white/10 pt-6">
          <h2 id="announced-sources" className="font-display text-xl font-bold">{t('announced.sources')}</h2>
          <p className="my-3 text-sm text-white/60">
            {t('announced.reviewed', { date: announcedDateLabel(car.reviewedOn, i18n.language) })}
          </p>
          <ul className="space-y-2">
            {car.sources.map(source => <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-block min-h-11 py-2 text-sm text-[#72d7ff] underline underline-offset-4">
                {source.label}
              </a>
            </li>)}
          </ul>
          <a href={car.url} target="_blank" rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#ff8c52] px-5 py-3 text-sm font-bold text-black">
            {t('announced.official', { brand: car.brand })}
          </a>
        </section>
      </div>
    </main>
  );
}
