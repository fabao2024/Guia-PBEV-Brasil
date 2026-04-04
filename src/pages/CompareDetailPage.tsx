import { useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CAR_DB } from '../constants';
import { findCarBySlug, toSlug } from '../utils/slug';
import { ArrowLeft, Zap, BatteryCharging, CheckCircle2, XCircle } from 'lucide-react';

function imgSrc(car: (typeof CAR_DB)[0]): string {
  if (car.img.startsWith('/car-images/'))
    return `${import.meta.env.BASE_URL}${car.img.substring(1)}`;
  if (car.img.includes('wikimedia.org')) return car.img;
  return `https://images.weserv.nl/?url=${encodeURIComponent(car.img.replace(/^https?:\/\//, ''))}&w=800&q=80&output=webp`;
}

function fmt(v: number | undefined | null, suffix = ''): string {
  if (v == null) return '—';
  return `${v.toLocaleString('pt-BR')}${suffix}`;
}

interface RowProps {
  label: string;
  a: string | number | undefined | null;
  b: string | number | undefined | null;
  higherIsBetter?: boolean;
  suffix?: string;
}

function CompareRow({ label, a, b, higherIsBetter = true, suffix = '' }: RowProps) {
  const aNum = typeof a === 'number' ? a : null;
  const bNum = typeof b === 'number' ? b : null;

  let aWin = false;
  let bWin = false;
  if (aNum != null && bNum != null && aNum !== bNum) {
    aWin = higherIsBetter ? aNum > bNum : aNum < bNum;
    bWin = !aWin;
  }

  const aStr = typeof a === 'number' ? `${a.toLocaleString('pt-BR')}${suffix}` : (a ?? '—');
  const bStr = typeof b === 'number' ? `${b.toLocaleString('pt-BR')}${suffix}` : (b ?? '—');

  return (
    <tr className="border-b border-white/5">
      <td className="py-3 px-4 text-white/40 text-xs text-center w-[30%]">{label}</td>
      <td className={`py-3 px-4 text-sm font-semibold text-center w-[35%] ${aWin ? 'text-[#00e5a0]' : 'text-white/80'}`}>
        {aWin && <span className="mr-1 text-[10px]">✓</span>}{aStr}
      </td>
      <td className={`py-3 px-4 text-sm font-semibold text-center w-[35%] ${bWin ? 'text-[#00e5a0]' : 'text-white/80'}`}>
        {bWin && <span className="mr-1 text-[10px]">✓</span>}{bStr}
      </td>
    </tr>
  );
}

