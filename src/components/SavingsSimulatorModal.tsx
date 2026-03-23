import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronDown, Download, TrendingDown, Zap, Info } from 'lucide-react';
import { CAR_DB } from '../constants';
import { Car } from '../types';
import { IPVA_BY_STATE, calcIpva, STANDARD_COMBUSTION_IPVA_RATE, IPVA_DATA_UPDATED } from '../constants/ipvaByState';
import { FUEL_PRICES_BY_STATE, FUEL_PRICES_UPDATED, getDefaultFuelPrice } from '../constants/fuelPricesByState';
import { ELECTRICITY_PRICES_BY_STATE, ELECTRICITY_PRICES_UPDATED, getDefaultElectricityPrice } from '../constants/electricityPricesByState';
import { track } from '../utils/analytics';
import { calcTCO, TCOResult, FuelType, ETHANOL_FACTOR } from '../utils/tco';

function drawTCOImage(car: Car, tco: TCOResult, selectedState: string, fuelType: FuelType): string {
    const tableTop = 166;
    const rowH = 34;
    const numDataRows = 4; // Energia, Seguro, Manutenção, IPVA
    const tableHeight = rowH + numDataRows * rowH * 2 + rowH; // header + data pairs + savings
    const W = 900, H = tableTop + tableHeight + 48;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#08090e';
    ctx.fillRect(0, 0, W, H);

    // Header bar
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#006ce5'); grad.addColorStop(1, '#00b4ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 6);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    const fuelLabel = fuelType === 'ethanol' ? 'Etanol' : 'Gasolina';
    ctx.fillText(`${car.brand} ${car.model} — TCO 4 Anos (${fuelLabel})`, 32, 48);
    ctx.fillStyle = '#00b4ff';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(`Custo Total de Propriedade vs. combustão equivalente (${car.cat}) · Estado: ${selectedState}`, 32, 70);

    // Summary tiles: custo/km EV | custo/km Comb | economia 4 anos
    ctx.fillStyle = 'rgba(0,180,255,0.08)';
    ctx.roundRect(32, 88, 240, 52, 10);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,180,255,0.5)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('CUSTO/KM — EV', 44, 106);
    ctx.fillStyle = '#00b4ff';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`R$ ${tco.costPerKmEV.toFixed(2).replace('.', ',')}`, 44, 128);

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.roundRect(284, 88, 240, 52, 10);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(`CUSTO/KM — ${fuelLabel.toUpperCase()}`, 296, 106);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`R$ ${tco.costPerKmComb.toFixed(2).replace('.', ',')}`, 296, 128);

    ctx.fillStyle = 'rgba(0,229,160,0.12)';
    ctx.roundRect(536, 88, 332, 52, 10);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,229,160,0.6)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('ECONOMIA EM 4 ANOS', 548, 106);
    ctx.fillStyle = '#00e5a0';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(`R$ ${tco.totalSavings4y.toLocaleString('pt-BR')}`, 548, 130);

    // Table setup
    const colW = 140;
    const labelW = 150;
    const cols = ['', 'Ano 1', 'Ano 2', 'Ano 3', 'Ano 4', 'Total 4a'];

    // Header row
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(32, tableTop, W - 64, rowH);
    cols.forEach((col, i) => {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = 'bold 11px system-ui, sans-serif';
        const x = i === 0 ? 44 : labelW + 32 + (i - 1) * colW + colW / 2;
        if (i === 0) ctx.textAlign = 'left'; else ctx.textAlign = 'center';
        ctx.fillText(col, x, tableTop + 22);
    });
    ctx.textAlign = 'left';

    const rows: { label: string; evKey: keyof typeof tco.years[0]; combKey: keyof typeof tco.years[0] }[] = [
        { label: 'Energia',    evKey: 'energyEV',    combKey: 'energyComb'    },
        { label: 'Seguro',     evKey: 'insuranceEV', combKey: 'insuranceComb' },
        { label: 'Manutenção', evKey: 'maintEV',     combKey: 'maintComb'     },
        { label: 'IPVA',       evKey: 'ipvaEV',      combKey: 'ipvaComb'      },
    ];

    rows.forEach((row, ri) => {
        const yEV   = tableTop + rowH + ri * (rowH * 2);
        const yComb = yEV + rowH;

        ctx.fillStyle = ri % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent';
        ctx.fillRect(32, yEV, W - 64, rowH);
        ctx.fillStyle = '#00b4ff';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(row.label, 44, yEV + 22);

        ctx.fillStyle = ri % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent';
        ctx.fillRect(32, yComb, W - 64, rowH);

        const totalEV   = tco.years.reduce((s, y) => s + (y[row.evKey]   as number), 0);
        const totalComb = tco.years.reduce((s, y) => s + (y[row.combKey] as number), 0);

        [0, 1, 2, 3].forEach(yi => {
            const x = labelW + 32 + yi * colW + colW / 2;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#00b4ff'; ctx.font = '11px system-ui, sans-serif';
            ctx.fillText(`R$${Math.round(tco.years[yi][row.evKey] as number).toLocaleString('pt-BR')}`, x, yEV + 22);
            ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px system-ui, sans-serif';
            ctx.fillText(`R$${Math.round(tco.years[yi][row.combKey] as number).toLocaleString('pt-BR')}`, x, yComb + 22);
        });
        const tx = labelW + 32 + 4 * colW + colW / 2;
        ctx.fillStyle = '#00b4ff'; ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(`R$${Math.round(totalEV).toLocaleString('pt-BR')}`, tx, yEV + 22);
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px system-ui, sans-serif';
        ctx.fillText(`R$${Math.round(totalComb).toLocaleString('pt-BR')}`, tx, yComb + 22);
        ctx.textAlign = 'left';
    });

    // Savings row
    const savingsY = tableTop + rowH + rows.length * rowH * 2;
    ctx.fillStyle = 'rgba(0,229,160,0.08)';
    ctx.fillRect(32, savingsY, W - 64, rowH);
    ctx.strokeStyle = 'rgba(0,229,160,0.2)';
    ctx.strokeRect(32, savingsY, W - 64, rowH);
    ctx.fillStyle = '#00e5a0'; ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('Economia EV', 44, savingsY + 22);
    tco.years.forEach((y, yi) => {
        ctx.textAlign = 'center';
        const x = labelW + 32 + yi * colW + colW / 2;
        ctx.fillStyle = '#00e5a0'; ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText(`R$${Math.round(y.savingsEV).toLocaleString('pt-BR')}`, x, savingsY + 22);
    });
    ctx.textAlign = 'center';
    const tx2 = labelW + 32 + 4 * colW + colW / 2;
    ctx.fillStyle = '#00e5a0'; ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(`R$${tco.totalSavings4y.toLocaleString('pt-BR')}`, tx2, savingsY + 22);
    ctx.textAlign = 'left';

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('guiapbev.cloud · Estimativas baseadas em médias de mercado. Consulte seguradora e concessionária para valores reais.', 32, H - 16);

    return canvas.toDataURL('image/png');
}

interface SavingsSimulatorModalProps {
    onClose: () => void;
    initialCars?: Car[];
}

