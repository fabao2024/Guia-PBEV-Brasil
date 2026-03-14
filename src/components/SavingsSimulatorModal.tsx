import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronDown, Download, TrendingDown, Zap } from 'lucide-react';
import { CAR_DB } from '../constants';
import { Car } from '../types';
import { IPVA_BY_STATE, calcIpva, STANDARD_COMBUSTION_IPVA_RATE, IPVA_DATA_UPDATED } from '../constants/ipvaByState';
import { track } from '../utils/analytics';
import { calcTCO, TCOResult } from '../utils/tco';

interface SavingsSimulatorModalProps {
    onClose: () => void;
}

type Tab = 'savings' | 'tco';

export default function SavingsSimulatorModal({ onClose }: SavingsSimulatorModalProps) {
    const { t } = useTranslation();
    const tcoRef = useRef<HTMLDivElement>(null);

    // ── Shared state ──────────────────────────────────────────────────────────
    const [tab, setTab] = useState<Tab>('savings');
    const [kms, setKms] = useState<number>(1500);
    const [gasPrice, setGasPrice] = useState<number>(6.00);
    const [kwhPrice, setKwhPrice] = useState<number>(1.00);
    const [dcKwhPrice, setDcKwhPrice] = useState<number>(2.50);
    const [dcPercent, setDcPercent] = useState<number>(20);
    const [currency, setCurrency] = useState<'BRL' | 'USD'>('BRL');
    const [selectedState, setSelectedState] = useState<string>(
        () => localStorage.getItem('selectedState') ?? 'SP'
    );
    const [selectedCars, setSelectedCars] = useState<(Car | null)[]>([null, null, null]);

    // ── TCO-specific state ────────────────────────────────────────────────────
    const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
    const [loanRate, setLoanRate] = useState<number>(1.49);
    const [loanMonths, setLoanMonths] = useState<number>(48);

    useEffect(() => { localStorage.setItem('selectedState', selectedState); }, [selectedState]);
    useEffect(() => { track('Simulator Used', { state: selectedState }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { setSelectedCars([CAR_DB[0] || null, CAR_DB[1] || null, CAR_DB[2] || null]); }, []);

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
        const next = [...selectedCars];
        next[index] = car;
        setSelectedCars(next);
    };

    const getEfficiency = (car: Car) => {
        if (car.cat === 'Urbano') return 12;
        if (car.cat === 'SUV') return 16;
        if (car.cat === 'Luxo') return 21;
        if (car.cat === 'Comercial') return 22;
        return 14;
    };
    const getCombustionKmL = (car: Car) => {
        if (car.cat === 'Urbano') return 12.0;
        if (car.cat === 'SUV') return 9.5;
        if (car.cat === 'Luxo') return 8.0;
        if (car.cat === 'Comercial') return 7.5;
        return 11.0;
    };

    const savingsArray = selectedCars.map(car => {
        if (!car) return 0;
        const evCost = Math.round((kms / 100) * getEfficiency(car) * blendedKwhPrice);
        const gasCost = Math.round((kms / getCombustionKmL(car)) * gasPrice);
        return (gasCost - evCost) * 12;
    });
    const maxSavings = Math.max(...savingsArray);
    const bestIndex = savingsArray.indexOf(maxSavings);

    const makeSliderStyle = (value: number, min: number, max: number) => ({
        background: `linear-gradient(to right, #00b4ff ${(value - min) / (max - min) * 100}%, rgba(255,255,255,0.2) ${(value - min) / (max - min) * 100}%)`
    });
    const sliderThumbClasses = "w-full h-1.5 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,180,255,0.5)] [&::-webkit-slider-thumb]:cursor-pointer";

    const handleExportTCO = useCallback(async () => {
        if (!tcoRef.current) return;
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(tcoRef.current, {
                backgroundColor: '#0a0b12',
                scale: 2,
                useCORS: true,
            });
            const link = document.createElement('a');
            link.download = `tco-guiapbev-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            track('TCO Export', { cars: selectedCars.filter(Boolean).map(c => c!.model).join(',') });
        } catch (e) {
            console.error('Export failed', e);
        }
    }, [selectedCars]);

    const fmtBRL = (v: number) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;

    return (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-0 sm:p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
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
                            {t('simulator.title')}<br /><span className="text-[#00b4ff]">{t('simulator.titlePBEV')}</span>
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

                    {/* ── SHARED SLIDERS ─────────────────────────────────────────────────── */}
                    <div className="bg-[#111111]/80 backdrop-blur-md border-[2px] border-white/10 rounded-3xl p-5 md:p-6 mb-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.05),0_0_30px_rgba(0,180,255,0.1)] space-y-6">

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm">{t('simulator.monthlyKms')}</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{kms.toLocaleString()} km</div>
                            </div>
                            <input type="range" min="100" max="10000" step="100" value={kms} onChange={e => setKms(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(kms, 100, 10000)} />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm">{t('simulator.gasPrice')} /L</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{currencySymbol} {gasPrice.toFixed(2).replace('.', ',')}</div>
                            </div>
                            <input type="range" min="1" max="10" step="0.01" value={gasPrice} onChange={e => setGasPrice(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(gasPrice, 1, 10)} />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm">{t('simulator.kwhPrice')} (AC) /kWh</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{currencySymbol} {kwhPrice.toFixed(2).replace('.', ',')}</div>
                            </div>
                            <input type="range" min="0" max="10" step="0.01" value={kwhPrice} onChange={e => setKwhPrice(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(kwhPrice, 0, 10)} />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm">{t('simulator.dcKwhPrice')} /kWh</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{currencySymbol} {dcKwhPrice.toFixed(2).replace('.', ',')}</div>
                            </div>
                            <input type="range" min="0" max="10" step="0.01" value={dcKwhPrice} onChange={e => setDcKwhPrice(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(dcKwhPrice, 0, 10)} />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white text-sm">{t('simulator.dcPercent')}</span>
                                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{dcPercent}%</div>
                            </div>
                            <input type="range" min="0" max="100" step="1" value={dcPercent} onChange={e => setDcPercent(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(dcPercent, 0, 100)} />
                            <p className="text-[10px] text-[#666666] mt-2 text-right">
                                {t('simulator.blendedRate')}: {currencySymbol} {blendedKwhPrice.toFixed(2).replace('.', ',')}/kWh
                            </p>
                        </div>

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
                            <p className="text-[10px] text-[#555] mt-2 text-right">{'⚠'} Dados de {IPVA_DATA_UPDATED}. Consulte a Sefaz do seu estado.</p>
                        </div>

                        {/* TCO-only: financing sliders */}
                        {tab === 'tco' && (
                            <div className="border-t border-white/10 pt-6 space-y-5">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-[#00e5a0]">{t('simulator.financing')}</p>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-white text-sm">{t('simulator.downPayment')}</span>
                                        <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{downPaymentPct}%</div>
                                    </div>
                                    <input type="range" min="0" max="50" step="5" value={downPaymentPct} onChange={e => setDownPaymentPct(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(downPaymentPct, 0, 50)} />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-white text-sm">{t('simulator.loanRate')}</span>
                                        <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{loanRate.toFixed(2).replace('.', ',')}%</div>
                                    </div>
                                    <input type="range" min="0.5" max="5" step="0.01" value={loanRate} onChange={e => setLoanRate(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(loanRate, 0.5, 5)} />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-white text-sm">{t('simulator.loanMonths')}</span>
                                        <div className="bg-white/10 px-3 py-1 rounded-full border border-white/20 text-white font-mono text-sm">{loanMonths} {t('simulator.months')}</div>
                                    </div>
                                    <input type="range" min="12" max="72" step="12" value={loanMonths} onChange={e => setLoanMonths(Number(e.target.value))} className={sliderThumbClasses} style={makeSliderStyle(loanMonths, 12, 72)} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── TAB: ECONOMIA MENSAL ───────────────────────────────────────────── */}
                    {tab === 'savings' && (
                        <div className="flex flex-col md:flex-row gap-4">
                            {selectedCars.map((car, idx) => {
                                const isBest = car && idx === bestIndex && maxSavings > 0;
                                const efficiency = car ? getEfficiency(car) : 0;
                                const combustionKmL = car ? getCombustionKmL(car) : 0;
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
                                                    <option value="" disabled>{t('simulator.selectVehicle')}</option>
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
                                                    <p className="text-sm text-[#a0a0a0] mb-0.5">{t('simulator.costPerKm')}</p>
                                                    <p className="text-white font-black text-lg md:text-xl mb-3">{currencySymbol} {costPerKm.toFixed(2).replace('.', ',')}</p>
                                                    <p className="text-xs text-[#a0a0a0] mb-0.5">{t('simulator.efficiency')}</p>
                                                    <p className="text-white font-bold text-sm">{efficiency} kWh/100km</p>
                                                    <div className="w-full mt-3 pt-3 border-t border-white/10">
                                                        <p className="text-xs text-[#a0a0a0] mb-0.5">{t('ipva.annualIpva')} · {selectedState} · <span className="text-white/60">{IPVA_BY_STATE.find(s => s.abbr === selectedState)?.bevRate === 0 ? 'Isento' : `${((IPVA_BY_STATE.find(s => s.abbr === selectedState)?.bevRate ?? 0) * 100).toFixed(1)}%`}</span></p>
                                                        <p className="font-black text-base" style={{ color: annualIpvaBev === 0 ? '#00e5a0' : 'white' }}>{annualIpvaBev === 0 ? t('ipva.exempt') : `R$ ${annualIpvaBev.toLocaleString('pt-BR')}`}</p>
                                                        {ipvaSavings > 0 && <p className="text-[10px] text-[#00e5a0]">↓ R$ {ipvaSavings.toLocaleString('pt-BR')} {t('ipva.savingsVsCombustion')}</p>}
                                                    </div>
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
                                                    <option value="" disabled>{t('simulator.selectVehicle')}</option>
                                                    {CAR_DB.map(c => <option key={c.model} value={c.model}>{c.brand} {c.model}</option>)}
                                                </select>
                                                <ChevronDown className="w-4 h-4 text-[#a0a0a0] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                );

                                const tco: TCOResult = calcTCO(car, { kms, gasPrice, blendedKwhPrice, downPaymentPct, loanRateMonthly: loanRate, loanMonths, selectedState });
                                const isBest = idx === bestIndex;

                                const ROW_LABELS = [
                                    t('simulator.energyRow'),
                                    t('simulator.insuranceRow'),
                                    t('simulator.maintRow'),
                                    t('simulator.ipvaRow'),
                                    t('simulator.financingRow'),
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

                                        {/* Financing summary */}
                                        <div className="px-5 pb-4 flex flex-wrap gap-3">
                                            <div className="bg-white/4 rounded-xl px-3 py-2 text-center">
                                                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-0.5">{t('simulator.downPayment')}</p>
                                                <p className="text-sm font-black text-white">{fmtBRL(car.price * downPaymentPct / 100)}</p>
                                            </div>
                                            <div className="bg-white/4 rounded-xl px-3 py-2 text-center">
                                                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-0.5">{t('simulator.monthlyPayment')}</p>
                                                <p className="text-sm font-black text-[#00b4ff]">{fmtBRL(tco.monthlyPayment)}/mês</p>
                                            </div>
                                            <div className="bg-white/4 rounded-xl px-3 py-2 text-center">
                                                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-0.5">{t('simulator.totalInterest')}</p>
                                                <p className="text-sm font-black text-[#ff8c52]">{fmtBRL(tco.totalInterestPaid)}</p>
                                            </div>
                                        </div>

                                        {/* 5-year table */}
                                        <div className="overflow-x-auto px-5 pb-5">
                                            <table className="w-full text-xs min-w-[480px]">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left text-[9px] uppercase tracking-widest text-white/30 py-2 pr-3 font-medium w-28" />
                                                        {tco.years.map(y => (
                                                            <th key={y.year} className="text-center text-[9px] uppercase tracking-widest text-white/40 py-2 px-2 font-medium">
                                                                {t('simulator.year')} {y.year}
                                                            </th>
                                                        ))}
                                                        <th className="text-center text-[9px] uppercase tracking-widest text-white/40 py-2 px-2 font-bold">{t('simulator.total5y')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {([
                                                        { label: ROW_LABELS[0], evKey: 'energyEV', combKey: 'energyComb' },
                                                        { label: ROW_LABELS[1], evKey: 'insuranceEV', combKey: 'insuranceComb' },
                                                        { label: ROW_LABELS[2], evKey: 'maintEV', combKey: 'maintComb' },
                                                        { label: ROW_LABELS[3], evKey: 'ipvaEV', combKey: 'ipvaComb' },
                                                        { label: ROW_LABELS[4], evKey: 'financingEV', combKey: 'financingEV' },
                                                    ] as { label: string; evKey: keyof typeof tco.years[0]; combKey: keyof typeof tco.years[0] }[]).map(row => (
                                                        <React.Fragment key={row.label}>
                                                            {/* EV row */}
                                                            <tr className="border-t border-white/5">
                                                                <td className="py-1.5 pr-3 text-[#00b4ff] font-bold text-[10px]" rowSpan={2}>{row.label}</td>
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
                                                        <td className="py-2 pr-3 font-black text-[10px] uppercase tracking-wider text-white">{ROW_LABELS[5]}</td>
                                                        {tco.years.map(y => (
                                                            <td key={y.year} className="text-center py-2 px-2">
                                                                <div className="text-[#00b4ff] font-black">{fmtBRL(y.totalEV)}</div>
                                                                <div className="text-white/35 text-[10px]">{fmtBRL(y.totalComb)}</div>
                                                            </td>
                                                        ))}
                                                        <td className="text-center py-2 px-2">
                                                            <div className="text-[#00b4ff] font-black">{fmtBRL(tco.totalEV5y)}</div>
                                                            <div className="text-white/35 text-[10px]">{fmtBRL(tco.totalComb5y)}</div>
                                                        </td>
                                                    </tr>

                                                    {/* Savings row */}
                                                    <tr className="border-t border-[#00e5a0]/20 bg-[#00e5a0]/5">
                                                        <td className="py-2 pr-3 font-black text-[10px] uppercase tracking-wider text-[#00e5a0]">{t('simulator.savingsRow')}</td>
                                                        {tco.years.map(y => (
                                                            <td key={y.year} className="text-center py-2 px-2 font-black text-[#00e5a0]">{fmtBRL(y.savingsEV)}</td>
                                                        ))}
                                                        <td className="text-center py-2 px-2 font-black text-[#00e5a0] text-sm">{fmtBRL(tco.totalSavings5y)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Legend */}
                                        <div className="px-5 pb-4 flex gap-4 text-[10px]">
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00b4ff]" />{car.brand} {car.model} (EV)</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/30" />{t('simulator.combustionEquiv')} {car.cat}</span>
                                        </div>

                                        {/* Notes */}
                                        <div className="px-5 pb-4 space-y-1">
                                            <p className="text-[10px] text-white/25">{t('simulator.insNote')}</p>
                                            <p className="text-[10px] text-white/25">{t('simulator.maintNote')}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Export button */}
                            <button
                                onClick={handleExportTCO}
                                className="w-full py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.99]"
                                style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.25)', color: '#00e5a0' }}
                            >
                                <Download className="w-4 h-4" />
                                {t('simulator.exportBtn')}
                            </button>

                            <p className="text-center text-[10px] text-[#444] uppercase tracking-widest">{t('simulator.tcoDisclaimer')}</p>
                        </div>
                    )}

                    {tab === 'savings' && (
                        <p className="text-center text-[10px] text-[#444444] mt-6 uppercase tracking-widest">{t('simulator.disclaimer')}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