export default function CompareDetailPage() {
  const { slugA, slugB } = useParams<{ slugA: string; slugB: string }>();

  const carA = useMemo(() => (slugA ? findCarBySlug(slugA, CAR_DB) : undefined), [slugA]);
  const carB = useMemo(() => (slugB ? findCarBySlug(slugB, CAR_DB) : undefined), [slugB]);

  useEffect(() => { window.scrollTo(0, 0); }, [slugA, slugB]);

  // Similar cars for "compare with" links
  const similar = useMemo(() => {
    if (!carA) return [];
    return CAR_DB
      .filter(c => c.cat === carA.cat && toSlug(c.brand, c.model) !== slugA && toSlug(c.brand, c.model) !== slugB)
      .slice(0, 6);
  }, [carA, slugA, slugB]);

  if (!carA || !carB) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white/60">
        <p>Veículo não encontrado.</p>
        <Link to="/" className="text-[#00b4ff] hover:underline text-sm">← Voltar ao catálogo</Link>
      </div>
    );
  }

  const title = `${carA.brand} ${carA.model} vs ${carB.brand} ${carB.model} — Comparativo PBEV Brasil`;
  const description = `Compare ${carA.brand} ${carA.model} e ${carB.brand} ${carB.model}: autonomia PBEV, potência, bateria, carregamento e preço. Dados oficiais INMETRO.`;
  const canonicalUrl = `https://guiapbev.cloud/comparar/${slugA}/${slugB}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    url: canonicalUrl,
    itemListElement: [carA, carB].map((car, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${car.brand} ${car.model}`,
      url: `https://guiapbev.cloud/carro/${toSlug(car.brand, car.model)}`,
    })),
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={imgSrc(carA)} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Back */}
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
          </Link>

          {/* Header */}
          <h1 className="text-xl md:text-2xl font-black text-white mb-1">
            {carA.brand} {carA.model}{' '}
            <span className="text-white/30">vs</span>{' '}
            {carB.brand} {carB.model}
          </h1>
          <p className="text-white/40 text-sm mb-8">Comparativo PBEV · Dados INMETRO</p>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[carA, carB].map(car => (
              <Link key={toSlug(car.brand, car.model)} to={`/carro/${toSlug(car.brand, car.model)}`}
                className="group bg-white/3 rounded-2xl overflow-hidden border border-white/8 hover:border-[#00b4ff]/30 transition-colors">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={imgSrc(car)}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="text-white font-bold text-sm">{car.brand} {car.model}</p>
                  <p className="text-white/40 text-xs">{car.cat}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Comparison table */}
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-white/30 text-xs font-normal text-center"></th>
                  <th className="py-3 px-4 text-white font-bold text-sm text-center">{carA.brand} {carA.model}</th>
                  <th className="py-3 px-4 text-white font-bold text-sm text-center">{carB.brand} {carB.model}</th>
                </tr>
              </thead>
              <tbody>
                <CompareRow label="Preço estimado" a={carA.price} b={carB.price} higherIsBetter={false} suffix=" R$" />
                <CompareRow label="Autonomia PBEV" a={carA.range} b={carB.range} suffix=" km" />
                <CompareRow label="Potência" a={carA.power} b={carB.power} suffix=" cv" />
                <CompareRow label="Torque" a={carA.torque} b={carB.torque} suffix=" kgfm" />
                <CompareRow label="Bateria" a={carA.battery} b={carB.battery} suffix=" kWh" />
                <CompareRow label="Recarga AC" a={carA.chargeAC} b={carB.chargeAC} suffix=" kW" />
                <CompareRow label="Recarga DC" a={carA.chargeDC ?? undefined} b={carB.chargeDC ?? undefined} suffix=" kW" />
                <CompareRow label="Garantia veículo" a={carA.warrantyYears} b={carB.warrantyYears} suffix=" anos" />
                <CompareRow label="Garantia bateria" a={carA.warrantyBatteryYears} b={carB.warrantyBatteryYears} suffix=" anos" />
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-white/40 text-xs text-center">Tração</td>
                  <td className="py-3 px-4 text-sm text-center text-white/80">{carA.traction ?? '—'}</td>
                  <td className="py-3 px-4 text-sm text-center text-white/80">{carB.traction ?? '—'}</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 text-white/40 text-xs text-center">Recarga rápida DC</td>
                  <td className="py-3 px-4 text-center">
                    {carA.chargeDC
                      ? <CheckCircle2 className="w-4 h-4 text-[#00e5a0] mx-auto" />
                      : <XCircle className="w-4 h-4 text-white/20 mx-auto" />}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {carB.chargeDC
                      ? <CheckCircle2 className="w-4 h-4 text-[#00e5a0] mx-auto" />
                      : <XCircle className="w-4 h-4 text-white/20 mx-auto" />}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white/40 text-xs text-center">PBE Inmetro</td>
                  <td className="py-3 px-4 text-center">
                    {carA.pbeRating
                      ? <span className="inline-block px-2 py-0.5 rounded font-bold text-xs text-black" style={{ background: { A:'#00a651',B:'#8dc63f',C:'#f9e400',D:'#f7941e',E:'#ed1c24' }[carA.pbeRating] ?? '#888' }}>{carA.pbeRating}</span>
                      : <span className="text-white/30 text-sm">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {carB.pbeRating
                      ? <span className="inline-block px-2 py-0.5 rounded font-bold text-xs text-black" style={{ background: { A:'#00a651',B:'#8dc63f',C:'#f9e400',D:'#f7941e',E:'#ed1c24' }[carB.pbeRating] ?? '#888' }}>{carB.pbeRating}</span>
                      : <span className="text-white/30 text-sm">—</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Detail links */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {[carA, carB].map(car => (
              <Link key={toSlug(car.brand, car.model)}
                to={`/carro/${toSlug(car.brand, car.model)}`}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 hover:border-[#00b4ff]/40 hover:bg-[#00b4ff]/5 text-white/60 hover:text-white text-sm transition-all">
                <Zap className="w-3.5 h-3.5" />
                Ver ficha completa — {car.brand} {car.model}
              </Link>
            ))}
          </div>

          {/* Similar comparisons */}
          {similar.length > 0 && (
            <div>
              <h2 className="text-white/50 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <BatteryCharging className="w-3.5 h-3.5" /> Outros comparativos com {carA.brand} {carA.model}
              </h2>
              <div className="flex flex-wrap gap-2">
                {similar.map(car => (
                  <Link
                    key={toSlug(car.brand, car.model)}
                    to={`/comparar/${slugA}/${toSlug(car.brand, car.model)}`}
                    className="px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 hover:border-[#00b4ff]/30 hover:bg-[#00b4ff]/5 text-white/60 hover:text-white text-xs transition-all"
                  >
                    vs {car.brand} {car.model}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