type Tab = 'savings' | 'tco';

export default function SavingsSimulatorModal({ onClose, initialCars = [] }: SavingsSimulatorModalProps) {
    const { t } = useTranslation();
    const tcoRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [methodologyOpen, setMethodologyOpen] = useState(false);

    // ── Shared state ──────────────────────────────────────────────────────────
    const [tab, setTab] = useState<Tab>('savings');
    const [kms, setKms] = useState<number>(1500);
    const [gasPrice, setGasPrice] = useState<number>(() => getDefaultFuelPrice(localStorage.getItem('selectedState') ?? 'SP', 'gasoline'));
    const [kwhPrice, setKwhPrice] = useState<number>(() => getDefaultElectricityPrice(localStorage.getItem('selectedState') ?? 'SP'));
    const [dcKwhPrice, setDcKwhPrice] = useState<number>(2.50);
    const [dcPercent, setDcPercent] = useState<number>(20);
    const [currency, setCurrency] = useState<'BRL' | 'USD'>('BRL');
    const [selectedState, setSelectedState] = useState<string>(
        () => localStorage.getItem('selectedState') ?? 'SP'
    );
    const [selectedCars, setSelectedCars] = useState<(Car | null)[]>(() => {
        // Priority: initialCars (compareList or lastViewed) → CAR_DB[0] in slot 1
        const base = initialCars.length > 0 ? initialCars : [CAR_DB[0] ?? null];
        return [base[0] ?? null, base[1] ?? null, base[2] ?? null];
    });

    // ── Custom consumption overrides — per-car (Option C) ────────────────────
    const [customEvKwh, setCustomEvKwh] = useState<(number | null)[]>([null, null, null]);
    const [customCombKmL, setCustomCombKmL] = useState<(number | null)[]>([null, null, null]);
    const [customOpen, setCustomOpen] = useState<boolean[]>([false, false, false]);

    // ── Tipo de combustível ───────────────────────────────────────────────────
    const [fuelType, setFuelType] = useState<FuelType>('gasoline');

    useEffect(() => { localStorage.setItem('selectedState', selectedState); }, [selectedState]);
    useEffect(() => { setGasPrice(getDefaultFuelPrice(selectedState, fuelType)); }, [selectedState, fuelType]);
    useEffect(() => { setKwhPrice(getDefaultElectricityPrice(selectedState)); }, [selectedState]);
    useEffect(() => { track('Simulator Used', { state: selectedState }); }, []); // eslint-disable-line react-hooks/exhaustive-deps


    const handleCurrencyChange = (newCurrency: 'BRL' | 'USD') => {
        if (currency === newCurrency) return;
        const rate = 5.5;
        if (newCurrency === 'USD') {
            setGasPrice(Number((gasPrice / rate).toFixed(2)));
            setKwhPrice(Number((kwhPrice / rate).toFixed(2)));
            setDcKwhPrice(Number((dcKwhPrice / rate).toFixed(2)));
        } else {
            setGasPrice(Number((gasPrice * rate).toFixed(2)));
            setKwhPrice(Number((kwhPrice * rate).toFixed(2)));
            setDcKwhPrice(Number((dcKwhPrice * rate).toFixed(2)));
        }
        setCurrency(newCurrency);
    };

    const currencySymbol = currency === 'BRL' ? 'R$' : '$';
    const blendedKwhPrice = (kwhPrice * (1 - dcPercent / 100)) + (dcKwhPrice * (dcPercent / 100));

    const handleCarSelect = (index: number, model: string) => {
        const car = CAR_DB.find(c => c.model === model) || null;
        const next = [...selectedCars]; next[index] = car; setSelectedCars(next);
        setCustomEvKwh(v => { const n = [...v]; n[index] = null; return n; });
        setCustomCombKmL(v => { const n = [...v]; n[index] = null; return n; });
        setCustomOpen(v => { const n = [...v]; n[index] = false; return n; });
    };

    const getEfficiency = (car: Car, idx: number) => {
        const custom = customEvKwh[idx];
        if (custom !== null) return custom;
        if (car.cat === 'Urbano') return 12;
        if (car.cat === 'SUV') return 16;
        if (car.cat === 'Luxo') return 21;
        if (car.cat === 'Comercial') return 22;
        return 14;
    };
    // Returns BASE gasoline km/L by category (PBEV/INMETRO reference)
    const getCombustionKmL = (car: Car) => {
        if (car.cat === 'Urbano') return 12.0;
        if (car.cat === 'SUV') return 9.5;
        if (car.cat === 'Luxo') return 8.0;
        if (car.cat === 'Comercial') return 7.5;
        return 11.0;
    };
    // customCombKmL stores the EFFECTIVE value (already ethanol-adjusted when set).
    const effectiveCombKmL = (car: Car, idx: number) => {
        const custom = customCombKmL[idx];
        if (custom !== null) return custom;
        return fuelType === 'ethanol' ? getCombustionKmL(car) / ETHANOL_FACTOR : getCombustionKmL(car);
    };

    // Reset all custom combustion values when fuel type changes
    useEffect(() => { setCustomCombKmL([null, null, null]); }, [fuelType]);

    const savingsArray = selectedCars.map((car, idx) => {
        if (!car) return 0;
        const evCost = Math.round((kms / 100) * getEfficiency(car, idx) * blendedKwhPrice);
        const gasCost = Math.round((kms / effectiveCombKmL(car, idx)) * gasPrice);
        return (gasCost - evCost) * 12;
    });
    const maxSavings = Math.max(...savingsArray);
    const bestIndex = savingsArray.indexOf(maxSavings);

    const makeSliderStyle = (value: number, min: number, max: number) => ({
        background: `linear-gradient(to right, #00b4ff ${(value - min) / (max - min) * 100}%, rgba(255,255,255,0.2) ${(value - min) / (max - min) * 100}%)`
    });
    const sliderThumbClasses = "hidden md:block w-full h-1.5 rounded-lg appearance-none cursor-pointer touch-pan-y [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,180,255,0.5)] [&::-webkit-slider-thumb]:cursor-pointer";
    const stepBtn = "md:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white font-bold text-base active:scale-95 transition-all select-none";

    const handleExportTCO = useCallback(() => {
        const cars = selectedCars.filter(Boolean) as Car[];
        if (cars.length === 0) return;
        setIsExporting(true);
        try {
            cars.forEach((car, carI) => {
                const origIdx = selectedCars.indexOf(car);
                const slotIdx = origIdx >= 0 ? origIdx : carI;
                const tco = calcTCO(car, { kms, gasPrice, blendedKwhPrice, fuelType, selectedState, customEvKwh: customEvKwh[slotIdx], customCombKmL: customCombKmL[slotIdx] });
                const dataUrl = drawTCOImage(car, tco, selectedState, fuelType);
                const link = document.createElement('a');
                link.download = `tco-${car.model.toLowerCase().replace(/\s+/g, '-')}.png`;
                link.href = dataUrl;
                link.click();
            });
            track('TCO Export', { cars: cars.map(c => c.model).join(',') });
        } catch (e) {
            console.error('TCO export failed:', e);
            alert('Não foi possível exportar. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    }, [selectedCars, kms, gasPrice, blendedKwhPrice, fuelType, selectedState]);

    const fmtBRL = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;

    return (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-0 sm:p-6">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="bg-[#0a0b12] w-full sm:max-w-md md:max-w-4xl sm:rounded-[40px] shadow-[0_0_50px_rgba(0,180,255,0.15)] relative z-10 flex flex-col border border-white/5 mx-auto my-0 sm:my-6">

                <div className="absolute inset-0 opacity-10 pointer-events-none sm:rounded-[40px]" style={{
                    backgroundImage: 'radial-gradient(#00b4ff 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }} />

                <div className="relative z-10 p-5 md:p-8 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={onClose} className="p-2 text-[#00b4ff] hover:text-white transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl md:text-2xl font-black text-white text-center leading-tight">
                            {t('simulator.title')}<br /><span className="hidden md:inline text-[#00b4ff]">{t('simulator.titlePBEV')}</span>
                        </h2>
                        <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-white/10">
                            <button onClick={() => handleCurrencyChange('BRL')} className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${currency === 'BRL' ? 'bg-[#00b4ff] text-black shadow-[0_0_10px_rgba(0,180,255,0.5)]' : 'text-[#a0a0a0] hover:text-white'}`}>R$</button>
                            <button onClick={() => handleCurrencyChange('USD')} className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${currency === 'USD' ? 'bg-[#00b4ff] text-black shadow-[0_0_10px_rgba(0,180,255,0.5)]' : 'text-[#a0a0a0] hover:text-white'}`}>$</button>
                        </div>
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-2 mb-6 bg-[#111]/80 rounded-2xl p-1 border border-white/8">
                        <button
                            onClick={() => setTab('savings')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${tab === 'savings' ? 'bg-[#00b4ff] text-black shadow-[0_0_12px_rgba(0,180,255,0.4)]' : 'text-[#a0a0a0] hover:text-white'}`}
                        >
                            <Zap className="w-3.5 h-3.5" />
                            {t('simulator.savingsTab')}
                        </button>
                        <button
                            onClick={() => setTab('tco')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${tab === 'tco' ? 'bg-[#00e5a0] text-black shadow-[0_0_12px_rgba(0,229,160,0.4)]' : 'text-[#a0a0a0] hover:text-white'}`}
                        >
                            <TrendingDown className="w-3.5 h-3.5" />
                            {t('simulator.tcoTab')}
                        </button>
                    </div>

                    {/* ── METHODOLOGY BADGE ROW ──────────────────────────────────────────── */}
                    <div className="flex items-center justify-center gap-1.5 -mt-3 mb-5 flex-wrap">
                        {tab === 'savings' ? (<>
                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: '#00b4ff', background: 'rgba(0,180,255,0.08)', border: '1px solid rgba(0,180,255,0.2)' }}><Zap className="w-2.5 h-2.5" />Energia</span>
                            <span className="text-xs text-white/18 line-through px-1.5 py-0.5 rounded-full border border-white/6">Seguro</span>
                            <span className="text-xs text-white/18 line-through px-1.5 py-0.5 rounded-full border border-white/6">Manutenção</span>
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-white/10" style={{ color: 'rgba(255,255,255,0.35)' }}>IPVA <span className="text-[9px] opacity-60 ml-0.5">separado</span></span>
                        </>) : (<>
                            {['Energia','Seguro','Manutenção','IPVA'].map(label => (
                                <span key={label} className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: '#00e5a0', background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)' }}>{label}</span>
                            ))}
                        </>)}
                    </div>

                    {/* ── SHARED SLIDERS ─────────────────────────────────────────────────── */}
                    <div className="bg-[#111111]/80 backdrop-blur-md border-[2px] border-white/10 rounded-3xl p-5 md:p-6 mb-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.05),0_0_30px_rgba(0,180,255,0.1)] space-y-6">

                        {/* State selector */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm">{t('ipva.title')}</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">
                                    {(() => { const s = IPVA_BY_STATE.find(s => s.abbr === selectedState); return s ? (s.bevRate === 0 ? 'Isento' : `${(s.bevRate * 100).toFixed(1)}%`) : '—'; })()}
                                </div>
                            </div>
                            <div className="relative">
                                <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="w-full appearance-none bg-[#1a1a1a] border border-white/20 text-white text-sm font-bold rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-[#00b4ff] transition-colors">
                                    {IPVA_BY_STATE.map(s => (
                                        <option key={s.abbr} value={s.abbr} style={{ background: '#1a1a1a' }}>
                                            {s.abbr} — {s.name} · {s.bevRate === 0 ? 'Isento' : `${(s.bevRate * 100).toFixed(1)}%`}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-[#a0a0a0] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <p className="text-xs text-[#555] mt-2 text-right">{'⚠'} Dados de {IPVA_DATA_UPDATED}. Consulte a Sefaz do seu estado.</p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm">{t('simulator.monthlyKms')}</span>
                                <div className="flex items-center gap-1.5">
                                    <button className={stepBtn} onClick={() => setKms(k => Math.max(100, k - 100))}>−</button>
                                    <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{kms.toLocaleString()} km</div>
                                    <button className={stepBtn} onClick={() => setKms(k => Math.min(10000, k + 100))}>+</button>
                                </div>
                            </div>
                            <input type="range" min="100" max="10000" step="100" value={kms} onChange={e => setKms(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(kms, 100, 10000)} />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-sm">{fuelType === 'ethanol' ? t('simulator.ethanolPrice') : t('simulator.gasPrice')}</span>
                                    <div className="flex bg-[#1a1a1a] rounded-lg p-0.5 border border-white/10">
                                        <button onClick={() => setFuelType('gasoline')} className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${fuelType === 'gasoline' ? 'bg-[#ff8c52] text-black' : 'text-[#a0a0a0] hover:text-white'}`}>{t('simulator.gasoline')}</button>
                                        <button onClick={() => setFuelType('ethanol')} className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${fuelType === 'ethanol' ? 'bg-[#00e5a0] text-black' : 'text-[#a0a0a0] hover:text-white'}`}>{t('simulator.ethanol')}</button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button className={stepBtn} onClick={() => setGasPrice(p => Math.max(1, Math.round((p - 0.10) * 100) / 100))}>−</button>
                                    <div className={`px-3 py-1 rounded-full font-mono text-sm transition-colors ${fuelType === 'ethanol' ? 'bg-[#00e5a0]/10 border border-[#00e5a0]/40 text-[#00e5a0]' : 'bg-[#ff8c52]/10 border border-[#ff8c52]/40 text-[#ff8c52]'}`}>{currencySymbol} {gasPrice.toFixed(2).replace('.', ',')}</div>
                                    <button className={stepBtn} onClick={() => setGasPrice(p => Math.min(10, Math.round((p + 0.10) * 100) / 100))}>+</button>
                                </div>
                            </div>
                            <input type="range" min="1" max="10" step="0.05" value={gasPrice} onChange={e => setGasPrice(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(gasPrice, 1, 10)} />
                            {(() => {
                                const ref = getDefaultFuelPrice(selectedState, fuelType);
                                const label = fuelType === 'ethanol' ? 'etanol' : 'gasolina';
                                return (
                                    <p className="text-xs text-white/30 mt-1.5">
                                        Média {selectedState}: {currencySymbol} {ref.toFixed(2).replace('.', ',')} /L ({label}) · ANP {FUEL_PRICES_UPDATED}
                                        {fuelType === 'ethanol' && <span className="text-[#00e5a0]/60"> · +30% consumo vs. gasolina</span>}
                                    </p>
                                );
                            })()}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm">{t('simulator.kwhPrice')} /kWh</span>
                                <div className="flex items-center gap-1.5">
                                    <button className={stepBtn} onClick={() => setKwhPrice(p => Math.max(0, Math.round((p - 0.05) * 100) / 100))}>−</button>
                                    <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{currencySymbol} {kwhPrice.toFixed(2).replace('.', ',')}</div>
                                    <button className={stepBtn} onClick={() => setKwhPrice(p => Math.min(10, Math.round((p + 0.05) * 100) / 100))}>+</button>
                                </div>
                            </div>
                            <input type="range" min="0" max="10" step="0.05" value={kwhPrice} onChange={e => setKwhPrice(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(kwhPrice, 0, 10)} />
                            <p className="text-xs text-white/30 mt-1.5">
                                Média {selectedState}: {currencySymbol} {ELECTRICITY_PRICES_BY_STATE[selectedState]?.toFixed(2).replace('.', ',') ?? '—'} /kWh (B1 residencial, sem ICMS) · ANEEL {ELECTRICITY_PRICES_UPDATED}
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm">{t('simulator.dcKwhPrice')} /kWh</span>
                                <div className="flex items-center gap-1.5">
                                    <button className={stepBtn} onClick={() => setDcKwhPrice(p => Math.max(0, Math.round((p - 0.05) * 100) / 100))}>−</button>
                                    <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{currencySymbol} {dcKwhPrice.toFixed(2).replace('.', ',')}</div>
                                    <button className={stepBtn} onClick={() => setDcKwhPrice(p => Math.min(10, Math.round((p + 0.05) * 100) / 100))}>+</button>
                                </div>
                            </div>
                            <input type="range" min="0" max="10" step="0.05" value={dcKwhPrice} onChange={e => setDcKwhPrice(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(dcKwhPrice, 0, 10)} />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm">{t('simulator.dcPercent')}</span>
                                <div className="flex items-center gap-1.5">
                                    <button className={stepBtn} onClick={() => setDcPercent(p => Math.max(0, p - 5))}>−</button>
                                    <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{dcPercent}%</div>
                                    <button className={stepBtn} onClick={() => setDcPercent(p => Math.min(100, p + 5))}>+</button>
                                </div>
                            </div>
                            <input type="range" min="0" max="100" step="5" value={dcPercent} onChange={e => setDcPercent(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(dcPercent, 0, 100)} />
                            <p className="text-xs text-[#666666] mt-2 text-right">
                                {t('simulator.blendedRate')}: {currencySymbol} {blendedKwhPrice.toFixed(2).replace('.', ',')}/kWh
                            </p>
                        </div>


                    </div>

                    {/* ── TAB: ECONOMIA MENSAL ───────────────────────────────────────────── */}
                    {tab === 'savings' && (
                        <div className="flex flex-col md:flex-row gap-4">
                            {selectedCars.map((car, idx) => {
                                const isBest = car && idx === bestIndex && maxSavings > 0;
                                const efficiency = car ? getEfficiency(car, idx) : 0;
                                const combustionKmL = car ? effectiveCombKmL(car, idx) : 0;
                                const evCost = car ? Math.round((kms / 100) * efficiency * blendedKwhPrice) : 0;
                                const gasCost = car ? Math.round((kms / combustionKmL) * gasPrice) : 0;
                                const monthlySavings = gasCost - evCost;
                                const annualSavings = monthlySavings * 12;
                                const costPerKm = kms > 0 ? evCost / kms : 0;
                                const ipvaStateInfo = IPVA_BY_STATE.find(s => s.abbr === selectedState) ?? IPVA_BY_STATE.find(s => s.abbr === 'SP')!;
                                const annualIpvaBev = car ? calcIpva(car.price, ipvaStateInfo) : 0;
                                const annualIpvaCombustion = car ? Math.round(car.price * STANDARD_COMBUSTION_IPVA_RATE) : 0;
                                const ipvaSavings = annualIpvaCombustion - annualIpvaBev;
                                const maxCost = Math.max(gasCost, 1000);
                                const evHeight = car ? `${(evCost / maxCost) * 100}%` : '5%';
                                const gasHeight = car ? `${(gasCost / maxCost) * 100}%` : '5%';

                                return (
                                    <div key={idx} className={`relative w-full md:w-1/3 flex flex-col items-center bg-[#111111] rounded-3xl p-4 md:p-5 overflow-hidden ${isBest ? 'border-[2px] border-[#00b4ff] shadow-[0_0_20px_rgba(0,180,255,0.3)]' : 'border border-white/10'}`}>
                                        {isBest && (
                                            <div className="absolute -top-6 -right-8 bg-[#00b4ff] text-black text-[10px] font-black tracking-widest uppercase transform rotate-45 py-8 w-32 text-center shadow-lg z-20">
                                                <span className="block mt-4 whitespace-pre-line">{t('simulator.bestSavings')}</span>
                                            </div>
                                        )}
                                        <div className="w-full relative z-30 mb-4">
                                            <div className="relative">
                                                <select className="w-full appearance-none bg-[#1a1a1a] border border-white/20 text-white text-sm font-bold rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-[#00b4ff] transition-colors truncate" value={car?.model || ""} onChange={e => handleCarSelect(idx, e.target.value)}>
                                                    <option value="">{t('simulator.selectVehicle')}</option>
                                                    {CAR_DB.map(c => <option key={c.model} value={c.model}>{c.brand} {c.model}</option>)}
                                                </select>
                                                <ChevronDown className="w-4 h-4 text-[#a0a0a0] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        </div>
                                        {!car ? (
                                            <div className="flex-1 flex flex-col items-center justify-center opacity-50 text-center space-y-2 py-10 w-full mb-auto z-10">
                                                <div className="w-12 h-12 rounded-full border border-dashed border-white/30 flex items-center justify-center">
                                                    <span className="text-white/50 text-xl">+</span>
                                                </div>
                                                <p className="text-sm text-white">{t('simulator.selectAVehicle')}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-center mb-4 z-10">
                                                    <p className="text-sm text-white mb-1">{t('simulator.save')}</p>
                                                    <p className="text-2xl md:text-3xl font-black text-[#00b4ff]">
                                                        {currencySymbol} {annualSavings.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US')}<span className="text-xs text-[#00b4ff]/80">{t('simulator.perYear')}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-end justify-center gap-3 md:gap-4 h-32 w-full mb-4 relative z-10">
                                                    <div className="absolute inset-0 border-b border-white/10 z-0" />
                                                    <div className="w-8 md:w-10 relative z-10 flex flex-col justify-end h-full">
                                                        <div className="w-full bg-gradient-to-t from-[#00b4ff]/20 to-[#00b4ff] rounded-t-md transition-all duration-500 shadow-[0_0_15px_rgba(0,180,255,0.3)]" style={{ height: evHeight, minHeight: '10%' }} />
                                                    </div>
                                                    <div className="w-8 md:w-10 relative z-10 flex flex-col justify-end h-full">
                                                        <div className="w-full bg-gradient-to-t from-white/10 to-[#a0a0a0] rounded-t-md transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.1)]" style={{ height: gasHeight, minHeight: '20%' }} />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between w-full text-center mb-4 z-10 gap-2">
                                                    <div className="flex-1">
                                                        <p className="text-[#a0a0a0] leading-tight text-xs">{t('simulator.energyCost')}</p>
                                                        <p className="text-[#00b4ff] font-bold text-sm">{currencySymbol} {evCost.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US')}</p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[#a0a0a0] leading-tight text-xs">{t('simulator.fuelCost')}</p>
                                                        <p className="text-[#a0a0a0] font-bold text-sm">{currencySymbol} {gasCost.toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-center w-full mt-auto z-10 pb-2">
                                                    <div className="flex gap-2 mb-3">
                                                        <div className="flex-1 rounded-xl px-2 py-2" style={{ background: 'rgba(0,180,255,0.07)', border: '1px solid rgba(0,180,255,0.18)' }}>
                                                            <p className="text-[9px] uppercase tracking-widest text-[#00b4ff]/60 mb-0.5">EV · {efficiency} kWh/100km</p>
                                                            <p className="text-sm font-black text-[#00b4ff]">{currencySymbol} {costPerKm.toFixed(2).replace('.', ',')}/km</p>
                                                        </div>
                                                        <div className="flex-1 bg-white/4 rounded-xl px-2 py-2">
                                                            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">{fuelType === 'ethanol' ? 'Etanol' : 'Comb.'} · {combustionKmL.toFixed(1)} km/L</p>
                                                            <p className="text-sm font-black text-white/60">{currencySymbol} {(gasCost / kms).toFixed(2).replace('.', ',')}/km</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full mt-3 pt-3 border-t border-white/10">
                                                        <p className="text-xs text-[#a0a0a0] mb-0.5">{t('ipva.annualIpva')} · {selectedState} · <span className="text-white/60">{IPVA_BY_STATE.find(s => s.abbr === selectedState)?.bevRate === 0 ? 'Isento' : `${((IPVA_BY_STATE.find(s => s.abbr === selectedState)?.bevRate ?? 0) * 100).toFixed(1)}%`}</span></p>
                                                        <p className="font-black text-base" style={{ color: annualIpvaBev === 0 ? '#00e5a0' : 'white' }}>{annualIpvaBev === 0 ? t('ipva.exempt') : `R$ ${annualIpvaBev.toLocaleString('pt-BR')}`}</p>
                                                        {ipvaSavings > 0 && <p className="text-[10px] text-[#00e5a0]">↓ R$ {ipvaSavings.toLocaleString('pt-BR')} {t('ipva.savingsVsCombustion')}</p>}
                                                    </div>

                                                    {/* ⚙ Mini consumo personalizado por card */}
                                                    {(() => {
                                                        const catEvKwh = (() => {
                                                            if (car.cat === 'Urbano') return 12;
                                                            if (car.cat === 'SUV') return 16;
                                                            if (car.cat === 'Luxo') return 21;
                                                            if (car.cat === 'Comercial') return 22;
                                                            return 14;
                                                        })();
                                                        const catCombKmLGas = getCombustionKmL(car);
                                                        const effectiveDefaultCombKmL = fuelType === 'ethanol'
                                                            ? Math.round((catCombKmLGas / ETHANOL_FACTOR) * 10) / 10
                                                            : catCombKmLGas;
                                                        const evVal = customEvKwh[idx] ?? catEvKwh;
                                                        const combVal = customCombKmL[idx] ?? effectiveDefaultCombKmL;
                                                        const hasCustom = customEvKwh[idx] !== null || customCombKmL[idx] !== null;
                                                        return (
                                                            <div className="mt-3 pt-3 border-t border-white/8">
                                                                <button
                                                                    onClick={() => setCustomOpen(v => { const n = [...v]; n[idx] = !n[idx]; return n; })}
                                                                    className="flex items-center justify-between w-full text-[10px] text-white/30 hover:text-white/55 transition-colors"
                                                                >
                                                                    <span className="flex items-center gap-1.5">
                                                                        ⚙ Personalizar consumo
                                                                        {hasCustom && <span className="w-1.5 h-1.5 rounded-full bg-[#00b4ff]" />}
                                                                    </span>
                                                                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${customOpen[idx] ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                {customOpen[idx] && (
                                                                    <div className="mt-3 space-y-3">
                                                                        {/* EV */}
                                                                        <div>
                                                                            <div className="flex justify-between items-center mb-1.5">
                                                                                <span className="text-white/50 text-[10px]">EV <span className="text-white/25">kWh/100km</span></span>
                                                                                <div className="flex items-center gap-1">
                                                                                    <button className={stepBtn} onClick={() => setCustomEvKwh(v => { const n=[...v]; n[idx]=Math.max(5,Math.round(((n[idx]??catEvKwh)-0.5)*10)/10); return n; })}>−</button>
                                                                                    <div className="bg-[#00b4ff]/10 px-2 py-0.5 rounded-full border border-[#00b4ff]/25 text-[#00b4ff] font-mono text-[11px] flex items-center gap-1">
                                                                                        {evVal.toFixed(1)}
                                                                                        {customEvKwh[idx] !== null && <button onClick={() => setCustomEvKwh(v => { const n=[...v]; n[idx]=null; return n; })} className="text-white/30 hover:text-white/60" title="Resetar">↺</button>}
                                                                                    </div>
                                                                                    <button className={stepBtn} onClick={() => setCustomEvKwh(v => { const n=[...v]; n[idx]=Math.min(40,Math.round(((n[idx]??catEvKwh)+0.5)*10)/10); return n; })}>+</button>
                                                                                </div>
                                                                            </div>
                                                                            <input type="range" min="5" max="40" step="0.5" value={evVal} onChange={e => setCustomEvKwh(v => { const n=[...v]; n[idx]=Number(e.target.value); return n; })} className={sliderThumbClasses} style={makeSliderStyle(evVal, 5, 40)} />
                                                                            <p className="text-[9px] text-white/20 mt-1">PBEV/INMETRO · categ. {car.cat}: {catEvKwh} kWh/100km</p>
                                                                        </div>
                                                                        {/* Combustão */}
                                                                        <div>
                                                                            <div className="flex justify-between items-center mb-1.5">
                                                                                <span className="text-white/50 text-[10px]">Combustão <span className="text-white/25">km/L · {fuelType === 'ethanol' ? 'etanol' : 'gasolina'}</span></span>
                                                                                <div className="flex items-center gap-1">
                                                                                    <button className={stepBtn} onClick={() => setCustomCombKmL(v => { const n=[...v]; n[idx]=Math.max(2,Math.round(((n[idx]??effectiveDefaultCombKmL)-0.5)*10)/10); return n; })}>−</button>
                                                                                    <div className={`px-2 py-0.5 rounded-full font-mono text-[11px] flex items-center gap-1 transition-colors ${fuelType === 'ethanol' ? 'bg-[#00e5a0]/10 border border-[#00e5a0]/25 text-[#00e5a0]' : 'bg-[#ff8c52]/10 border border-[#ff8c52]/25 text-[#ff8c52]'}`}>
                                                                                        {combVal.toFixed(1)}
                                                                                        {customCombKmL[idx] !== null && <button onClick={() => setCustomCombKmL(v => { const n=[...v]; n[idx]=null; return n; })} className="text-white/30 hover:text-white/60" title="Resetar">↺</button>}
                                                                                    </div>
                                                                                    <button className={stepBtn} onClick={() => setCustomCombKmL(v => { const n=[...v]; n[idx]=Math.min(25,Math.round(((n[idx]??effectiveDefaultCombKmL)+0.5)*10)/10); return n; })}>+</button>
                                                                                </div>
                                                                            </div>
                                                                            <input type="range" min="2" max="25" step="0.5" value={combVal} onChange={e => setCustomCombKmL(v => { const n=[...v]; n[idx]=Number(e.target.value); return n; })} className={sliderThumbClasses} style={makeSliderStyle(combVal, 2, 25)} />
                                                                            <p className="text-[9px] text-white/20 mt-1">PBEV/INMETRO · categ. {car.cat}: {catCombKmLGas} km/L (gas){fuelType === 'ethanol' ? ` · ${effectiveDefaultCombKmL.toFixed(1)} km/L (etanol)` : ''}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── TAB: TCO 5 ANOS ───────────────────────────────────────────────── */}
                    {tab === 'tco' && (
                        <div ref={tcoRef} className="flex flex-col gap-6">
                            {selectedCars.map((car, idx) => {
                                if (!car) return (
                                    <div key={idx} className="flex flex-col items-center justify-center bg-[#111] rounded-3xl p-6 border border-white/10 opacity-40">
                                        <div className="w-full relative z-30 mb-4">
                                            <div className="relative">
                                                <select className="w-full appearance-none bg-[#1a1a1a] border border-white/20 text-white text-sm font-bold rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-[#00b4ff] transition-colors" value="" onChange={e => handleCarSelect(idx, e.target.value)}>
                                                    <option value="">{t('simulator.selectVehicle')}</option>
                                                    {CAR_DB.map(c => <option key={c.model} value={c.model}>{c.brand} {c.model}</option>)}
                                                </select>
                                                <ChevronDown className="w-4 h-4 text-[#a0a0a0] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                );

                                const tco: TCOResult = calcTCO(car, { kms, gasPrice, blendedKwhPrice, fuelType, selectedState, customEvKwh: customEvKwh[idx], customCombKmL: customCombKmL[idx] });
                                const isBest = idx === bestIndex;

                                const ROW_LABELS = [
                                    t('simulator.energyRow'),
                                    t('simulator.insuranceRow'),
                                    t('simulator.maintRow'),
                                    t('simulator.ipvaRow'),
                                    t('simulator.totalRow'),
                                ];

                                return (
                                    <div key={idx} className={`bg-[#111] rounded-3xl overflow-hidden border ${isBest ? 'border-[#00e5a0] shadow-[0_0_20px_rgba(0,229,160,0.2)]' : 'border-white/10'}`}>

                                        {/* Car selector */}
                                        <div className="px-5 pt-5 pb-3">
                                            <div className="relative">
                                                <select className="w-full appearance-none bg-[#1a1a1a] border border-white/20 text-white text-sm font-bold rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-[#00b4ff] transition-colors" value={car.model} onChange={e => handleCarSelect(idx, e.target.value)}>
                                                    {CAR_DB.map(c => <option key={c.model} value={c.model}>{c.brand} {c.model}</option>)}
                                                </select>
                                                <ChevronDown className="w-4 h-4 text-[#a0a0a0] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* TCO summary tiles */}
                                        <div className="px-5 pb-4 flex flex-wrap gap-3">
                                            <div className="bg-white/4 rounded-xl px-3 py-2 text-center">
                                                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">{t('details.estimatedPrice')}</p>
                                                <p className="text-sm font-black text-white">{fmtBRL(car.price)}</p>
                                            </div>
                                            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(0,180,255,0.07)', border: '1px solid rgba(0,180,255,0.18)' }}>
                                                <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(0,180,255,0.6)' }}>{t('simulator.totalEV4y')}</p>
                                                <p className="text-sm font-black" style={{ color: '#00b4ff' }}>{fmtBRL(tco.totalEV4y)}</p>
                                            </div>
                                            <div className="bg-white/4 rounded-xl px-3 py-2 text-center">
                                                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">{t('simulator.totalComb4y')}</p>
                                                <p className="text-sm font-black text-white/60">{fmtBRL(tco.totalComb4y)}</p>
                                            </div>
                                            <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.2)' }}>
                                                <p className="text-[10px] uppercase tracking-widest mb-0.5 text-[#00e5a0]/60">{t('simulator.totalSavings4y')}</p>
                                                <p className="text-sm font-black text-[#00e5a0]">{fmtBRL(tco.totalSavings4y)}</p>
                                            </div>
                                        </div>

                                        {/* 4-year table */}
                                        <div className="overflow-x-auto px-5 pb-5">
                                            <table className="w-full text-xs min-w-[480px]">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left text-[10px] uppercase tracking-widest text-white/30 py-2 pr-3 font-medium w-28" />
                                                        {tco.years.map(y => (
                                                            <th key={y.year} className="text-center text-[10px] uppercase tracking-widest text-white/40 py-2 px-2 font-medium">
                                                                {t('simulator.year')} {y.year}
                                                            </th>
                                                        ))}
                                                        <th className="text-center text-[10px] uppercase tracking-widest text-white/40 py-2 px-2 font-bold">{t('simulator.total5y')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {([
                                                        { label: ROW_LABELS[0], evKey: 'energyEV',    combKey: 'energyComb'    },
                                                        { label: ROW_LABELS[1], evKey: 'insuranceEV', combKey: 'insuranceComb' },
                                                        { label: ROW_LABELS[2], evKey: 'maintEV',     combKey: 'maintComb'     },
                                                        { label: ROW_LABELS[3], evKey: 'ipvaEV',      combKey: 'ipvaComb'      },
                                                    ] as { label: string; evKey: keyof typeof tco.years[0]; combKey: keyof typeof tco.years[0] }[]).map(row => (
                                                        <React.Fragment key={row.label}>
                                                            {/* EV row */}
                                                            <tr className="border-t border-white/5">
                                                                <td className="py-1 pr-3 w-28">
                                                                    <div className="text-[#00b4ff] font-bold text-xs">{row.label}</div>
                                                                    <div className="text-[10px] text-[#00b4ff]/50 mt-0.5">EV</div>
                                                                </td>
                                                                {tco.years.map(y => (
                                                                    <td key={y.year} className="text-center py-1 px-2 text-[#00b4ff] font-medium">
                                                                        {fmtBRL(y[row.evKey] as number)}
                                                                    </td>
                                                                ))}
                                                                <td className="text-center py-1 px-2 text-[#00b4ff] font-bold">
                                                                    {fmtBRL(tco.years.reduce((s, y) => s + (y[row.evKey] as number), 0))}
                                                                </td>
                                                            </tr>
                                                            {/* Combustion row */}
                                                            <tr>
                                                                <td className="py-1 pr-3">
                                                                    <div className="text-[10px] text-white/25">Comb.</div>
                                                                </td>
                                                                {tco.years.map(y => (
                                                                    <td key={y.year} className="text-center py-1 px-2 text-white/35 font-medium">
                                                                        {fmtBRL(y[row.combKey] as number)}
                                                                    </td>
                                                                ))}
                                                                <td className="text-center py-1 px-2 text-white/35">
                                                                    {fmtBRL(tco.years.reduce((s, y) => s + (y[row.combKey] as number), 0))}
                                                                </td>
                                                            </tr>
                                                        </React.Fragment>
                                                    ))}

                                                    {/* Total row */}
                                                    <tr className="border-t-2 border-white/15">
                                                        <td className="py-2 pr-3 font-black text-xs uppercase tracking-wider text-white">{ROW_LABELS[4]}</td>
                                                        {tco.years.map(y => (
                                                            <td key={y.year} className="text-center py-2 px-2">
                                                                <div className="text-[#00b4ff] font-black">{fmtBRL(y.totalEV)}</div>
                                                                <div className="text-white/35 text-xs">{fmtBRL(y.totalComb)}</div>
                                                            </td>
                                                        ))}
                                                        <td className="text-center py-2 px-2">
                                                            <div className="text-[#00b4ff] font-black">{fmtBRL(tco.totalEV4y)}</div>
                                                            <div className="text-white/35 text-xs">{fmtBRL(tco.totalComb4y)}</div>
                                                        </td>
                                                    </tr>

                                                    {/* Savings row */}
                                                    <tr className="border-t border-[#00e5a0]/20 bg-[#00e5a0]/5">
                                                        <td className="py-2 pr-3 font-black text-xs uppercase tracking-wider text-[#00e5a0]">{t('simulator.savingsRow')}</td>
                                                        {tco.years.map(y => (
                                                            <td key={y.year} className="text-center py-2 px-2 font-black text-[#00e5a0]">{fmtBRL(y.savingsEV)}</td>
                                                        ))}
                                                        <td className="text-center py-2 px-2 font-black text-[#00e5a0] text-sm">{fmtBRL(tco.totalSavings4y)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Legend */}
                                        <div className="px-5 pb-4 flex gap-4 text-xs">
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00b4ff]" />{car.brand} {car.model} (EV)</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/30" />{t('simulator.combustionEquiv')} {car.cat}</span>
                                        </div>

                                        {/* Notes */}
                                        <div className="px-5 pb-4 space-y-1">
                                            <p className="text-xs text-white/25">{t('simulator.deprNote')}</p>
                                            <p className="text-xs text-white/25">{t('simulator.insNote')}</p>
                                            <p className="text-xs text-white/25">{t('simulator.maintNote')}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Export button */}
                            <button
                                onClick={handleExportTCO}
                                disabled={isExporting}
                                className="w-full py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.25)', color: '#00e5a0' }}
                            >
                                <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
                                {isExporting ? 'Gerando imagem...' : t('simulator.exportBtn')}
                            </button>

                        </div>
                    )}

                    {/* ── COLLAPSIBLE METHODOLOGY NOTE ───────────────────────────────────── */}
                    <div className="mt-6 rounded-2xl border border-white/8 overflow-hidden">
                        <button
                            onClick={() => setMethodologyOpen(o => !o)}
                            className="w-full flex items-center justify-between px-4 py-3 text-white/35 hover:text-white/60 transition-colors"
                        >
                            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                                <Info className="w-3.5 h-3.5" />
                                Como este cálculo funciona
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${methodologyOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {methodologyOpen && (
                            <div className="px-4 pb-4 space-y-4 text-xs leading-relaxed border-t border-white/6">

                                {/* ⚠ Aviso de consumo personalizado ativo */}
                                {(() => {
                                    const active = selectedCars
                                        .map((car, idx) => ({ car, idx, evKwh: customEvKwh[idx], combKmL: customCombKmL[idx] }))
                                        .filter(({ car, evKwh, combKmL }) => car && (evKwh !== null || combKmL !== null));
                                    if (active.length === 0) return null;
                                    const totalActive = selectedCars.filter(Boolean).length;
                                    return (
                                        <div className="mt-3 rounded-xl p-3 space-y-2" style={{ background: 'rgba(0,180,255,0.06)', border: '1px solid rgba(0,180,255,0.18)' }}>
                                            <p className="text-[10px] font-bold text-[#00b4ff]/70 uppercase tracking-wider">⚠ Consumo personalizado ativo</p>
                                            {active.map(({ car, idx, evKwh, combKmL }) => (
                                                <p key={idx} className="text-[10px] text-white/50">
                                                    <span className="text-white/70 font-semibold">{car!.brand} {car!.model}</span>
                                                    {evKwh !== null && <span> · EV: <span className="text-[#00b4ff]">{evKwh.toFixed(1)} kWh/100km</span></span>}
                                                    {combKmL !== null && <span> · Comb.: <span className={fuelType === 'ethanol' ? 'text-[#00e5a0]' : 'text-[#ff8c52]'}>{combKmL.toFixed(1)} km/L</span></span>}
                                                </p>
                                            ))}
                                            {active.length < totalActive && (
                                                <p className="text-[9px] text-white/25">Os demais veículos usam os defaults PBEV/INMETRO por categoria.</p>
                                            )}
                                        </div>
                                    );
                                })()}

                                {tab === 'savings' ? (<>
                                    <div className="pt-3">
                                        <p className="font-bold text-white/60 mb-2">Aba Economia Mensal — o que está incluído</p>
                                        <div className="space-y-1.5">
                                            <p className="flex gap-2"><span className="text-[#00b4ff]">✓</span><span className="text-white/50"><strong className="text-white/70">Energia/Combustível:</strong> base do cálculo. EV = (km ÷ 100) × kWh/100km × taxa mista; Combustão = (km ÷ km/L) × preço/L.</span></p>
                                            <p className="flex gap-2"><span className="text-white/25">○</span><span className="text-white/35"><strong>IPVA:</strong> exibido separadamente por estado — não entra no número "Economize R$".</span></p>
                                            <p className="flex gap-2"><span className="text-white/20">✗</span><span className="text-white/30 line-through">Seguro, Manutenção, Depreciação</span><span className="text-white/30 no-underline ml-1">→ veja a aba TCO 4 Anos.</span></p>
                                        </div>
                                    </div>
                                    {(() => {
                                        const refFuel = getDefaultFuelPrice(selectedState, fuelType);
                                        const refElec = ELECTRICITY_PRICES_BY_STATE[selectedState];
                                        const fuelAdjusted = Math.abs(gasPrice - refFuel) > 0.01;
                                        const elecAdjusted = refElec !== undefined && Math.abs(kwhPrice - refElec) > 0.01;
                                        return (
                                            <div className="bg-white/3 rounded-xl p-3 space-y-2">
                                                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Preços de referência · {selectedState}</p>
                                                <p className="text-white/25 text-xs">
                                                    <span className="text-white/40 font-semibold">{fuelType === 'ethanol' ? 'Etanol' : 'Gasolina'}:</span>{' '}
                                                    {currencySymbol} {refFuel.toFixed(2).replace('.', ',')} /L · ANP {FUEL_PRICES_UPDATED}
                                                    {fuelType === 'ethanol' && <span className="text-[#00e5a0]/60"> · +30% consumo vs. gasolina</span>}
                                                    {fuelAdjusted && (
                                                        <span className="ml-1.5 text-[#f5c842]">⚠ usando {currencySymbol} {gasPrice.toFixed(2).replace('.', ',')} /L (ajustado)</span>
                                                    )}
                                                </p>
                                                <p className="text-white/25 text-xs">
                                                    <span className="text-white/40 font-semibold">Energia residencial:</span>{' '}
                                                    {currencySymbol} {refElec?.toFixed(2).replace('.', ',') ?? '—'} /kWh (B1 residencial, sem ICMS) · ANEEL {ELECTRICITY_PRICES_UPDATED}
                                                    {elecAdjusted && (
                                                        <span className="ml-1.5 text-[#f5c842]">⚠ usando {currencySymbol} {kwhPrice.toFixed(2).replace('.', ',')} /kWh (ajustado)</span>
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    })()}
                                    <div className="bg-white/3 rounded-xl p-3 space-y-2">
                                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Consumos médios estimados por categoria de veículo (fonte PBEV/INMETRO)</p>
                                        <p className="text-white/25 text-xs"><span className="text-white/40 font-semibold">Combustão:</span> categ. Urbano 12 km/L · categ. Compacto/Sedan 11 km/L · categ. SUV 9,5 km/L · categ. Luxo 8 km/L · categ. Comercial 7,5 km/L. Etanol: +30% consumo volumétrico (÷1,30).</p>
                                        <p className="text-white/25 text-xs"><span className="text-white/40 font-semibold">EV:</span> categ. Urbano 12 kWh/100km · categ. Compacto/Sedan 14 kWh/100km · categ. SUV 16 kWh/100km · categ. Luxo 21 kWh/100km · categ. Comercial 22 kWh/100km.</p>
                                    </div>
                                </>) : (<>
                                    <div className="pt-3">
                                        <p className="font-bold text-white/60 mb-2">Aba TCO 4 Anos — o que está incluído</p>
                                        <div className="space-y-1.5">
                                            <p className="flex gap-2"><span className="text-[#00e5a0]">✓</span><span className="text-white/50"><strong className="text-white/70">Energia:</strong> mesmo cálculo da aba mensal, anualizado (×12).</span></p>
                                            <p className="flex gap-2"><span className="text-[#00e5a0]">✓</span><span className="text-white/50"><strong className="text-white/70">Seguro:</strong> 3,3% a.a. (EV) · 2,5% a.a. (combustão), sobre o valor depreciado de cada ano.</span></p>
                                            <p className="flex gap-2"><span className="text-[#00e5a0]">✓</span><span className="text-white/50"><strong className="text-white/70">Manutenção:</strong> proporcional ao km — revisão a cada 20.000 km (EV) e 10.000 km (combustão). Sem troca de óleo para EV.</span></p>
                                            <p className="flex gap-2"><span className="text-[#00e5a0]">✓</span><span className="text-white/50"><strong className="text-white/70">IPVA:</strong> calculado por estado sobre o valor depreciado do ano. Combustão: alíquota padrão SP 4%.</span></p>
                                            <p className="flex gap-2"><span className="text-[#00e5a0]">✓</span><span className="text-white/50"><strong className="text-white/70">Depreciação:</strong> EV 9,5% a.a. · Combustão 7,0% a.a. (linear, base para seguro e IPVA).</span></p>
                                        </div>
                                    </div>
                                    {(() => {
                                        const refFuel = getDefaultFuelPrice(selectedState, fuelType);
                                        const refElec = ELECTRICITY_PRICES_BY_STATE[selectedState];
                                        const fuelAdjusted = Math.abs(gasPrice - refFuel) > 0.01;
                                        const elecAdjusted = refElec !== undefined && Math.abs(kwhPrice - refElec) > 0.01;
                                        return (
                                            <div className="bg-white/3 rounded-xl p-3 space-y-2">
                                                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Preços de referência · {selectedState}</p>
                                                <p className="text-white/25 text-xs">
                                                    <span className="text-white/40 font-semibold">{fuelType === 'ethanol' ? 'Etanol' : 'Gasolina'}:</span>{' '}
                                                    {currencySymbol} {refFuel.toFixed(2).replace('.', ',')} /L · ANP {FUEL_PRICES_UPDATED}
                                                    {fuelType === 'ethanol' && <span className="text-[#00e5a0]/60"> · +30% consumo vs. gasolina</span>}
                                                    {fuelAdjusted && (
                                                        <span className="ml-1.5 text-[#f5c842]">⚠ usando {currencySymbol} {gasPrice.toFixed(2).replace('.', ',')} /L (ajustado)</span>
                                                    )}
                                                </p>
                                                <p className="text-white/25 text-xs">
                                                    <span className="text-white/40 font-semibold">Energia residencial:</span>{' '}
                                                    {currencySymbol} {refElec?.toFixed(2).replace('.', ',') ?? '—'} /kWh (B1 residencial, sem ICMS) · ANEEL {ELECTRICITY_PRICES_UPDATED}
                                                    {elecAdjusted && (
                                                        <span className="ml-1.5 text-[#f5c842]">⚠ usando {currencySymbol} {kwhPrice.toFixed(2).replace('.', ',')} /kWh (ajustado)</span>
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    })()}
                                    <div className="bg-white/3 rounded-xl p-3 space-y-2">
                                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Consumos médios estimados por categoria de veículo (fonte PBEV/INMETRO)</p>
                                        <p className="text-white/25 text-xs"><span className="text-white/40 font-semibold">Combustão:</span> categ. Urbano 12 km/L · categ. Compacto/Sedan 11 km/L · categ. SUV 9,5 km/L · categ. Luxo 8 km/L · categ. Comercial 7,5 km/L. Etanol: +30% consumo volumétrico (÷1,30).</p>
                                        <p className="text-white/25 text-xs"><span className="text-white/40 font-semibold">EV:</span> categ. Urbano 12 kWh/100km · categ. Compacto/Sedan 14 kWh/100km · categ. SUV 16 kWh/100km · categ. Luxo 21 kWh/100km · categ. Comercial 22 kWh/100km.</p>
                                    </div>
                                </>)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
